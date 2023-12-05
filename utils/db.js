import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 27017;
    const db = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${db}`;
    this.client = MongoClient(url);
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  async emailExists(email) {
    const user = await this.client.db().findOne({ email });
    return user !== null;
  }

  async createUser(email, password) {
    const newUser = await this.client.db().insertOne({ email, password });
    return newUser;
  }
}

const dbClient = new DBClient();

export default dbClient;
