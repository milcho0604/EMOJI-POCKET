# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome browser extension (Manifest V3) called "이모지 포켓" (Emoji Pocket) - an emoji and kaomoji picker with favorites, recent history, custom emojis, and dark/light theme support. The extension uses Chrome sync storage for data synchronization across devices.

## Build Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Production build (outputs to dist/)
pnpm run build

# Development mode with watch (auto-rebuild on file changes)
pnpm run dev

# Clean build artifacts
pnpm run clean
```

## Loading the Extension in Chrome

1. Build the project: `pnpm run build`
2. Navigate to `chrome://extensions/` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked extension"
5. Select the `dist/` folder

During development, use `pnpm run dev` to watch for changes, then manually reload the extension in Chrome after rebuilds.

## Architecture

### Core Technologies

- **TypeScript** with strict mode enabled
- **Vite** for building and bundling
- **Chrome Extension API** (Manifest V3) with `storage.sync` for cross-device data synchronization
- **Vanilla JavaScript/TypeScript** (no frameworks) - all UI manipulation via DOM APIs

### Project Structure

```
ch-pop/
├── public/               # Static assets (copied to dist/)
│   ├── manifest.json    # Chrome extension manifest
│   ├── icons/           # Extension icons
│   └── data/            # Emoji/kaomoji data files
│       ├── emoji/       # Category-based JSON files (emotion, hands, hearts, animals, foods, objects, nature, symbols, events)
│       └── kaomoji.json # Kaomoji data
├── src/
│   └── popup.ts         # Main application logic (all functionality in single file)
├── index.html           # Popup HTML with embedded styles
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

### Key Architectural Patterns

**Single-File Application**: All logic resides in `src/popup.ts` (~800 lines). This includes:
- Chrome storage sync utilities
- Data loading and caching
- UI rendering and event handling
- Theme management
- Favorites and recent history management

**Data Loading Strategy**:
- **Lazy Loading**: Emoji categories are loaded on-demand when selected
- **Caching**: Once loaded, category data is cached in memory (`EMOJIS` array)
- **Initial Load**: Only "표정" (emotion) and "하트" (hearts) categories are pre-loaded
- **Kaomoji**: Loaded once at initialization from `data/kaomoji.json`

**Chrome Sync Storage Architecture**:
- All user data uses `chrome.storage.sync` API (not localStorage)
- In-memory caches (`FAVORITES`, `RECENT`, `CUSTOM_EMOJIS`, `CUSTOM_KAOMOJI`, `THEME`) for performance
- One-time migration from localStorage to sync storage on first run
- Real-time sync listener (`chrome.storage.onChanged`) updates cache and re-renders UI when data changes in other sessions
- Data synced across devices: favorites, recent items, custom emojis/kaomoji, theme preference

**State Management**:
- Global variables for state (`EMOJIS`, `KAOMOJI`, `ACTIVE_CAT`, `activeTab`, etc.)
- Synchronous cache read from memory
- Asynchronous writes to `chrome.storage.sync` with cache updates
- UI re-renders on state changes

**Data Format**:
```typescript
type Emoji = { char: string; tags: string[]; category: string };
type Kaomoji = { char: string; tags: string[] };
type Item = { char: string; tags: string[]; category?: string };
```

Each emoji JSON file contains an array of objects with `char` and `tags` fields. The `category` field is added at runtime when loading.

## Development Guidelines

### Modifying Emoji/Kaomoji Data

- Emoji data files are in `public/data/emoji/` organized by category
- Each emoji has `char` (the emoji character) and `tags` (array of search keywords in Korean/English)
- Kaomoji data is in `public/data/kaomoji.json`
- After modifying data files, rebuild the extension

### Adding New Categories

1. Add the category name and file path to `CATEGORY_FILES` object in `popup.ts`
2. Update `CATEGORY_ORDER` array to control display order
3. Create the corresponding JSON file in `public/data/emoji/`

### Chrome Extension Permissions

The extension requires:
- `activeTab`: Access to current tab
- `scripting`: For cursor insertion feature (currently commented out)
- `storage`: For Chrome sync storage
- `host_permissions` (`http://*/*`, `https://*/*`): For cursor insertion feature

### Storage Sync Considerations

- Chrome sync storage has quota limits (100KB total, 8KB per item)
- Storage writes are async and may fail - always handle errors appropriately
- The `chrome.storage.onChanged` listener keeps multiple instances in sync
- Migration function (`migrateLocalOnce`) runs once to move old localStorage data

### Theme System

- CSS custom properties (CSS variables) define light/dark themes
- Theme controlled via `data-theme` attribute on `<html>` element
- Theme preference is stored in Chrome sync storage and syncs across devices

## Common Tasks

**Testing the extension locally**: Run `pnpm run dev`, load the `dist/` folder as an unpacked extension in Chrome, make changes, and reload the extension.

**Debugging**: Use Chrome DevTools on the popup (right-click extension icon → Inspect popup).

**Adding a new feature**: Modify `popup.ts` and `index.html` as needed. Most functionality is event-driven through DOM event listeners.

## Code Style

- TypeScript with ES2020 target
- Async/await for asynchronous operations
- No external runtime dependencies (only build-time dev dependencies)
- DOM manipulation via vanilla JavaScript
- Korean language used for UI strings and comments
