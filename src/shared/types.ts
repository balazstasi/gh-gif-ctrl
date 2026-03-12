export interface DecodedFrame {
  imageData: ImageData;
  delay: number;
}

export interface PlayerState {
  playing: boolean;
  currentFrame: number;
  totalFrames: number;
}

export interface GifControllerSettings {
  autoPauseOnLoad: boolean;
  controlsVisibility: 'hover' | 'always';
  keyboardShortcuts: boolean;
}

export const DEFAULT_SETTINGS: GifControllerSettings = {
  autoPauseOnLoad: false,
  controlsVisibility: 'hover',
  keyboardShortcuts: true,
};
