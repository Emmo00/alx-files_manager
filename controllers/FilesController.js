import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import { getUserIdFromSession } from '../utils/auth';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

async function postUpload(req, res) {
  const { error, userId } = await getUserIdFromSession(req);

  if (error || !userId) return res.status(401).send({ error });

  const { name, type, data } = req.body;
  let { parentId, isPublic } = req.body;
  parentId = parentId || 0;
  isPublic = isPublic === undefined || isPublic == null ? false : isPublic;

  if (!name) return res.status(400).send({ error: 'Missing name' });
  if (!type || !['folder', 'file', 'image'].includes(type)) {
    return res.status(400).send({ error: 'Missing type' });
  }
  if (!data && type !== 'folder') {
    return res.status(400).send({ error: 'Missing data' });
  }

  if (parentId) {
    const folder = await dbClient.getFileById(parentId);
    if (!folder) return res.status(400).send({ error: 'Parent not found' });
    if (folder.type !== 'folder') {
      return res.status(400).send({ error: 'Parent is not a folder' });
    }
  }

  if (type === 'folder') {
    const newFolder = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };
    const createdFolder = await dbClient.createFolder(newFolder);

    return res.status(201).send({
      id: createdFolder.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
  }
  // store binary in local file storage
  const uniqueFileName = uuidv4();
  const localPath = `${FOLDER_PATH}/${uniqueFileName}`;
  await new Promise((resolve, reject) => {
    fs.mkdir(FOLDER_PATH, { recursive: true }, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
  fs.writeFileSync(localPath, data, {
    encoding: 'base64',
  });
  // create db record
  const newFile = {
    userId,
    name,
    type,
    isPublic,
    parentId,
    localPath,
  };
  const createdFile = await dbClient.createFile(newFile);
  // return created file
  delete newFile.localPath;
  return res.status(201).send({
    id: createdFile.insertedId,
    userId,
    name,
    type,
    isPublic,
    parentId,
  });
}

async function getShow(req, res) {
  const { error, userId } = await getUserIdFromSession(req);

  if (error || !userId) return res.status(401).send({ error });
  const documentId = req.params.id;
  const document = await dbClient.getUserDocument(documentId, userId);

  if (!document) return res.status(404).send({ error: 'Not found' });
  return res.status(200).send(document);
}

async function getIndex(req, res) {
  const { error, userId } = await getUserIdFromSession(req);

  if (error || !userId) return res.status(401).send({ error });

  const parentId = req.query.parentId || 0;
  const page = req.query.page || 0;
  const documents = await dbClient.getUserDocuments(parentId, userId, page);
  return res.status(200).send(documents);
}

async function putPublish(req, res) {
  const { error, userId } = await getUserIdFromSession(req);

  if (error || !userId) return res.status(401).send({ error });
  const documentId = req.params.id;
  const document = await dbClient.getUserDocument(documentId, userId);

  if (!document) return res.status(404).send({ error: 'Not found' });
  document.isPublic = true;
  await dbClient.updateDocumentPublish(document);
  return res.status(200).send(document);
}

async function putUnpublish(req, res) {
  const { error, userId } = await getUserIdFromSession(req);

  if (error || !userId) return res.status(401).send({ error });
  const documentId = req.params.id;
  const document = await dbClient.getUserDocument(documentId, userId);

  if (!document) return res.status(404).send({ error: 'Not found' });
  document.isPublic = false;
  await dbClient.updateDocumentPublish(document);
  return res.status(200).send(document);
}

export default {
  postUpload,
  getShow,
  getIndex,
  putPublish,
  putUnpublish,
};
