const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

// create the target stream (can be any WritableStream)
const outpath = os.tmpdir() + '/output.mp4';
console.log(`Writing to ${outpath}`);
const stream = fs.createWriteStream(outpath);

// make sure you set the correct path to your video file
const inputFile = __dirname + '/../video/8aac51.mp4';
console.log(`Input file ${inputFile}`);

const proc = ffmpeg(inputFile)
  .audioCodec('ac3')
  // setup event handlers
  .on('end', function () {
    console.log('file has been converted succesfully');
  })
  .on('error', function (err) {
    console.log('an error happened: ' + err.message);
  })
  // save to stream
  .pipe(stream, {end: true}); //end = true, close output stream after writing
