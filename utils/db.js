/* eslint-disable no-underscore-dangle */
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
    const newUser = await this.client
      .db()
      .collection('users')
      .insertOne({ email, password });
    return { id: newUser.insertedId, email };
  }

  async correctPassword(email, hashedPassword) {
    const user = await this.client
      .db()
      .collection('users')
      .findOne({ email }, { password: 1 });
    if (hashedPassword === user.password) {
      return true;
    }
    return false;
  }

  async getUserByEmail(email) {
    const user = await this.client.db().collection('users').findOne({ email });
    return { id: String(user._id), email: user.email };
  }

  async getUserById(userId) {
    const user = await this.client
      .db()
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });
    return { id: String(user._id), email: user.email };
  }

  async getFileById(fileId) {
    let file = await this.client
      .db()
      .collection('files')
      .findOne({ _id: new ObjectId(fileId) });
    if (!file) return file;
    file = { ...file, id: file._id };
    delete file._id;
    return file;
  }

  async createFolder(folder) {
    const newFolder = await this.client
      .db()
      .collection('files')
      .insertOne(folder);
    return newFolder;
  }

  async createFile(file) {
    const newFile = await this.createFolder(file);
    return newFile;
  }

  async getUserDocument(documentId, userId) {
    const document = await this.client
      .db()
      .collection('files')
      .findOne({ _id: new ObjectId(documentId), userId });
    if (!document) return document;
    delete document._id;
    return { ...document, id: documentId };
  }

  async getUserDocuments(parentId, userId, page) {
    const documents = await this.client
      .db()
      .collection('files')
      .aggregate([
        { $match: { parentId, userId } },
        { $skip: page * 20 },
        { $limit: 20 },
        {
          $project: {
            _id: 0,
            id: '$_id',
            userId: 1,
            name: 1,
            type: 1,
            isPublic: 1,
            parentId: 1,
          },
        },
      ])
      .toArray();
    // .map((document) => {
    //   const copyDocument = Object.create(document);
    //   const id = copyDocument._id;
    //   delete copyDocument._id;
    //   return { ...copyDocument, id };
    // });

    return documents;
  }
}

const dbClient = new DBClient();

export default dbClient;
