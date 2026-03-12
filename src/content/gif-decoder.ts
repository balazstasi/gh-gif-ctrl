import { parseGIF, decompressFrames } from 'gifuct-js';
import { DecodedFrame } from '../shared/types';

/**
 * Fetches GIF binary via the service worker (bypasses CORS),
 * then decodes all frames into composited ImageData.
 */
export async function decodeGif(url: string): Promise<DecodedFrame[]> {
  const buffer = await fetchGifBuffer(url);
  const gif = parseGIF(buffer);
  const rawFrames = decompressFrames(gif, true);

  if (rawFrames.length === 0) {
    throw new Error('GIF contains no frames');
  }

  const { width, height } = rawFrames[0].dims;
  const compositeCanvas = new OffscreenCanvas(width, height);
  const compositeCtx = compositeCanvas.getContext('2d')!;
  const frames: DecodedFrame[] = [];

  for (const frame of rawFrames) {
    const { dims, patch, disposalType, delay } = frame;

    const patchImageData = new ImageData(
      new Uint8ClampedArray(patch),
      dims.width,
      dims.height
    );

    const patchCanvas = new OffscreenCanvas(dims.width, dims.height);
    const patchCtx = patchCanvas.getContext('2d')!;
    patchCtx.putImageData(patchImageData, 0, 0);

    compositeCtx.drawImage(patchCanvas, dims.left, dims.top);

    const compositeImageData = compositeCtx.getImageData(0, 0, width, height);
    frames.push({
      imageData: new ImageData(
        new Uint8ClampedArray(compositeImageData.data),
        width,
        height
      ),
      delay: delay >= 20 ? delay : 100,
    });

    if (disposalType === 2) {
      compositeCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
    }
  }

  return frames;
}

/**
 * Routes the fetch through the extension's service worker,
 * which has host_permissions and can bypass CORS restrictions.
 */
async function fetchGifBuffer(url: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'FETCH_GIF', url },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!response || !response.ok) {
          reject(new Error(response?.error || 'Service worker fetch failed'));
          return;
        }

        // Decode base64 back to ArrayBuffer
        const binary = atob(response.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        resolve(bytes.buffer);
      }
    );
  });
}
