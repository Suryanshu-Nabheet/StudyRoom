# StudyRoom

> **A modern WebRTC-based video conferencing platform built by Suryanshu Nabheet**

StudyRoom is a production-ready platform for **live study sessions, classrooms, and real-time collaboration** built on top of WebRTC. It combines a clean marketing site, a focused meeting experience, and a hardened signaling layer to make remote studying and collaboration feel as close to in-person as possible.

---

## ✨ Highlights

- **🎥 High-quality video & audio** – WebRTC + Simple-Peer with fine-tuned connection settings
- **💬 Interactive rooms** – Live video grid, real-time chat, and presence in a unified experience
- **👑 Host controls** – End meeting for everyone, remove participants, and manage room state
- **📊 Real-time telemetry** – Bitrate, RTT, and jitter surfaced in the UI for quick diagnostics
- **🚀 Deploy-ready** – Single Node service that runs both Next.js app and Socket.io signaling server
- **🎨 Modern UI** – Beautiful glassmorphism design with smooth Framer Motion animations
- **📱 Fully responsive** – Works seamlessly on desktop, tablet, and mobile devices

---

## 🏗️ Architecture

StudyRoom is organized as a clean monorepo with two workspaces and a unified runtime server:

- **Frontend** – Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **Signaling backend** – Socket.io based signaling server for WebRTC (no database required)
- **Unified server** – Custom `server.ts` entrypoint at the repo root that:
  - Boots the Next.js application from `Frontend/`
  - Attaches Socket.io (via `SocketServer`) to the same HTTP server and port

This means you can deploy StudyRoom as **one Node service** (e.g., a single Render web service) while keeping the codebase cleanly separated into Frontend and Backend.

---

## 📁 Project Structure

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
│   ├── index.ts            # Standalone server entrypoint
│   ├── socketServer.ts     # Core Socket.io logic
│   ├── config/             # Backend environment config
│   └── package.json        # Backend dependencies
│
├── server.ts               # Unified Next.js + Socket.io HTTP server
├── package.json            # Root workspace + deployment scripts
└── render.yaml             # Optional Render IaC configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- npm (recommended) or yarn/pnpm

### Install Dependencies

```bash
git clone https://github.com/Suryanshu-Nabheet/StudyRoom.git
cd StudyRoom
npm install
```

### Local Development

There are two ways to run StudyRoom locally:

#### 1. **Recommended: Separate dev servers** (clearer logs)

**Terminal 1** – Socket.io signaling server:

```bash
npm run server
```

**Terminal 2** – Next.js app (frontend):

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and create or join a room.

In this mode:

- Frontend dev server runs on `http://localhost:3000`
- Signaling server listens on `http://localhost:3001` (default)

#### 2. **Production-like: Unified server**

To run the same setup you use in production (one Node process running both UI + signaling):

```bash
npm run build   # Build the Next.js app
npm start       # Run server.ts using tsx
```

This uses the unified `server.ts` entrypoint and listens on `PORT` (or `3000` if not set).

---

## ⚙️ Configuration & Environment

Default local setup works **without any env vars**:

- Frontend dev: `http://localhost:3000`
- Signaling dev: `http://localhost:3001`

You can optionally create a `.env.local` file in `Frontend/` to override client-side values:

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

- `SOCKET_PORT` (optional) – Port for standalone Socket.io server (defaults to `3001`)
- `NEXT_PUBLIC_APP_URL` – Frontend URL used to build the CORS allowlist for production

---

## 🌐 Deployment (Render, Single Service)

StudyRoom is optimized to run as a **single Node web service** on Render:

**Repository:** `https://github.com/Suryanshu-Nabheet/StudyRoom`

**Build & Deploy Settings:**

- **Root Directory:** _(leave empty – use repo root)_
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  npm run start
  ```

The `start` script runs `server.ts`, which:

- Serves the Next.js app from `Frontend/`
- Attaches the Socket.io signaling server on the **same** Render `PORT`

**Recommended Environment Variables on Render:**

- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://<your-studyroom-domain>.onrender.com`

No `NEXT_PUBLIC_SOCKET_URL` is required in this setup – the client will use the same origin as the page.

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide Icons
- **State Management:** Zustand

### Backend

- **Real-time Communication:** Socket.io (client + server)
- **WebRTC:** Simple-Peer
- **Runtime:** Node.js with TSX

### DevOps

- **Tooling:** ESLint, modern Next.js build tooling
- **Deployment:** Single-service architecture (Render-ready)

---

## 🎯 Features

### For Participants

- ✅ Instant room creation with shareable links
- ✅ Join rooms with a simple room ID
- ✅ High-quality video and audio streaming
- ✅ Real-time text chat
- ✅ Screen sharing capabilities
- ✅ Network quality indicators
- ✅ Responsive design for all devices

### For Hosts

- ✅ End meeting for all participants
- ✅ Remove individual participants
- ✅ Lock/unlock room to prevent new joins
- ✅ Mute all participants
- ✅ Disable cameras for all participants
- ✅ View connection statistics

---

## 🗺️ Roadmap

- [ ] Persistent rooms and schedules (database support)
- [ ] Authentication and user profiles
- [ ] Recording + playback of sessions
- [ ] Organization-level admin tools (teams, permissions, analytics)
- [ ] Breakout rooms
- [ ] Virtual backgrounds
- [ ] Polls and Q&A features
- [ ] Whiteboard integration

---

## 👨‍💻 Author

**Suryanshu Nabheet**

A passionate developer focused on creating seamless real-time communication experiences with cutting-edge WebRTC technology.

- GitHub: [@Suryanshu-Nabheet](https://github.com/Suryanshu-Nabheet)
- Project Repository: [StudyRoom](https://github.com/Suryanshu-Nabheet/StudyRoom)

---

## 📄 License

This project is provided as-is for learning and experimentation. If you plan to use it in production at scale, review and adapt the code, security posture, and deployment setup to your organization's requirements.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Suryanshu-Nabheet/StudyRoom/issues).

---

## 📞 Support

For questions, issues, or feature requests:

- Open a [GitHub issue](https://github.com/Suryanshu-Nabheet/StudyRoom/issues)
- Star ⭐ this repository if you find it helpful!

---

<div align="center">
  <strong>Built with ❤️ by Suryanshu Nabheet</strong>
  <br>
  <sub>Making remote collaboration feel personal</sub>
</div>
