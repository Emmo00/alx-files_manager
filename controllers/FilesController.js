import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import { login } from '../utils/auth';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

async function postUpload(req, res) {
  const { error, email } = await login(req);
  if (error) return req.send({ error }).status(401);

  const {
    name, type, parentId, isPublic, data,
  } = req.body;

  if (!name) return res.send({ error: 'Missing name' }).status(400);
  if (!type || !['folder', 'file', 'image'].includes(type)) {
    return res.send({ error: 'Missing type' }).status(400);
  }
  if (!data && type !== 'folder') {
    return res.send({ error: 'Missing data' }).status(400);
  }

  if (parentId) {
    const folder = await dbClient.getFileById(parentId);
    if (!folder) return res.send({ error: 'Parent not found' }).status(400);
    if (folder.type !== 'folder') {
      return res.send({ error: 'Parent is not a folder' }).status(400);
    }
  }

  const userId = await dbClient.getUserByEmail(email);

  if (type === 'folder') {
    const newFolder = dbClient.createFolder({
      userId,
      name,
      type,
      isPublic,
      parentId,
    });

    return res.send(newFolder).status(201);
  }
  // store binary in local file storage
  const uniqueFileName = uuidv4();
  const localPath = `${FOLDER_PATH}/${uniqueFileName}`;
  fs.writeFileSync(localPath, data, {
    encoding: 'base64',
  });
  // create db record
  const newFile = await dbClient.createFile({
    userId,
    name,
    type,
    isPublic,
    parentId,
    localPath,
  });
  // return created file
  return res.send(newFile).status(201);
}

export default { postUpload };
