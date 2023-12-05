import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', console.log);
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((res, rej) => {
      this.client.get(key, (err, value) => {
        if (err) rej(err);
        res(value);
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((res, rej) => {
      this.client.setex(key, duration, value, (err, reply) => {
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
