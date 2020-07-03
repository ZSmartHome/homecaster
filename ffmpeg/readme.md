```shell script
# cut from 00:00:30 to 00:00:50
ffmpeg -ss 00:00:30.0 -i dark-knight.mp4 -c copy -t 00:00:20.0 -map 0 output.mp4

# convert all audio stream to ac3
ffmpeg -i video.mp4 -acodec ac3 -map 0 converted.mp4
```
