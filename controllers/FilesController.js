import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import { getUserIdFromSession } from '../utils/auth';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

async function postUpload(req, res) {
  const { error, userId } = await getUserIdFromSession(req);

  if (error || !userId) return res.status(401).send({ error });

  const {
    name, type, parentId, isPublic, data,
  } = req.body;

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
      id: createdFolder.insertedId, userId, name, type, isPublic, parentId,
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
    id: createdFile.insertedId, userId, name, type, isPublic, parentId,
  });
}

export default { postUpload };
