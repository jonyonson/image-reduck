#!/usr/bin/env node
import fs from 'fs';
import sharp from 'sharp';
import prettyBytes from 'pretty-bytes';
import getDirectoryFileSize from './modules/get-directory-file-size.js';

const RESIZE_WIDTH = +process.argv[2] || 300;
const COMPRESSION_QUALITY = +process.argv[3] || 50;

if (process.argv[3] < 1 || process.argv[3] > 100) {
  console.log('Quality must be between 1 and 100');
  process.exit(1);
}

console.log(
  `\nResizing all images in the "./images" directory to ${RESIZE_WIDTH}px wide with a compression quality of ${COMPRESSION_QUALITY}%.`
);

// filter dotfiles (.gitkeep, .DS_Store, etc)
export const filterOutDotfiles = (file) => !file.startsWith('.');

const images = await fs.promises
  .readdir('./images')
  .then((files) => files.filter(filterOutDotfiles));

let pngs = [];
let jpegs = [];
let other = [];

images.forEach((image) => {
  const extension = image.split('.')[1];
  if (extension === 'png') {
    pngs.push(image);
  } else if (['jpg', 'jpeg'].includes(extension)) {
    jpegs.push(image);
  } else {
    other.push(image);
  }
});

// resize and compress all jpeg images
jpegs.forEach((image) => {
  sharp(`./images/${image}`)
    .resize(RESIZE_WIDTH)
    .jpeg({ quality: COMPRESSION_QUALITY })
    .toFile(`./resized/${image}`);
});

// resize and compress all png images
pngs.forEach((image) => {
  sharp(`./images/${image}`)
    .resize(RESIZE_WIDTH)
    .png({ quality: COMPRESSION_QUALITY })
    .toFile(`./resized/${image}`);
});

// resize any other image types
other.forEach((image) => {
  sharp(`./images/${image}`).resize(RESIZE_WIDTH).toFile(`./resized/${image}`);
});

const originalSize = await getDirectoryFileSize('./images');
const resized = await getDirectoryFileSize('./resized');

console.log(
  `\nOriginal size: ${originalSize} Bytes (${prettyBytes(originalSize)})`
);
console.log(`Resized size: ${resized} Bytes (${prettyBytes(resized)})`);

const reduction = originalSize - resized;
console.log(`\nTotal Size Reduction: ${reduction} (${prettyBytes(reduction)})`);
