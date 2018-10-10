# homecaster
Google Chromecast app for local web server

Discovered issues:
https://issuetracker.google.com/issues/37755683

CORS requirements
For adaptive media streaming, Google Cast requires the presence of CORS headers, but even simple mp4 media streams require CORS if they include Tracks. If you want to enable Tracks for any media, you must enable CORS for both your track streams and your media streams. So, if you do not have CORS headers available for your simple mp4 media on your server, and you then add a simple subtitle track, you will not be able to stream your media unless you update your server to include the appropriate CORS header. In addition, you need to allow at least the following headers: Content-Type, Accept-Encoding, and Range. Note that the last two headers are additional headers that you may not have needed previously.
