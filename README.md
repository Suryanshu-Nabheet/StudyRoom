# StudyRoom

A modern, production‑ready platform for **live study sessions, classrooms, and collaboration** built on top of WebRTC.

StudyRoom combines a clean marketing site, a focused meeting experience, and a hardened signaling layer to make remote studying feel as close to in‑person as possible.

---

## Highlights

- **High‑quality video & audio** – WebRTC + Simple‑Peer with fine‑tuned connection settings.
- **Interactive rooms** – live video grid, chat, and presence in a single unified experience.
- **Host controls** – end meeting for everyone, remove participants, and manage room state.
- **Real‑time telemetry** – bitrate, RTT, and jitter surfaced in the UI for quick diagnostics.
- **Render‑ready** – single Node service that runs both the Next.js app and the Socket.io signaling server.

---

## Architecture

StudyRoom is organized as a small monorepo with two workspaces and a unified runtime server:

- **Frontend** – Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion.
- **Signaling backend** – Socket.io based signaling server for WebRTC (no database required).
- **Unified server** – a custom `server.ts` entrypoint at the repo root that:
  - Boots the Next.js application from `Frontend/`.
  - Attaches Socket.io (via `SocketServer`) to the same HTTP server and port.

This means you can deploy StudyRoom as **one Node service** (e.g. a single Render web service) and still keep the codebase cleanly separated into Frontend and Backend.

---

## Project structure

```text
StudyRoom/
├── Frontend/               # Next.js application (UI)
│   ├── app/                # App Router pages & layouts
│   ├── components/         # UI, chat, layout, video components
│   ├── config/             # Frontend config & env helpers
│   ├── lib/                # WebRTC + socket client utilities
│   ├── store/              # Zustand store (room/participants/network)
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
├── Backend/                # Socket.io signaling server
│   ├── index.ts            # (standalone) server entrypoint
│   ├── socketServer.ts     # core Socket.io logic
│   ├── config/             # backend environment config
│   └── package.json        # backend dependencies
│
├── server.ts               # Unified Next.js + Socket.io HTTP server
├── package.json            # Root workspace + deployment scripts
└── render.yaml             # Optional Render IaC configuration
```

---

## Getting started

### Prerequisites

- Node.js **18+**
- npm (recommended) or yarn/pnpm

### Install dependencies

```bash
git clone https://github.com/Suryanshu-Nabheet/StudyRoom.git
cd StudyRoom
npm install
```

### Local development

There are two common ways to run StudyRoom locally.

#### 1. Recommended: separate dev servers (clearer logs)

Terminal 1 – Socket.io signaling server:

```bash
npm run server
```

Terminal 2 – Next.js app (frontend):

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and create or join a room.

In this mode:

- Frontend dev server runs on `http://localhost:3000`.
- Signaling server listens on `http://localhost:3001` (default).

#### 2. Production‑like: unified server

To run the same setup you use in production (one Node process running both UI + signaling):

```bash
npm run build   # build the Next.js app
npm start       # runs server.ts using tsx
```

This uses the unified `server.ts` entrypoint and listens on `PORT` (or `3000` if not set).

---

## Configuration & environment

Default local setup works **without any env vars**:

- Frontend dev: `http://localhost:3000`
- Signaling dev: `http://localhost:3001`

You can optionally create a `.env.local` file in `Frontend/` to override client‑side values:

```env
# Frontend (client)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# If not set in development, defaults to http://localhost:3001
NEXT_PUBLIC_SOCKET_PORT=3001

# Optional TURN server for stricter networks
# NEXT_PUBLIC_TURN_SERVER_URL=turn:your-turn-server.com:3478
# NEXT_PUBLIC_TURN_USERNAME=your-username
# NEXT_PUBLIC_TURN_CREDENTIAL=your-credential
```

Backend configuration (`Backend/config/env.ts`) uses:

- `SOCKET_PORT` (optional) – port for standalone Socket.io server (defaults to `3001`).
- `NEXT_PUBLIC_APP_URL` – frontend URL used to build the CORS allowlist for production.

---

## Deployment (Render, single service)

StudyRoom is optimized to run as a **single Node web service** on Render:

**Repository:** `https://github.com/Suryanshu-Nabheet/StudyRoom`

**Build & deploy settings:**

- **Root Directory:** *(leave empty – use repo root)*
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  npm run start
  ```

The `start` script runs `server.ts`, which:

- Serves the Next.js app from `Frontend/`.
- Attaches the Socket.io signaling server on the **same** Render `PORT`.

**Recommended environment variables on Render:**

- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://<your-studyroom-domain>.onrender.com`

No `NEXT_PUBLIC_SOCKET_URL` is required in this setup – the client will use the same origin as the page.

---

## Tech stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Real‑time:** Socket.io (client + server), Simple‑Peer on top of WebRTC.
- **State:** Zustand for room, participants, media, and network telemetry.
- **Tooling:** ESLint, TSX, modern Next.js build tooling.

---

## Roadmap ideas

- Persistent rooms and schedules (database support).
- Authentication and user profiles.
- Recording + playback of sessions.
- Organization‑level admin tools (teams, permissions, analytics).

---

## License

This project is provided as‑is for learning and experimentation. If you plan to use it in production at scale, review and adapt the code, security posture, and deployment setup to your organization’s requirements.

---

## Contact

**StudyRoom**

- GitHub: [StudyRoom repository](https://github.com/Suryanshu-Nabheet/StudyRoom)
- Issues & feature requests: please open a GitHub issue.
