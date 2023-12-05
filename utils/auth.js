/* eslint-disable import/prefer-default-export */

function extractCredentials(authHeader) {
  /* global atob */
  const decodedHeader = atob(authHeader);
  const cred = decodedHeader.split('Basic')[1].trim().split(':');
  return { email: cred[0], password: cred[1] };
}

export { extractCredentials };
