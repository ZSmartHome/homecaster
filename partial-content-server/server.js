// Initialize all required objects.
const http = require(`http`);
const fs = require(`fs`);
const path = require(`path`);
const url = require(`url`);

// Give the initial folder. Change the location to whatever you want.
const videoFolder = `../video`;

// List filename extensions and MIME names we need as a dictionary.
const mimeNames = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.ogg': 'application/ogg',
  '.ogv': 'video/ogg',
  '.oga': 'audio/ogg',
  '.txt': 'text/plain',
  '.wav': 'audio/x-wav',
  '.webm': 'video/webm'
};

http.createServer(httpListener).listen(8000);

function getStat(filename) {
  // Check if file exists.
  if (!fs.existsSync(filename)) {
    return null;
  }

  const stat = fs.statSync(filename);

  // Check is not directory
  if (stat.isDirectory()) {
    return null;
  }

  stat.filename = filename;
  return stat;
}

function loadStat(localUrl) {
  const requestedFileName = url.parse(localUrl, true, true).pathname.split('/').join(path.sep);
  // 1 Check local
  let stat = getStat(`.${requestedFileName}`);
  if (stat) {
    return stat;
  }
  // 2 Try index.html
  stat = getStat(`${requestedFileName}index.html`);
  if (stat) {
    return stat;
  }
  // 3 Check video folder
  stat = getStat(videoFolder + requestedFileName);

  return stat;
}

function httpListener(request, response) {
  // We will only accept 'GET' method. Otherwise will return 405 'Method Not Allowed'.
  if (request.method.toLowerCase() !== 'GET'.toLowerCase()) {
    sendResponse(response, 405, {'Allow': 'GET'}, null);
    return null;
  }

  // Try load file. If not, will return the 404 'Not Found'.
  const stat = loadStat(request.url);
  if (!stat) {
    sendResponse(response, 404, null, null);
    return null;
  }

  const responseHeaders = {};
  const rangeRequest = readRangeHeader(request.headers['range'], stat.size);

  // If 'Range' header exists, we will parse it with Regular Expression.
  if (rangeRequest == null) {
    responseHeaders['Content-Type'] = getMimeNameFromExt(path.extname(stat.filename));
    responseHeaders['Content-Length'] = stat.size;  // File size.
    responseHeaders['Accept-Ranges'] = 'bytes';

    //  If not, will return file directly.
    sendResponse(response, 200, responseHeaders, fs.createReadStream(stat.filename));
    return null;
  }

  const start = rangeRequest.start;
  const end = rangeRequest.end;

  // If the range can't be fulfilled.
  if (start >= stat.size || end >= stat.size) {
    // Indicate the acceptable range.
    responseHeaders['Content-Range'] = 'bytes */' + stat.size; // File size.

    // Return the 416 'Requested Range Not Satisfiable'.
    sendResponse(response, 416, responseHeaders, null);
    return null;
  }

  // Indicate the current range.
  responseHeaders['Content-Range'] = 'bytes ' + start + '-' + end + '/' + stat.size;
  responseHeaders['Content-Length'] = start === end ? 0 : (end - start + 1);
  responseHeaders['Content-Type'] = getMimeNameFromExt(path.extname(stat.filename));
  responseHeaders['Accept-Ranges'] = 'bytes';
  responseHeaders['Cache-Control'] = 'no-cache';

  // Return the 206 'Partial Content'.
  sendResponse(response, 206, responseHeaders, fs.createReadStream(stat.filename, {start: start, end: end}));
}

function sendResponse(response, responseStatus, responseHeaders, readable) {
  response.writeHead(responseStatus, responseHeaders);

  if (readable == null)
    response.end();
  else
    readable.on('open', function () {
      readable.pipe(response);
    });

  return null;
}

function getMimeNameFromExt(ext) {
  let result = mimeNames[ext.toLowerCase()];

  // It's better to give a default value.
  if (result == null)
    result = 'application/octet-stream';

  return result;
}

function readRangeHeader(range, totalLength) {
  /*
   * Example of the method 'split' with regular expression.
   *
   * Input: bytes=100-200
   * Output: [null, 100, 200, null]
   *
   * Input: bytes=-200
   * Output: [null, null, 200, null]
   */

  if (range == null || range.length === 0)
    return null;

  const array = range.split(/bytes=([0-9]*)-([0-9]*)/);
  const start = parseInt(array[1]);
  const end = parseInt(array[2]);
  const result = {
    start: isNaN(start) ? 0 : start,
    end: isNaN(end) ? (totalLength - 1) : end
  };

  if (!isNaN(start) && isNaN(end)) {
    result.start = start;
    result.end = totalLength - 1;
  }

  if (isNaN(start) && !isNaN(end)) {
    result.start = totalLength - end;
    result.end = totalLength - 1;
  }

  return result;
}

