// Content script that forwards local video events to the side panel and applies
// incoming sync commands from peers.

const video = document.querySelector('video');
if (!video) {
  console.warn('No <video> element found on this page.');
  throw new Error('Video element not present');
}

// Send local actions to the side panel which will broadcast them via PeerJS
const sendLocalSync = (action: string, time: number) => {
  chrome.runtime.sendMessage({ type: 'LOCAL_SYNC', data: { action, time } });
};

video.addEventListener('play', () => sendLocalSync('play', video.currentTime));
video.addEventListener('pause', () => sendLocalSync('pause', video.currentTime));
video.addEventListener('seeked', () => sendLocalSync('seek', video.currentTime));

// Apply sync commands received from the side panel
chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== 'SYNC_VIDEO') return;
  const { action, time } = message.data;
  switch (action) {
    case 'play':
      video.currentTime = time;
      video.play();
      break;
    case 'pause':
      video.pause();
      video.currentTime = time;
      break;
    case 'seek':
      video.currentTime = time;
      break;
  }
});
