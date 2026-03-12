import { DecodedFrame, PlayerState } from '../shared/types';

export class GifPlayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private frames: DecodedFrame[];
  private state: PlayerState;
  private animationId: number | null = null;
  private lastFrameTime = 0;
  private onStateChange: ((state: PlayerState) => void) | null = null;

  constructor(frames: DecodedFrame[], width: number, height: number) {
    this.frames = frames;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.display = 'block';
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.height = 'auto';
    this.ctx = this.canvas.getContext('2d')!;

    this.state = {
      playing: false,
      currentFrame: 0,
      totalFrames: frames.length,
    };

    this.renderFrame(0);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getState(): PlayerState {
    return { ...this.state };
  }

  setOnStateChange(callback: (state: PlayerState) => void): void {
    this.onStateChange = callback;
  }

  play(): void {
    if (this.state.playing) return;

    this.state.playing = true;
    this.lastFrameTime = performance.now();
    this.tick();
    this.emitStateChange();
  }

  pause(): void {
    if (!this.state.playing) return;

    this.state.playing = false;

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.emitStateChange();
  }

  toggle(): void {
    if (this.state.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  rewind(): void {
    this.pause();
    this.seekToFrame(0);
  }

  seekToFrame(frameIndex: number): void {
    const clamped = Math.max(0, Math.min(frameIndex, this.frames.length - 1));
    this.state.currentFrame = clamped;
    this.renderFrame(clamped);
    this.emitStateChange();
  }

  nextFrame(): void {
    const next = (this.state.currentFrame + 1) % this.frames.length;
    this.seekToFrame(next);
  }

  prevFrame(): void {
    const prev =
      this.state.currentFrame === 0
        ? this.frames.length - 1
        : this.state.currentFrame - 1;
    this.seekToFrame(prev);
  }

  destroy(): void {
    this.pause();
    this.onStateChange = null;
  }

  private tick = (): void => {
    if (!this.state.playing) return;

    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    const currentDelay = this.frames[this.state.currentFrame].delay;

    if (elapsed >= currentDelay) {
      this.state.currentFrame =
        (this.state.currentFrame + 1) % this.frames.length;
      this.renderFrame(this.state.currentFrame);
      this.lastFrameTime = now;
      this.emitStateChange();
    }

    this.animationId = requestAnimationFrame(this.tick);
  };

  private renderFrame(index: number): void {
    this.ctx.putImageData(this.frames[index].imageData, 0, 0);
  }

  private emitStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}
