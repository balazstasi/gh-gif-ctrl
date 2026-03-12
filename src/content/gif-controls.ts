import { GifPlayer } from './gif-player';
import { PlayerState, GifControllerSettings } from '../shared/types';
// @ts-ignore — raw-loader returns string
import controlsCSS from './styles.css';

export function createControls(
  player: GifPlayer,
  settings: GifControllerSettings,
  gifUrl: string
): HTMLElement {
  // The wrapper IS the shadow host so :host(:hover) covers everything
  const wrapper = document.createElement('div');
  wrapper.classList.add('gif-ctrl-wrapper');
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';

  const shadow = wrapper.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = controlsCSS;
  shadow.appendChild(style);

  // Canvas goes inside shadow DOM
  const canvas = player.getCanvas();
  shadow.appendChild(canvas);

  const controlBar = document.createElement('div');
  controlBar.classList.add('gif-ctrl-bar');

  if (settings.controlsVisibility === 'always') {
    controlBar.classList.add('gif-ctrl-bar--always');
  }

  // Play/Pause button
  const playPauseBtn = document.createElement('button');
  playPauseBtn.classList.add('gif-ctrl-btn');
  playPauseBtn.title = 'Play/Pause (Space)';
  const initialState = player.getState();
  playPauseBtn.innerHTML = initialState.playing ? getPauseIcon() : getPlayIcon();
  playPauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    player.toggle();
  });

  // Rewind button
  const rewindBtn = document.createElement('button');
  rewindBtn.classList.add('gif-ctrl-btn', 'gif-ctrl-btn--rewind');
  rewindBtn.title = 'Rewind (Home)';
  rewindBtn.innerHTML = getRewindIcon();
  rewindBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    player.rewind();
  });

  // Scrubber
  const scrubber = document.createElement('input');
  scrubber.type = 'range';
  scrubber.classList.add('gif-ctrl-scrubber');
  scrubber.min = '0';
  scrubber.max = String(player.getState().totalFrames - 1);
  scrubber.value = '0';
  scrubber.title = 'Scrub frames (← →)';
  scrubber.addEventListener('input', (e) => {
    e.stopPropagation();
    const frame = parseInt((e.target as HTMLInputElement).value, 10);
    player.pause();
    player.seekToFrame(frame);
  });

  // Frame counter
  const frameCounter = document.createElement('span');
  frameCounter.classList.add('gif-ctrl-counter');
  frameCounter.textContent = `1/${player.getState().totalFrames}`;

  // Open in new tab button
  const openBtn = document.createElement('a');
  openBtn.classList.add('gif-ctrl-btn', 'gif-ctrl-btn--open');
  openBtn.title = 'Open GIF in new tab';
  openBtn.href = gifUrl;
  openBtn.target = '_blank';
  openBtn.rel = 'noopener noreferrer';
  openBtn.innerHTML = getOpenIcon();
  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  controlBar.appendChild(playPauseBtn);
  controlBar.appendChild(rewindBtn);
  controlBar.appendChild(scrubber);
  controlBar.appendChild(frameCounter);
  controlBar.appendChild(openBtn);

  shadow.appendChild(controlBar);

  // State change listener
  player.setOnStateChange((state: PlayerState) => {
    playPauseBtn.innerHTML = state.playing ? getPauseIcon() : getPlayIcon();
    scrubber.value = String(state.currentFrame);
    frameCounter.textContent = `${state.currentFrame + 1}/${state.totalFrames}`;
  });

  // Keyboard shortcuts
  if (settings.keyboardShortcuts) {
    wrapper.tabIndex = 0;
    wrapper.addEventListener('keydown', (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          player.toggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          player.prevFrame();
          break;
        case 'ArrowRight':
          e.preventDefault();
          player.nextFrame();
          break;
        case 'Home':
          e.preventDefault();
          player.rewind();
          break;
      }
    });
  }

  // Responsive size classes based on rendered width
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const width = entry.contentRect.width;

      wrapper.classList.toggle('gif-ctrl-minimal', width < 150);
      wrapper.classList.toggle('gif-ctrl-compact', width >= 150 && width < 280);
    }
  });
  resizeObserver.observe(wrapper);

  return wrapper;
}

function getPlayIcon(): string {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
}

function getPauseIcon(): string {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>`;
}

function getRewindIcon(): string {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="11,3 1,12 11,21"/><polygon points="22,3 12,12 22,21"/></svg>`;
}

function getOpenIcon(): string {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM5 5h5V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-5h-2v5H5V5z"/></svg>`;
}
