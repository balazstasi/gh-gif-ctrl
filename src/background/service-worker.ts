chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'UPDATE_BADGE') {
    const count = message.count as number;
    const text = count > 0 ? String(count) : '';

    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color: '#238636' });
    return false;
  }

  if (message.type === 'FETCH_GIF') {
    fetchGifAsBase64(message.url)
      .then((base64) => sendResponse({ ok: true, data: base64 }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));

    // Return true to indicate async sendResponse
    return true;
  }
});

async function fetchGifAsBase64(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';

  // Convert to binary string in chunks to avoid call stack overflow
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

chrome.action.setBadgeText({ text: '' });
