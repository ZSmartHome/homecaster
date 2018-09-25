const stopAllButton = document.getElementById(`video-stop-current-activity-button`);
const startCastButton = document.getElementById(`video-start-cast-button`);

const videoSourceUrl = document.getElementById(`video-source-url`);
const videoSubtitleSourceUrl = document.getElementById(`video-source-subtitle-url`);

const getInstance = () => cast.framework.CastContext.getInstance();

const beginCast = ({videoUrl, subtitles = []}) => {
  console.log(videoUrl, subtitles);

  const mediaTracks = [];
  for (let i = 0; i < subtitles.length; i++) {
    const {url, lang} = subtitles[i];

    const info = new chrome.cast.media.Track(i + 1, // track ID
      chrome.cast.media.TrackType.TEXT);
    info.trackContentId = url;
    info.trackContentType = `text/plain`;
    info.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
    info.name = `${lang} language`;
    info.lang = lang;
    info.customData = null;

    mediaTracks.push(info);
  }


  const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, /*`video/mpeg`*/);
  mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
  mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
  mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
  mediaInfo.tracks = mediaTracks;

  const request = new chrome.cast.media.LoadRequest(mediaInfo);
  if (mediaTracks.length > 0) {
    request.activeTrackIds = [1];
  }
  chrome.cast.requestSession((castSession) => {
    castSession.loadMedia(request).
      then(() => console.log(`Load succeed`)).
      catch((errorCode) => console.log(`Error code: ${errorCode}`));
  }, console.error);

};

startCastButton.addEventListener(`click`, () => {
  const videoUrl = videoSourceUrl.value;
  if (!videoUrl) {
    console.error(`Video URL is not set`);
    return;
  }

  const info = {videoUrl};
  const subtitleUrl = videoSubtitleSourceUrl.value;
  if (subtitleUrl) {
    info.subtitles = [{url: subtitleUrl, lang: `en-US`}];
  }

  beginCast(info);
});

const init = () => {
  getInstance().setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    resumeSavedSession: true
  });

  const stopCasting = () => {
    const castSession = getInstance().getCurrentSession();
    // End the session and pass 'true' to indicate
    // that receiver application should be stopped.
    castSession.endSession(true);
  };
  stopAllButton.addEventListener(`click`, stopCasting);
};

window['__onGCastApiAvailable'] = function (isAvailable) {
  if (isAvailable) {
    init();
  }
};