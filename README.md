# Study Room - Premium Video Meetings

A production-ready real-time collaborative video meeting platform with peer-to-peer connections, real-time chat, and premium UI.

## Features

- **HD Video Calls** - Crystal-clear peer-to-peer video and audio
- **Real-time Chat** - Instant messaging during meetings
- **Unlimited Participants** - Support for multiple participants
- **Host Controls** - Meeting creator can end meetings and remove participants
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **No Sign-ups Required** - Just create or join with a room ID

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **WebRTC**: Simple-peer for peer-to-peer connections
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Suryanshu-Nabheet/StudyRoom.git
cd StudyRoom
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (optional for local development):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_PORT=3001
```

4. Start the Socket.io server:
```bash
npm run server
```

5. In a new terminal, start the Next.js app:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
StudyRoom/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── room/              # Room pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── chat/             # Chat components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   └── video/            # Video components
├── config/                 # Configuration files
├── lib/                   # Utility libraries
│   ├── socket.ts         # Socket.io client
│   └── webrtc.ts         # WebRTC manager
├── server/                # Backend server
│   ├── index.ts          # Server entry point
│   └── socketServer.ts   # Socket.io server
└── store/                 # State management
    └── roomStore.ts       # Room state store
```

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

### Frontend
- `NEXT_PUBLIC_APP_URL` - Your frontend URL
- `NEXT_PUBLIC_SOCKET_URL` - Your Socket.io server URL
- `NEXT_PUBLIC_SOCKET_PORT` - Socket.io server port (default: 3001)

### Backend
- `SOCKET_PORT` - Port for Socket.io server (default: 3001)
- `NEXT_PUBLIC_APP_URL` - Frontend URL for CORS

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11+)
- Mobile browsers (with camera/microphone permissions)

## WebRTC Requirements

- HTTPS required in production (or localhost for development)
- Camera and microphone permissions
- Modern browser with WebRTC support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.
