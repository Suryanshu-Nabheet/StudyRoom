# Study Room · Ultra-stable WebRTC classrooms

A production‑ready study platform with a minimalist marketing site, premium meeting UI, and a battle-tested WebRTC stack.

## Feature highlights

- **Premium landing experience** – hero, feature grid, workflow walkthrough, CTA + footer.
- **Crystal-clear media** – 1080p/60fps video, Opus audio with AGC/AEC/NR, adaptive bitrate and jitter buffers.
- **Screen sharing & media controls** – mute/unmute, camera toggle, share/stop share, leave button, and live network stats.
- **Host moderation** – end session for everyone, remove participants, see presence and chat in the sidebar.
- **Realtime chat** – lightweight message panel with auto-scroll, user badges, and socket-driven updates.
- **Connection telemetry** – bitrate, RTT, jitter surfaced in UI plus toast-based error handling.

## Tech stack

- **Frontend** – Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **State / Toasts** – Zustand store for peers/media/chat, handcrafted toast system.
- **Media** – Simple-Peer on top of pure WebRTC, custom media controller utilities, screen-share track replacement.
- **Backend** – Lightweight Socket.io signaling service (no DB, no persistence).

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
git clone https://github.com/Suryanshu-Nabheet/StudyRoom.git
cd StudyRoom
npm install
```

3. Create a `.env.local` file in the root directory (optional for local development):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_PORT=3001

# Optional: TURN server for better connectivity behind NATs
# NEXT_PUBLIC_TURN_SERVER_URL=turn:your-turn-server.com:3478
# NEXT_PUBLIC_TURN_USERNAME=your-username
# NEXT_PUBLIC_TURN_CREDENTIAL=your-credential
```

4. Start the Socket.io server (terminal #1):

```bash
npm run server
```

5. Start the Next.js frontend (terminal #2):

```bash
npm run dev
```

6. Visit [http://localhost:3000](http://localhost:3000) and launch a room.

## Project structure

Clean Frontend/Backend workspaces managed from the repo root:

```
StudyRoom/
├── Frontend/              # Frontend (Next.js application)
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── room/         # Room pages
│   │   ├── page.tsx      # Landing page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── chat/         # Chat components
│   │   ├── layout/       # Layout components
│   │   ├── ui/           # UI components
│   │   └── video/        # Video components
│   ├── config/           # Configuration files
│   ├── lib/              # Utility libraries
│   │   ├── socket.ts     # Socket.io client
│   │   └── webrtc.ts     # WebRTC manager
│   ├── store/            # State management
│   │   └── roomStore.ts  # Room state store
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   ├── next.config.js    # Next.js configuration
│   └── tsconfig.json     # TypeScript configuration
│
├── Backend/               # Backend (Socket.io server)
│   ├── index.ts         # Server entry point
│   ├── socketServer.ts  # Socket.io server logic
│   ├── config/          # Server configuration
│   ├── package.json     # Server dependencies
│   └── tsconfig.json    # TypeScript configuration
│
├── package.json          # Root package.json with workspace scripts
└── README.md            # This file
```

### Available scripts

- `npm run dev` – run the Next.js app (`Frontend`)
- `npm run build` / `npm run start` – production build + start (`Frontend`)
- `npm run server` / `npm run server:dev` – start the Socket.io signaling service (`Backend`)
- `npm run clean` – remove caches/dist artifacts

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

1. **Vercel (Frontend) + Render/Railway (Backend)**
   - Deploy frontend to Vercel
   - Deploy backend to Render or Railway
   - Configure environment variables

2. **Render (Full Stack)**
   - Create two services: one for frontend, one for backend
   - Configure environment variables for both

3. **Railway (Full Stack)**
   - Similar to Render setup

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Frontend (Client)
- `NEXT_PUBLIC_APP_URL` - Your frontend URL (default: `http://localhost:3000`)
- `NEXT_PUBLIC_SOCKET_URL` - Your Socket.io server URL (default: auto-detected)
- `NEXT_PUBLIC_SOCKET_PORT` - Socket.io server port (default: 3001)

### Backend (Server)
- `SOCKET_PORT` - Port for Socket.io server (default: 3001)
- `NEXT_PUBLIC_APP_URL` - Frontend URL for CORS (default: `http://localhost:3000`)

### Optional: TURN Server (for better connectivity)
- `NEXT_PUBLIC_TURN_SERVER_URL` - TURN server URL (e.g., `turn:your-server.com:3478`)
- `NEXT_PUBLIC_TURN_USERNAME` - TURN server username
- `NEXT_PUBLIC_TURN_CREDENTIAL` - TURN server credential

**Note**: TURN servers help with connectivity behind strict NATs and firewalls. For production, consider using a service like Twilio, Xirsys, or self-hosted coturn.

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11+)
- Mobile browsers (with camera/microphone permissions)

## Media & stability features

- **Video** – 1080p/60fps desktop streams, 720p fallback for mobile, hardware-accelerated rendering.
- **Audio** – Opus @ 48kHz, built-in AEC/AGC/NR, auto mute/unmute states, and safety handling for permission issues.
- **Screen sharing** – real-time track replacement so peers stay connected and never renegotiate unnecessarily.
- **Signaling** – pure Socket.io with no database, host teardown, participant removal, instant reconnection.
- **Telemetry** – periodic `RTCPeerConnection` stats drive bitrate/jitter/RTT widgets and inform the media controller.

## Production tips

- Always serve the frontend over HTTPS in production or use a TURN server.
- For strict firewalls, configure `NEXT_PUBLIC_TURN_*` variables.
- Horizontal scale: deploy backend behind a process manager (PM2, systemd) or container with sticky sessions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See LICENSE file for details.

## Support

Questions or suggestions? Open an issue on GitHub – contributions and feedback are welcome.
