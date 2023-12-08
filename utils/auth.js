import { Buffer } from 'node:buffer';
import sha1 from 'sha1';
import redisClient from './redis';
import dbClient from './db';
/* eslint-disable import/prefer-default-export */

function extractCredentials(authHeader) {
  const encoded = authHeader.split('Basic ')[1];
  const decodedHeader = Buffer.from(encoded, 'base64').toString('utf-8');
  const cred = decodedHeader.split(':');
  return { email: cred[0], password: cred[1] };
}

async function login(req) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return { error: 'Unauthorized' };
  const { email, password } = extractCredentials(authHeader);
  if (!email || !password) return { error: 'Unauthorized' };
  const hashedPassword = sha1(password);
  if (
    !(await dbClient.emailExists(email))
    || !(await dbClient.correctPassword(email, hashedPassword))
  ) {
    return { error: 'Unauthorized' };
  }
  return { email };
}

async function getUserIdFromSession(req) {
  const token = req.header('X-Token');
  const authToken = `auth_${token}`;
  const userId = await redisClient.get(authToken);
  if (!userId) return { error: 'Unauthorized' };
  return { userId };
}

export { extractCredentials, login, getUserIdFromSession };
