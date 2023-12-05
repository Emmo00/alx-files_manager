import dbClient from '../utils/db';
import { extractCredentials } from '../utils/auth';
import sha1 from 'sha1';

export function getConnect(req, res) {
  const authHeader = req.headers['Authorization'];
  if (!authHeader) return res.send({ error: 'Unauthorized' }).status(401);
  const { email, password } = extractCredentials(authHeader);
  const hashedPassword = sha1(password, { asString: true });
  if (
    !dbClient.emailExists(email) ||
    !dbClient.correctPassword(email, hashedPassword)
  ) {
    return res.send({ error: 'Unauthorized' }).status(401);
  }
}
