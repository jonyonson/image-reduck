import fs from 'fs';
import { filterOutDotfiles } from '../index.js';

async function getDirectoryFileSize(dir) {
  const files = await fs.promises
    .readdir(dir)
    .then((files) => files.filter(filterOutDotfiles));

  let totalSize = 0;
  for (const file of files) {
    const stats = await fs.promises.stat(`./${dir}/${file}`);
    totalSize += stats.size;
  }
  return totalSize;
}

export default getDirectoryFileSize;
