# Deployment Fix - Socket.io Integration

## Problem
Socket.io was trying to run on a separate port (3001), but Render only exposes one port per service. This caused connection failures.

## Solution
Integrated Socket.io directly into Next.js server so both run on the same port.

## Changes Made

1. **Created `server.js`** - Custom Next.js server with Socket.io integrated
2. **Updated `package.json`** - Changed start command to use `server.js`
3. **Updated `config/env.ts`** - Socket URL now uses same URL as Next.js
4. **Socket handlers** - All socket logic is now in `server.js`

## Updated Render Configuration

### Build Command:
```
npm install && npm run build
```

### Start Command:
```
node server.js
```
⚠️ **This is the key change!**

### Environment Variables:
- `NODE_ENV` = `production`
- `PORT` = `3000`
- `NEXT_PUBLIC_APP_URL` = `https://your-service.onrender.com`
- `NEXT_PUBLIC_SOCKET_URL` = (leave empty - will auto-detect)
- `NEXT_PUBLIC_SOCKET_PORT` = `443`

## How It Works

1. `server.js` creates an HTTP server
2. Next.js handles all HTTP requests
3. Socket.io attaches to the same HTTP server
4. Both run on the same port (PORT environment variable)
5. Socket.io automatically uses the same URL as Next.js

## Next Steps

1. **Update Render service:**
   - Change Start Command to: `node server.js`
   - Remove `SOCKET_PORT` environment variable (not needed)
   - Update `NEXT_PUBLIC_APP_URL` to your Render URL
   - Remove `NEXT_PUBLIC_SOCKET_URL` (will auto-detect)

2. **Redeploy:**
   - Save changes in Render
   - Service will automatically redeploy
   - Check logs to verify both services start

3. **Test:**
   - Open your Render URL
   - Create a meeting
   - Should connect immediately (no more "Setting up connection...")

## Verification

After deployment, check Render logs for:
- `✅ Next.js server ready on http://0.0.0.0:3000`
- `✅ Socket.io server ready on the same port`
- `✅ Socket.io handlers initialized`

If you see these messages, everything is working!

