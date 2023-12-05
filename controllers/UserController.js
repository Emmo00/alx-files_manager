import sha1 from 'sha1';
import dbClient from '../utils/db';

async function postNew(req, res) {
  const { email, password } = req.body;
  if (!email) return res.send({ error: 'Missing email' }).status(400);
  if (!password) return res.send({ error: 'Missing password' }).status(400);
  if (await dbClient.emailExists(email)) {
    return res.send({ error: 'Already exist' }).status(400);
  }
  const newUser = dbClient.createUser(
    email,
    sha1(password, { asString: true }),
  );
  const { id, userEmail } = newUser;
  return res.send({ id, email: userEmail }).status(201);
}

export default { postNew };
