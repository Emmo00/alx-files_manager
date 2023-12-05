import { MongoClient, ObjectId } from 'mongodb';

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
    const user = await this.client.db().collection('users').findOne({ email });
    return user !== null;
  }

  async createUser(email, password) {
    const newUser = await this.client.db().collection('users').insertOne({ email, password });
    return { id: newUser.insertedId, email };
  }

  async correctPassword(email, hashedPassword) {
    const user = await this.client.db().collection('users').findOne({ email }, { password: 1 });
    if (hashedPassword === user.password) {
      return true;
    }
    return false;
  }

  async getUserByEmail(email) {
    const user = await this.client.db().collection('users').findOne({ email });
    return { id: user.insertedId, email: user.email };
  }

  async getUserById(userId) {
    const user = await this.client.db().collection('users').findById(ObjectId(userId));
    return user;
  }
}

const dbClient = new DBClient();

export default dbClient;
