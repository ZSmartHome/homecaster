const stopCastButton = document.getElementById(`video-stop-cast-button`);
const startCastButton = document.getElementById(`video-start-cast-button`);

const videoSourceUrl = document.getElementById(`video-source-url`);
const videoSubtitleSourceUrl = document.getElementById(`video-source-subtitle-url`);

const getInstance = () => cast.framework.CastContext.getInstance();

const statusInput = document.getElementById(`video-current-state-input`);
const printStatus = (status, ...params) => {
  console.debug(status, ...params);
  statusInput.value = status;
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
  printStatus(videoUrl, subtitles);

  // cast.framework.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
  const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, /*`video/mpeg`*/);
  mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
  mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
  mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();

  // addTrack(mediaInfo);
  const request = new chrome.cast.media.LoadRequest(mediaInfo);
  chrome.cast.requestSession((castSession) => {
    const result = castSession.loadMedia(request);
    if (!result) {
      printStatus(`Load media returned nothing =(`);
    } else {
      result.then(() => {
        printStatus(`Load succeed`);
      }).catch((errorCode) => {
        printStatus(`Error code: ${errorCode}`);
      });
    }
  }, (e) => {
    printStatus(`Failed to start session`, e);
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

const printSessionStatus = (session) => {
  console.debug(session);

  const PlayerState = chrome.cast.media.PlayerState;
  printStatus(`status: ${session.status}`);

  const [currentMedia] = session.media || [];
  if (currentMedia) {
    const state = currentMedia.playerState;

    switch (state) {
      case PlayerState.IDLE:
        printStatus(`player is idle`);
        break;
      case PlayerState.PLAYING:
      case PlayerState.PAUSED:
      case PlayerState.BUFFERED:

        const currentTime = currentMedia.getEstimatedTime();
        const info = currentMedia.media;

        const progress = Math.floor((currentTime / info.duration) * 100); // %

        printStatus(`player is ${state} — ${progress}%`);
        break;
      default:
        printStatus(`invalid state: ${state}`);
    }
  }
};

const initNewWay = () => {
  printStatus(`setting up...`);
  const sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
  const availabilityCallback = (state) => {
    switch (state) {
      case chrome.cast.ReceiverAvailability.AVAILABLE:
        printStatus(`receiver found`);
        break;
      case chrome.cast.ReceiverAvailability.UNAVAILABLE:
        printStatus(`no receivers found`);
        break;
      default:
        printStatus(`unknown status: ${state}`);
    }
  };
  const sessionReceiver = (session) => {
    printStatus(`got session...`, session);

    printSessionStatus(session);
  };
  const apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    sessionReceiver,
    availabilityCallback,
    chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);

  chrome.cast.initialize(apiConfig,
    () => printStatus(`initialized`),
    (e) => printStatus(`error: ${e.message}`, e)
  );
};

const stopCasting = () => {
  const castSession = getInstance().getCurrentSession();
  // End the session and pass 'true' to indicate
  // that receiver application should be stopped.
  castSession.endSession(true);
};

const init = () => {
  initNewWay();

  stopCastButton.addEventListener(`click`, (evt) => {
    evt.stopPropagation();
    evt.preventDefault();

    stopCasting();
  });
};

printStatus(`initializing...`);
window['__onGCastApiAvailable'] = function (isAvailable) {
  if (isAvailable) {
    init();
  }
};
