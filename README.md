# Globo — AI Travel Companion

A React + Vite travel assistant that uses Google Gemini to generate destination suggestions, itineraries, and travel advice in a conversational chat UI.

## Features

- AI-powered travel chat assistant with a friendly persona
- Destination cards, itinerary timelines, and gamified progress elements
- Speech recognition and speech synthesis support in the browser
- Modern UI built with React, Tailwind-style classes, and motion animations


## Tech Stack

- `React` + `TypeScript`
- `Vite`
- `@google/genai`
- `motion/react`
- `lucide-react`
- `canvas-confetti`

## Getting Started

### Prerequisites

- Node.js 18+ or newer
- npm

### Install

```bash
npm install
```

### Configure API Key

1. Copy `.env.example` to `.env.local`.
2. Add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

### Run locally

```bash
npm run dev
```

Open the displayed local URL in your browser to use the app.

## Scripts

- `npm run dev` — start development server
- `npm run build` — build production assets
- `npm run preview` — preview the production build
- `npm run lint` — typecheck the project

## Project Structure

- `src/App.tsx` — main app and chat UI logic
- `src/components/GloboCharacter.tsx` — animated character component
- `src/services/geminiService.ts` — Gemini API request helper and response schema
- `src/lib/utils.ts` — utility helpers

## Notes

- The app uses `GEMINI_API_KEY` to call Gemini.
- If the voice features are available in your browser, the app can read responses aloud.

## License

This project is provided as-is.
