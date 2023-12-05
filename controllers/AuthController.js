import sha1 from 'sha1';
import uuid from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { extractCredentials } from '../utils/auth';

async function getConnect(req, res) {
  const authHeader = req.headers.Authorization;
  if (!authHeader) return res.send({ error: 'Unauthorized' }).status(401);
  const { email, password } = extractCredentials(authHeader);
  const hashedPassword = sha1(password, { asString: true });
  if (
    !(await dbClient.emailExists(email))
    || !(await dbClient.correctPassword(email, hashedPassword))
  ) {
    return res.send({ error: 'Unauthorized' }).status(401);
  }
  const user = await dbClient.getUserByEmail(email);
  const token = uuid.v4();
  const authToken = `auth_${token}`;

  await redisClient.set(authToken, user.id, 24 * 60 * 60);
  return res.send({ token }).status(200);
}

async function getDisconnect(req, res) {
  const token = req.headers['X-Token'];
  const authToken = `auth_${token}`;
  const userId = await redisClient.get(authToken);
  if (!userId) return res.send({ error: 'Unauthorized' }).send(401);
  await redisClient.del(authToken);
  return res.status(204);
}

export default { getConnect, getDisconnect };
