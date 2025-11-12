# AI WebRTC Study Rooms

A production-ready real-time collaborative study room application with AI-powered transcription, summarization, and voice assistance.

## Features

- **WebRTC Peer-to-Peer Video/Audio** - Direct connections between users
- **Real-time Transcription** - AI transcribes conversations every 10 seconds
- **AI Summarization** - OpenRouter/OpenAI generates key insights
- **Voice Study Buddy** - Text-to-speech explanation of summaries
- **Professional UI** - Clean, modern interface with dark theme
- **Real-time Chat** - Text messaging during study sessions
- **Connection Status** - Monitor WebRTC and Socket.io connections

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Realtime:** WebRTC (simple-peer) + Socket.io signaling
- **AI:** OpenRouter API (GPT-4o-mini) + Whisper for transcription
- **State:** Zustand
- **UI:** Professional dark theme with SVG icons
- **Icons:** Custom SVG icons in `/public/icons`

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
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

1. **Create a Room:** Click "Create New Room" to generate a unique room ID
2. **Join a Room:** Enter a room ID and click "Join Room"
3. **Allow Permissions:** Grant camera and microphone access
4. **Study Together:** The AI will automatically:
   - Transcribe your conversations every 10 seconds
   - Generate summaries every minute
   - Provide voice explanations on demand

## Project Structure

```
/app
  /page.tsx              # Home page (join/create room)
  /room/[id]/page.tsx    # Room page with video/transcripts
  /api
    /transcribe          # Whisper API transcription
    /summarize           # LangChain summarization
/components
  VideoGrid.tsx          # Peer video display
  TranscriptPanel.tsx    # Live transcript feed
  SummaryCard.tsx        # AI summary display
  VoiceAssistant.tsx    # TTS study buddy
  JoinRoom.tsx           # Room join/create UI
/lib
  webrtc.ts              # WebRTC peer connections
  socket.ts              # Socket.io client
/store
  roomStore.ts           # Zustand state management
/server.js               # Socket.io signaling server
```

## Production Deployment

### Environment Variables

Create `.env.local` with:
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
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
- ✅ API routes secured

## Project Structure

```
/app
  /page.tsx              # Home page (join/create room)
  /room/[id]/page.tsx    # Room page with video grid and sidebar
/components
  VideoGrid.tsx          # Peer video display (Zoom-like grid)
  ChatPanel.tsx          # Real-time chat
  ConnectionStatus.tsx   # Connection monitoring
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

## Important Notes

- All media is peer-to-peer (no server recordings)
- Requires HTTPS in production for WebRTC
- Video grid automatically adjusts layout based on participant count (Zoom-like)
- SVG icons are used throughout the UI
- Real-time chat and participant management
- Professional dark theme UI

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for our community standards.

## License

MIT License - see [LICENSE](LICENSE) for details.

