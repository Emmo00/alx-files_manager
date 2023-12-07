import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { login } from '../utils/auth';

async function getConnect(req, res) {
  const { error, email } = await login(req);
  if (error) return req.send({ error }).status(401);

  const user = await dbClient.getUserByEmail(email);
  const token = uuidv4();
  const authToken = `auth_${token}`;

  await redisClient.set(authToken, user.id, 24 * 60 * 60);
  return res.send({ token }).status(200);
}

async function getDisconnect(req, res) {
  const token = req.header('X-Token');
  const authToken = `auth_${token}`;
  const userId = await redisClient.get(authToken);
  if (!userId) return res.send({ error: 'Unauthorized' }).status(401);
  await redisClient.del(authToken);
  return res.send('').status(204);
}

export default { getConnect, getDisconnect };
