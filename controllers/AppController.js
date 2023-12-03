import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export function status(req, res) {
  return res
    .send({ redis: redisClient.isAlive(), db: dbClient.isAlive() })
    .status(200);
}

export async function stats(req, res) {
  return res
    .send({ users: await dbClient.nbUsers(), files: await dbClient.nbFiles() })
    .status(200);
}
