import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db';
import { getUserIdFromSession } from '../utils/auth';

const userQueue = Queue('userQueue');

async function postNew(req, res) {
  const { email, password } = req.body;
  if (!email) return res.status(400).send({ error: 'Missing email' });
  if (!password) return res.status(400).send({ error: 'Missing password' });
  if (await dbClient.emailExists(email)) {
    return res.status(400).send({ error: 'Already exist' });
  }
  const newUser = await dbClient.createUser(email, sha1(password));
  userQueue.add({
    userId: newUser.id,
  });
  return res.status(201).send(newUser);
}

async function getMe(req, res) {
  const { error, userId } = await getUserIdFromSession(req);

  if (error || !userId) return res.status(401).send({ error });
  const user = await dbClient.getUserById(userId);
  if (!user) return res.status(401).send({ error: 'Unauthorized' });
  return res.status(200).send(user);
}

export default { postNew, getMe };
