# ⚡ Bey Tracker

A mobile-first, arcade-styled battle stats tracker for **Beyblade X**.
Record combos, track finish types, and analyze win rates — all stored locally in your browser.

![Beyblade X](https://img.shields.io/badge/Beyblade-X-00F5FF?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)

## Features

- **Combo Roster** — register Blade / Ratchet / Bit combinations
- **Battle Recording** — log wins and losses by finish type with one tap
- **Live Stats** — win rate, average win score, net points per battle
- **Undo** — reverse the last recorded result
- **Persistent storage** — data saved locally; no account needed
- **Mobile-first** — bottom tab navigation, large touch targets, CRT scanline aesthetic

## Finish Types

| Finish | Points | Description |
|--------|--------|-------------|
| 🌀 Spin Finish | 1 PT | Opponent stops spinning |
| 💥 Over Finish | 2 PT | Opponent exits the stadium |
| 💢 Burst Finish | 2 PT | Opponent's Beyblade bursts apart |
| ⚡ Xtreme Finish | 3 PT | Opponent hits the Xtreme Line and exits |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Usage

1. Tap **+ NEW** to add a Beyblade combo (Blade · Ratchet · Bit)
2. Go to the **BATTLE** tab and tap **WIN** or **LOSS** after each match
3. Check **STATS** for a full score breakdown and formula details
4. Tap **?** in the header for an interactive how-to guide

## Tech Stack

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- Google Fonts — Press Start 2P

## License

MIT
