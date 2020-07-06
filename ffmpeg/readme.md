### FFmpeg useful data

- [Protocols](https://ffmpeg.org/ffmpeg-protocols.html)
- [Formats](https://ffmpeg.org/ffmpeg-formats.html)
- [Live streaming example](https://stackoverflow.com/questions/21921790/best-approach-to-real-time-http-streaming-to-html5-video-client)
- [HTML5 supported video formats](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Video_and_audio_content)
- [Formats browser comaptibility](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers)

```shell script
# cut from 00:00:30 to 00:00:50
ffmpeg -ss 00:00:30.0 -i dark-knight.mp4 -c copy -t 00:00:20.0 -map 0 output.mp4

# convert all audio stream to ac3
ffmpeg -i video.mp4 -acodec ac3 -map 0 converted.mp4

# transcode url to mp4 and pipe output
ffmpeg -i <url> -c copy -acodec ac3 -map 0 -f mp4 -movflags frag_keyframe+empty_moov+delay_moov -

# transcode url to mov and pipe output
ffmpeg -i <url> -c copy -acodec ac3 -map 0 -f mov -movflags frag_keyframe+empty_moov+delay_moov -

# transcode and stream to HTTP
# transcode url to mp4 and pipe output
ffmpeg -i <url> -c copy -acodec ac3 -map 0 -f mp4 -movflags frag_keyframe+empty_moov+delay_moov+faststart -listen 1 http://127.0.0.1:8080

ffmpeg -hide_banner -c copy -acodec ac3 -map 0 -f ismv -movflags delay_moov -listen 1 http://0.0.0.0:8080 -i <url>

ffmpeg \
  -c copy \ # copy config from input stream 
  -acodec mp3 \ # convert input audio to mp3 (will convert to stereo and ac3 supports 5.1)
  -map 0 \ # copy and convert all streams
  -f mp4 \ # file output format (use ismv for smooth streaming)
  -movflags frag_keyframe+empty_moov+delay_moov+faststart \ #configure fragmentation options
  -hide_banner \ # hide cryptic info on start
  -loglevel verbose \ # configure loglevel
  -listen 1 http://127.0.0.1:8080 \ # start listen server with exactly one connection
  -i <url> # input file url 
```
