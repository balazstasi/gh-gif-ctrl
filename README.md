# 🎬 GitHub GIF Controller

A Chrome extension that gives you full playback controls for GIF images on GitHub — pause, rewind, scrub through frames, and more.

## Features

- **Play/Pause** — Stop and resume GIF animations
- **Rewind** — Jump back to the first frame
- **Frame Scrubber** — Drag a slider to scrub through individual frames
- **Frame Counter** — See exactly which frame you're on (e.g., "12/47")
- **Open in New Tab** — Quickly open any GIF in a new browser tab
- **Keyboard Shortcuts** — Space (play/pause), ←→ (prev/next frame), Home (rewind)
- **Responsive Controls** — Clean overlay that adapts to any GIF size
- **Settings** — Auto-pause on load, always-visible controls, toggle keyboard shortcuts
- **Dynamic Detection** — Automatically picks up GIFs loaded via GitHub's Turbo navigation

## How it Looks
<img width="395" height="410" alt="image" src="https://github.com/user-attachments/assets/d0e5fe79-b473-4173-a0d5-828271353c9c" />

https://github.com/user-attachments/assets/ecdc1567-5ac3-4ae4-bd17-8eab209b7215

## How It Works

The extension uses [gifuct-js](https://github.com/matt-way/gifuct-js) to decode GIFs into individual frames, then renders them on a `<canvas>` element with full playback control. Controls are rendered in a Shadow DOM for complete style isolation from GitHub's CSS. A `MutationObserver` detects GIFs added dynamically.

## Installation

### From Release (Recommended)

1. **Download** the latest `gh-gif-ctrl.zip` from the [Releases](https://github.com/balazstasi/gh-gif-ctrl/releases/latest) page
2. **Unzip** the downloaded file
3. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable **Developer mode** (top right toggle)
   - Click **Load unpacked**
   - Select the unzipped folder
4. **Navigate to any GitHub page** with GIFs — controls will appear on hover!

### From Source

1. **Clone and build:**
   ```bash
   git clone https://github.com/balazstasi/gh-gif-ctrl.git
   cd gh-gif-ctrl
   npm install
   npm run build
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable **Developer mode** (top right toggle)
   - Click **Load unpacked**
   - Select the `dist/` folder

3. **Navigate to any GitHub page** with GIFs — controls will appear on hover!

## Development

```bash
# Install dependencies
npm install

# Build (production)
npm run build

# Build (watch mode for development)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── content/           # Content script (runs on GitHub pages)
│   ├── index.ts       # Entry point — scans for GIFs, initializes players
│   ├── gif-detector.ts # Finds GIF images in the DOM
│   ├── gif-decoder.ts  # Decodes GIF binary → frame ImageData[]
│   ├── gif-player.ts   # Canvas-based player with playback state
│   ├── gif-controls.ts # UI controls overlay (Shadow DOM)
│   └── styles.css      # Control bar styles
├── popup/             # Extension popup (settings)
├── background/        # Service worker (badge updates)
├── shared/            # Types and storage utilities
└── icons/             # Extension icons
```

## Settings

Click the extension icon to access settings:

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-pause on load | Off | GIFs start paused, click play to animate |
| Controls visibility | Hover | Show controls on hover or always |
| Keyboard shortcuts | On | Enable Space, ←→, Home shortcuts |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` | Previous frame |
| `→` | Next frame |
| `Home` | Rewind to first frame |

> **Note:** Focus the GIF (click on it) to activate keyboard shortcuts.

## Tech Stack

- **TypeScript** — Type-safe codebase
- **gifuct-js** — Fast GIF frame decoder
- **Webpack** — Bundling for Chrome extension
- **Jest** — Unit testing
- **Shadow DOM** — Style isolation from GitHub CSS
- **Manifest V3** — Modern Chrome extension API

## Future Plans
Possible future improvements are:
1. Make the extension work on other sites too, potentially all GIFs
2. Add additional controls/themeing options
3. Extend current browser video controls with useful features

## License

MIT
