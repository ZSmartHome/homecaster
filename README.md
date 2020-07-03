# homecaster
Google Chromecast app for local web server

## Debug tool

https://casttool.appspot.com/cactool/

##Discovered issues:

### 1. CORS requirements
 
https://issuetracker.google.com/issues/37755683

For adaptive media streaming, Google Cast requires the presence of CORS headers, but even simple mp4 media streams require CORS if they include Tracks. If you want to enable Tracks for any media, you must enable CORS for both your track streams and your media streams. So, if you do not have CORS headers available for your simple mp4 media on your server, and you then add a simple subtitle track, you will not be able to stream your media unless you update your server to include the appropriate CORS header. In addition, you need to allow at least the following headers: Content-Type, Accept-Encoding, and Range. Note that the last two headers are additional headers that you may not have needed previously.

### 2. Slow buffering

https://www.codeproject.com/articles/813480/http-partial-content-in-node-js

In case of slow internet connection buffering can lead to internal chromecast timeout. In this case we have to implement caching proxy server

### 3. Unsupported 5.1 AAC & Multi-channel AAC streams

https://issuetracker.google.com/issues/69088762#comment4

We observed that your mpd stream uses 5.1 AAC audio channel which is discarded by chromecast devices from 1.28 onwards
<Representation bandwidth="394000" codecs="mp4a.40.2" id="audio/und"/>

We discarded support for 5.1 AAC & Multi-channel AAC streams for Gen 2 and Ultra devices from 1.28 onwards.

This is working as intended. We would recommend you to use either regular stereo (2-channel) AAC or AC3/EAC3 audio or 5.1 Opus audio stream or etc.

Do let us know if you need any other details.

Note: AAC is proprietary where as Opus is free/open source
