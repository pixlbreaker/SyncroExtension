// Background script for YouTube Syncro

chrome.runtime.onMessage.addListener((message) => {
  // Forward local sync messages from the content script to the side panel.
  if (message.type === 'LOCAL_SYNC') {
    chrome.runtime.sendMessage(message);
  }
});
