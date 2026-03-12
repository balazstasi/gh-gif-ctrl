import { GifControllerSettings } from '../shared/types';
import { decodeGif } from './gif-decoder';
import { GifPlayer } from './gif-player';
import { createControls } from './gif-controls';
import { loadSettings, onSettingsChanged } from '../shared/storage';
import { findUnprocessedGifs, markAsProcessed, GifTarget } from './gif-detector';

let settings: GifControllerSettings;
let gifCount = 0;

async function init(): Promise<void> {
  settings = await loadSettings();
  onSettingsChanged((newSettings) => {
    settings = newSettings;
  });

  scanForGifs();
  observeDOM();
  listenForNavigation();
}

function scanForGifs(): void {
  const targets = findUnprocessedGifs();
  targets.forEach(processGifTarget);
}

async function processGifTarget(target: GifTarget): Promise<void> {
  const { replaceTarget, src, alt } = target;

  if (replaceTarget.hasAttribute('data-gif-ctrl')) return;
  markAsProcessed(replaceTarget, 'processing');

  try {
    const frames = await decodeGif(src);

    if (frames.length === 0) return;

    const { width, height } = frames[0].imageData;
    const player = new GifPlayer(frames, width, height);

    if (!settings.autoPauseOnLoad) {
      player.play();
    }

    const wrapper = createControls(player, settings, src);

    if (alt) wrapper.setAttribute('aria-label', alt);
    wrapper.style.maxWidth = '100%';

    replaceTarget.replaceWith(wrapper);
    gifCount++;
    updateBadge();
  } catch (error) {
    console.error('[GIF Ctrl] Failed to process GIF:', src, error);
    markAsProcessed(replaceTarget, 'error');
  }
}

function observeDOM(): void {
  const observer = new MutationObserver((mutations) => {
    let hasNewNodes = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        hasNewNodes = true;
        break;
      }
    }

    if (hasNewNodes) {
      scanForGifs();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function listenForNavigation(): void {
  document.addEventListener('turbo:load', () => {
    gifCount = 0;
    scanForGifs();
  });

  document.addEventListener('turbo:render', () => {
    scanForGifs();
  });
}

function updateBadge(): void {
  try {
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      count: gifCount,
    });
  } catch {
    // Extension context may be invalidated
  }
}

// Start
init();
