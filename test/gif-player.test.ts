import { GifPlayer } from '../src/content/gif-player';
import { DecodedFrame } from '../src/shared/types';

// jsdom doesn't provide ImageData — polyfill it
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data;
      this.width = width;
      this.height = height ?? data.length / (4 * width);
    }
  };
}

function createMockFrames(count: number): DecodedFrame[] {
  const width = 10;
  const height = 10;
  const frames: DecodedFrame[] = [];

  for (let i = 0; i < count; i++) {
    const data = new Uint8ClampedArray(width * height * 4);
    data.fill(i * 10);

    frames.push({
      imageData: new ImageData(data, width, height),
      delay: 100,
    });
  }

  return frames;
}

describe('GifPlayer', () => {
  let player: GifPlayer;
  let frames: DecodedFrame[];

  beforeEach(() => {
    frames = createMockFrames(5);
    player = new GifPlayer(frames, 10, 10);
  });

  afterEach(() => {
    player.destroy();
  });

  describe('initial state', () => {
    it('should start paused at frame 0', () => {
      const state = player.getState();
      expect(state.playing).toBe(false);
      expect(state.currentFrame).toBe(0);
      expect(state.totalFrames).toBe(5);
    });

    it('should create a canvas element', () => {
      const canvas = player.getCanvas();
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(canvas.width).toBe(10);
      expect(canvas.height).toBe(10);
    });
  });

  describe('play/pause', () => {
    it('should set playing to true on play', () => {
      player.play();
      expect(player.getState().playing).toBe(true);
    });

    it('should set playing to false on pause', () => {
      player.play();
      player.pause();
      expect(player.getState().playing).toBe(false);
    });

    it('should toggle between play and pause', () => {
      player.toggle();
      expect(player.getState().playing).toBe(true);
      player.toggle();
      expect(player.getState().playing).toBe(false);
    });
  });

  describe('seek', () => {
    it('should seek to a specific frame', () => {
      player.seekToFrame(3);
      expect(player.getState().currentFrame).toBe(3);
    });

    it('should clamp frame index to valid range', () => {
      player.seekToFrame(-1);
      expect(player.getState().currentFrame).toBe(0);

      player.seekToFrame(999);
      expect(player.getState().currentFrame).toBe(4);
    });

    it('should advance to next frame', () => {
      player.nextFrame();
      expect(player.getState().currentFrame).toBe(1);
    });

    it('should wrap around on nextFrame', () => {
      player.seekToFrame(4);
      player.nextFrame();
      expect(player.getState().currentFrame).toBe(0);
    });

    it('should go to previous frame', () => {
      player.seekToFrame(3);
      player.prevFrame();
      expect(player.getState().currentFrame).toBe(2);
    });

    it('should wrap around on prevFrame from 0', () => {
      player.prevFrame();
      expect(player.getState().currentFrame).toBe(4);
    });
  });

  describe('rewind', () => {
    it('should rewind to frame 0 and pause', () => {
      player.play();
      player.seekToFrame(3);
      player.rewind();

      const state = player.getState();
      expect(state.currentFrame).toBe(0);
      expect(state.playing).toBe(false);
    });
  });

  describe('state change callback', () => {
    it('should emit state changes', () => {
      const callback = jest.fn();
      player.setOnStateChange(callback);

      player.play();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ playing: true })
      );

      player.pause();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ playing: false })
      );
    });

    it('should emit on seek', () => {
      const callback = jest.fn();
      player.setOnStateChange(callback);

      player.seekToFrame(2);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ currentFrame: 2 })
      );
    });
  });
});
