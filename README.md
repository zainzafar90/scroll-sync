# ScrollSync

Chrome extension that scrolls two tabs in sync.

https://github.com/user-attachments/assets/scroll-sync.mp4

## Features

- Pick any two tabs (across windows) and scroll them together
- Adjustable speed and direction
- Auto-stops when both tabs reach the end
- Pause/resume

## Development

```
npm install
npm run dev
```

## Build

```
npm run build
npm run zip
```

Output goes to `.output/chrome-mv3/`.

## Install

Load `.output/chrome-mv3/` as an unpacked extension in `chrome://extensions` (developer mode).
