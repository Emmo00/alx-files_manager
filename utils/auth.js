export function extractCredentials(authHeader) {
  const decodedHeader = atob(authHeader);
  const cred = decodedHeader.split('Basic')[1].trim().split(':');
  return { email: cred[0], password: cred[1] };
}
