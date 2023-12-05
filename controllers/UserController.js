import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function postNew(req, res) {
  const { email, password } = req.body;
  if (!email) return res.send({ error: 'Missing email' }).status(400);
  if (!password) return res.send({ error: 'Missing password' }).status(400);
  if (await dbClient.emailExists(email)) {
    return res.send({ error: 'Already exist' }).status(400);
  }
  const newUser = await dbClient.createUser(
    email,
    sha1(password, { asString: true }),
  );
  return res.send(newUser).status(201);
}

async function getMe(req, res) {
  const token = req.header('X-Token');
  const authToken = `auth_${token}`;
  const userId = await redisClient.get(authToken);
  if (!userId) return res.send({ error: 'Unauthorized' }).status(401);
  const user = dbClient.getUserById(userId);
  return res.send(user).status(200);
}

export default { postNew, getMe };
