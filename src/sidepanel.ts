// Side panel logic – handles PeerJS connections and forwards sync commands

const statusDiv = document.getElementById('status') as HTMLElement;
const btnConnect = document.getElementById('btnConnect') as HTMLButtonElement;

let peer: any = null;
let connections: any[] = [];

async function connectToRoom(videoId: string) {
  if (peer) {
    peer.destroy();
    connections.forEach((c) => c.close());
    connections = [];
  }

  statusDiv.textContent = `Connecting to room ${videoId}`;

  try {
    // Using the YouTube video ID as the PeerJS ID gives a zero‑config sync
    peer = new Peer(videoId);

    peer.on('open', (id: string) => {
      statusDiv.textContent = `Connected! Room ID: ${id}`;
      console.log('Peer open:', id);
    });

    peer.on('connection', (conn: any) => handleConnection(conn));

    peer.on('error', (err: any) => {
      console.error('Peer error:', err);
      statusDiv.textContent = `Error: ${err.type}`;
    });
  } catch (e) {
    console.error(e);
    statusDiv.textContent = 'Failed to connect';
  }
}

function handleConnection(conn: any) {
  connections.push(conn);
  statusDiv.textContent = 'Peer connected!';

  conn.on('data', (msg: any) => {
    console.log('Received sync command:', msg);
    // Broadcast to all other peers
    connections.forEach((c) => c !== conn && c.send(msg));
    // Forward to the background so it can forward to content scripts
    chrome.runtime.sendMessage({ type: 'SYNC_VIDEO', data: msg });
  });

  conn.on('close', () => {
    connections = connections.filter((c) => c !== conn);
    statusDiv.textContent = `Peer disconnected. ${connections.length} peers`;
  });
}

// Listen for messages from the background (e.g., sync commands originating
// from other clients)
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SYNC_VIDEO') {
    // Forward to the active tab so the content script can apply changes.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id!, { type: 'SYNC_VIDEO', data: msg.data });
      }
    });
  }
});

btnConnect.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes('youtube.com/watch?v=')) {
    statusDiv.textContent = 'Not on a YouTube video page.';
    return;
  }
  const url = new URL(tab.url!);
  const videoId = url.searchParams.get('v');
  if (!videoId) {
    statusDiv.textContent = 'Video ID not found in URL.';
    return;
  }
  await connectToRoom(videoId);
});

