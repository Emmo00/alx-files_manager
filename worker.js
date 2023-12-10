import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';

const fileQueue = Queue('fileQueue');
const userQueue = Queue('userQueue');

async function createImageThumbnail(path, options) {
  const thumbnail = await imageThumbnail(path, options);

  return new Promise((reject, resolve) => {
    fs.writeFile(
      `${path}-${options.width}`,
      thumbnail,
      { encoding: 'utf-8' },
      (err) => {
        if (err) reject(err);
        resolve();
      },
    );
  });
}

fileQueue.process(async (job, done) => {
  const { fileId, userId } = job.data;
  if (!fileId) done(new Error('Missing fileId'));
  if (!userId) done(new Error('Missing userId'));

  const file = await dbClient.getFileById(fileId);
  if (!file || file.userId !== userId) done(new Error('File not found'));

  await createImageThumbnail(file.localPath, { width: 500 });
  await createImageThumbnail(file.localPath, { width: 250 });
  await createImageThumbnail(file.localPath, { width: 100 });
});

userQueue.process(async (job, done) => {
  const { userId } = job.data;

  if (!userId) done(new Error('Missing userId'));
  const user = await dbClient.getUserById(userId);
  if (!user) done(new Error('User not found'));
  console.log(`Welcome ${user.email}`);
});
