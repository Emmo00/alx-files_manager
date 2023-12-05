import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.get = promisify(this.client.get).bind(this.client);
    this.set = promisify(this.client.get).bind(this.client);
    this.client.on('error', console.log);
  }

  isAlive() {
    return this.client.connected;
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
