import { GifControllerSettings, DEFAULT_SETTINGS } from './types';

export async function loadSettings(): Promise<GifControllerSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
      resolve(result as GifControllerSettings);
    });
  });
}

export async function saveSettings(
  settings: Partial<GifControllerSettings>
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, resolve);
  });
}

export function onSettingsChanged(
  callback: (settings: GifControllerSettings) => void
): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;

    loadSettings().then(callback);
  });
}
