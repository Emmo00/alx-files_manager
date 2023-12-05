import redisClient from '../utils/redis';
import dbClient from '../utils/db';

function getStatus(req, res) {
  return res
    .send({ redis: redisClient.isAlive(), db: dbClient.isAlive() })
    .status(200);
}

async function getStats(req, res) {
  return res
    .send({ users: await dbClient.nbUsers(), files: await dbClient.nbFiles() })
    .status(200);
}

export default { getStatus, getStats };
