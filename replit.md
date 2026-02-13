# APOST-Y

## Overview
APOST-Y is a real-time AI assistant for police oral board assessments. Uses OpenAI Realtime API via WebSocket for audio input (microphone) with text output (streaming responses). Built as a React web app with Electron scaffolding for future desktop builds. UI theme is a clean black/grey/white palette.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express server (port 3001) with WebSocket proxy to OpenAI Realtime API
- **State Management**: Zustand with localStorage persistence
- **AI**: OpenAI Realtime API (gpt-4o-realtime-preview) via WebSocket relay

### Key Design Decisions
- Backend proxy keeps API key server-side (never exposed to browser)
- Graceful degradation: Electron-specific features (global hotkeys, system tray, always-on-top) fall back to browser equivalents
- localStorage used for persistence in web mode, electron-store for desktop
- Audio captured at 24kHz PCM16 format as required by OpenAI Realtime API

## Project Structure
```
├── server/              # Express + WebSocket proxy backend
│   └── index.ts
├── src/                 # React frontend
│   ├── components/
│   │   ├── overlay/     # Overlay view (during assessment)
│   │   ├── settings/    # Settings panels (shadcn/ui)
│   │   ├── shared/      # Shared components
│   │   └── ui/          # shadcn/ui primitives
│   ├── services/        # Business logic services
│   ├── store/           # Zustand state management
│   ├── hooks/           # React hooks
│   ├── types/           # TypeScript type definitions
│   ├── constants/       # Default configs and templates
│   ├── utils/           # Utility functions
│   └── lib/             # shadcn/ui utilities
├── electron/            # Electron scaffolding (future desktop)
│   ├── managers/        # Window, Hotkey, Tray, Store managers
│   ├── ipc/             # IPC channel constants
│   ├── main.ts          # Electron entry point
│   └── preload.ts       # Context bridge
├── start.js             # Combined server + Vite launcher
├── vite.config.ts       # Vite configuration
└── package.json
```

## Running
- `node start.js` - Starts both backend (port 3001) and Vite dev server (port 5000)
- Backend proxies `/ws` WebSocket and `/api` routes from Vite to Express

## Environment
- `OPENAI_API_KEY` - Required for OpenAI Realtime API access (stored as secret)
- `SESSION_SECRET` - Session secret (stored as secret)

## Features
- **Two Modes**: Overlay (compact, for during assessment) and Full (settings/admin)
- **Audio Input**: Microphone capture with VAD or Push-to-Talk modes
- **Real-time AI**: Streaming text responses via OpenAI Realtime API
- **Note Sets**: Multiple reference note sets (10-codes, penal codes, procedures) with toggle
- **Settings**: General, Audio, Keybinds, Notes, Appearance panels
- **Keyboard Shortcuts**: Configurable keybinds for push-to-talk, mute, cancel, clear, overlay toggle
- **Persistence**: All settings saved to localStorage (web) or electron-store (desktop)

## Recent Changes
- 2026-02-13: Markdown rendering for AI responses
  - Added MarkdownText component supporting bold, bullet lists, numbered lists, line breaks
  - AnswerPanel and TranscriptPanel render formatted AI output instead of raw text
- 2026-02-13: PTT audio gating fix
  - Audio data only sent to OpenAI when PTT key is actively held
  - Prevents unintended microphone streaming in push-to-talk mode
- 2026-02-13: Audio source indicators in header
  - Shows mic status (active/muted), system audio badge, VAD/PTT mode, listening state when connected
  - System audio error handling explains iframe limitations with workaround guidance
- 2026-02-13: Fixed critical WebSocket proxy race condition
  - Server now queues client messages until OpenAI WebSocket is ready (was silently dropping session.update)
  - Audio capture deferred until session.updated confirmed (prevents audio starvation)
  - Added handlers for response.audio_transcript.delta/done as fallback for audio output mode
  - sessionConfigured flag gates audio sending to prevent premature data
- 2026-02-12: Fixed OpenAI Realtime API integration
  - Enabled input_audio_transcription (whisper-1) for user speech transcription
  - Added proper event handlers for both beta and GA API event names
  - Added response.create for push-to-talk audio commit
  - Added server-side debug logging for event relay
  - Updated AnswerPanel with contextual status messages
  - Fixed duplicate transcript entries in finalizeAnswer flow
- 2026-02-12: Initial project setup with full scaffold implementation
  - React + Vite + TypeScript + Tailwind CSS + shadcn/ui
  - OpenAI Realtime API WebSocket proxy backend
  - All UI components (overlay + settings)
  - Zustand store with persistence
  - Electron scaffolding for future desktop builds
  - Audio capture service with VAD/PTT support
