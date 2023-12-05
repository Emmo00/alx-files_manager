import { Buffer } from 'node:buffer';
/* eslint-disable import/prefer-default-export */

function extractCredentials(authHeader) {
  const encoded = authHeader.split('Basic ')[1];
  const decodedHeader = Buffer.from(encoded, 'base64').toString('utf-8');
  const cred = decodedHeader.split(':');
  return { email: cred[0], password: cred[1] };
}

export { extractCredentials };
