import { loadSettings, saveSettings } from '../shared/storage';

async function init(): Promise<void> {
  const settings = await loadSettings();

  const autoPauseEl = document.getElementById(
    'autoPause'
  ) as HTMLInputElement;
  const visibilityEl = document.getElementById(
    'controlsVisibility'
  ) as HTMLSelectElement;
  const shortcutsEl = document.getElementById(
    'keyboardShortcuts'
  ) as HTMLInputElement;

  autoPauseEl.checked = settings.autoPauseOnLoad;
  visibilityEl.value = settings.controlsVisibility;
  shortcutsEl.checked = settings.keyboardShortcuts;

  autoPauseEl.addEventListener('change', () => {
    saveSettings({ autoPauseOnLoad: autoPauseEl.checked });
  });

  visibilityEl.addEventListener('change', () => {
    saveSettings({
      controlsVisibility: visibilityEl.value as 'hover' | 'always',
    });
  });

  shortcutsEl.addEventListener('change', () => {
    saveSettings({ keyboardShortcuts: shortcutsEl.checked });
  });
}

init();
