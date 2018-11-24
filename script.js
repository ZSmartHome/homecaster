const stopCastButton = document.getElementById(`video-stop-cast-button`);
const startCastButton = document.getElementById(`video-start-cast-button`);

const videoSourceUrl = document.getElementById(`video-source-url`);
const videoSubtitleSourceUrl = document.getElementById(`video-source-subtitle-url`);

const getInstance = () => cast.framework.CastContext.getInstance();

const debugLog = (...params) => {
  console.log(...params);
  debugger;
};

const addTrack = (mediaInfo) => {
  var englishSubtitle = new chrome.cast.media.Track(1, // track ID
    chrome.cast.media.TrackType.TEXT);
  englishSubtitle.trackContentId = 'http://192.168.1.35:8080/caption_en.vtt';
  englishSubtitle.trackContentType = 'text/vtt';
  englishSubtitle.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
  englishSubtitle.name = 'English Subtitles';
  englishSubtitle.language = 'en-US';
  englishSubtitle.customData = null;

  mediaInfo.tracks = [englishSubtitle];
};

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

  // cast.framework.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
  const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, /*`video/mpeg`*/);
  mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
  mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
  mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
  mediaInfo.tracks = mediaTracks;

  // addTrack(mediaInfo);
  const request = new chrome.cast.media.LoadRequest(mediaInfo);
  if (mediaTracks.length > 0) {
    request.activeTrackIds = [1];
  }
  chrome.cast.requestSession((castSession) => {
    const result = castSession.loadMedia(request, debugLog, debugLog);
    // debugger;
    // result.
    //   then(() => {
    //     console.log(`Load succeed`);
    //     debugger;
    //   }).
    //   catch((errorCode) => {
    //     console.log(`Error code: ${errorCode}`);
    //     debugger;
    //   });
  }, (e) => {
    console.error(e)
  });

};

startCastButton.addEventListener(`click`, (evt) => {
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

  evt.stopPropagation();
  evt.preventDefault();
});

const stopCasting = () => {
  const castSession = getInstance().getCurrentSession();
  // End the session and pass 'true' to indicate
  // that receiver application should be stopped.
  castSession.endSession(true);
};

const initOldWay = () => {
  getInstance().setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });

};

const initNewWay = () => {
  const sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
  const apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    (session) => {
    },
    (e) => {
      if (e === 'available') {
        console.log('receiver found');
      }
      else {
        console.log('receiver list empty');
      }
    },
    chrome.cast.AutoJoinPolicy.PAGE_SCOPED);

  chrome.cast.initialize(apiConfig, () => console.log(`Inited successfully`), (e) => console.error(e));
};


const init = () => {
  initNewWay();

  stopCastButton.addEventListener(`click`, (evt) => {
    evt.stopPropagation();
    evt.preventDefault();

    stopCasting();
  });
};

window['__onGCastApiAvailable'] = function (isAvailable) {
  if (isAvailable) {
    init();
  }
};
