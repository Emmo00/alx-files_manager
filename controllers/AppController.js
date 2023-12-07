import redisClient from '../utils/redis';
import dbClient from '../utils/db';

function getStatus(req, res) {
  return res
    .status(200)
    .send({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
}

async function getStats(req, res) {
  return res
    .status(200)
    .send({ users: await dbClient.nbUsers(), files: await dbClient.nbFiles() });
}

export default { getStatus, getStats };
