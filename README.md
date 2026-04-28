# codekiwi-app-frontend

> The real-time classroom interface for [CodeKiwi](https://codekiwi.tech) — students join a teacher's live session, see synchronized slides, and code in a built-in editor.

## What it does

- **Student View** — synchronized slides on the left, Monaco code editor + xterm.js terminal on the right; locks when the teacher toggles editor lock
- **Teacher View** — slide navigation controls, live student count, editor lock toggle, session management
- **Teacher Dashboard** — grid of all connected students with live code previews
- **Teacher Inspect** — full code + output view for a single student's editor
- **Enter Name** — student onboarding screen before joining a session

Real-time updates (slide changes, lock state, session end) are delivered over a single WebSocket connection per view. Each view sends a `join` message on connect so broadcasts are scoped to the correct session.

## Stack

| Layer | Tech |
|---|---|
| Framework | React (Create React App) |
| Code editor | Monaco Editor (`@monaco-editor/react`) |
| Terminal | xterm.js + xterm-addon-fit |
| Routing | React Router v6 |
| Real-time | WebSocket (native) |

## Setup

```bash
git clone https://github.com/JayantDeveloper/codekiwi-app-frontend
cd codekiwi-app-frontend
npm install
```

Create a `.env` file:

```env
REACT_APP_BACKEND_URL=https://api.codekiwi.app
```

```bash
npm start      # dev server on :3000
npm run build  # production build
```

## Environment variables

| Variable | Description |
|---|---|
| `REACT_APP_BACKEND_URL` | Base URL of the backend (WebSocket URL is derived automatically by replacing `http` → `ws`) |

## Related repositories

- [codekiwi-app-backend](https://github.com/JayantDeveloper/codekiwi-app-backend) — WebSocket server, session management, code execution
- [codekiwi-site](https://github.com/JayantDeveloper/codekiwi-site) — Commercial site and teacher portal

Live app → [codekiwi.app](https://codekiwi.app)
