# Study Room

A production-ready real-time collaborative video meeting platform with peer-to-peer connections, real-time chat, and premium UI.

## Features

- **HD Video Calls** - Crystal-clear peer-to-peer video and audio connections
- **Real-time Chat** - Instant messaging during meetings
- **Easy Collaboration** - Share meeting links instantly, no accounts required
- **Meeting Titles** - Name your meetings for better organization
- **User Names** - Personalize your presence in meetings
- **Professional UI** - Premium dark theme with smooth animations
- **Connection Status** - Monitor WebRTC and Socket.io connections

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Realtime:** WebRTC (simple-peer) + Socket.io signaling
- **State:** Zustand
- **UI:** Professional dark theme with SVG icons
- **Icons:** Custom SVG icons

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Start the signaling server:**
   ```bash
   npm run server
   ```

4. **Start the Next.js app (in another terminal):**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

1. **Create a Meeting:**
   - Enter your name
   - Enter a meeting title (e.g., "Study Session - Math")
   - Click "Create Meeting"

2. **Join a Meeting:**
   - Enter your name
   - Enter the Room ID or paste the share link
   - Click "Join Meeting"

3. **Share Meeting:**
   - Click the "Share" button in the meeting room
   - Copy and share the link with others

## Project Structure

```
/app
  /page.tsx              # Home page (join/create meeting)
  /room/[id]/page.tsx    # Room page with video grid and sidebar
/components
  VideoGrid.tsx          # Peer video display (Zoom-like grid)
  ChatPanel.tsx          # Real-time chat
  ConnectionStatus.tsx  # Connection monitoring
  Sidebar.tsx            # Tabbed sidebar (Chat, Participants, Details)
  JoinRoom.tsx           # Room join/create UI
  Icon.tsx               # SVG icon component
/lib
  webrtc.ts              # WebRTC peer connections
  socket.ts              # Socket.io client
/store
  roomStore.ts           # Zustand state management
/public/icons            # SVG icon files
/server.js               # Socket.io signaling server
```

## Production Deployment

### Environment Variables

Create `.env.local` with:
```env
NEXT_PUBLIC_SOCKET_URL=https://your-signaling-server.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deploy Frontend (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Or connect GitHub repo in Vercel dashboard
4. Add environment variables in Vercel settings

### Deploy Signaling Server

Deploy `server.js` to Render, Fly.io, or Railway:
- Set start command: `node server.js`
- Update CORS in `server.js` to allow your frontend domain
- Set `PORT` environment variable (default: 3001)

### Production Requirements

- ✅ HTTPS enabled (required for WebRTC)
- ✅ Environment variables configured
- ✅ Signaling server accessible
- ✅ CORS properly configured

## Important Notes

- All media is peer-to-peer (no server recordings)
- Requires HTTPS in production for WebRTC
- Video grid automatically adjusts layout based on participant count (Zoom-like)
- SVG icons are used throughout the UI
- Real-time chat and participant management
- Professional dark theme UI
- User names and meeting titles are stored in sessionStorage

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for our community standards.

## License

MIT License - see [LICENSE](LICENSE) for details.
