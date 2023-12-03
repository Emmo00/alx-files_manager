import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', console.log);
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const getAsync = promisify(this.client.GET).bind(this.client);
    return getAsync(key);
  }

  async set(key, value, duration) {
    return new Promise((res, rej) => {
      this.client.set(key, value, duration, (err, reply) => {
        if (err) rej(err);
        res(reply);
      });
    });
  }

  async del(key) {
    return new Promise((res, rej) => {
      this.client.del(key, (err, reply) => {
        if (err) rej(err);
        res(reply);
      });
    });
  }
}

const redisClient = new RedisClient();

export default redisClient;
