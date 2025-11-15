# Single Deployment Guide (Frontend + Backend Together)

This guide shows how to deploy both frontend and backend in **ONE single Render service**.

## ✅ Configuration for Single Deployment

### Render Service Settings:

**Name:** `StudyRoom` (or any name you prefer)

**Language:** Node

**Branch:** `main`

**Region:** Oregon (US West)

**Root Directory:** (Leave empty)

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm run start:all
```
⚠️ **This runs both frontend and backend together**

**Instance Type:** Free (or paid if you prefer)

**Environment Variables:**
Add these variables:

1. `NODE_ENV` = `production`
2. `PORT` = `3000` (for Next.js frontend)
3. `SOCKET_PORT` = `3001` (for Socket.io backend)
4. `NEXT_PUBLIC_APP_URL` = `https://your-service.onrender.com`
   - ⚠️ **Update this AFTER deployment** with your actual Render URL
5. `NEXT_PUBLIC_SOCKET_URL` = `https://your-service.onrender.com:3001`
   - ⚠️ **Update this AFTER deployment** with your actual Render URL
   - Note: Render may not allow custom ports, so you might need to use the same URL
6. `NEXT_PUBLIC_SOCKET_PORT` = `443` (for HTTPS)

**Health Check Path:**
```
/
```

**Auto-Deploy:** On ✅

---

## How It Works

The `start:all` script uses `concurrently` to run:
- **Frontend:** `npm start` (Next.js on port 3000)
- **Backend:** `npm run server` (Socket.io on port 3001)

Both services run in the same process, sharing the same Render service.

---

## Important Notes

### Port Configuration

Render assigns one port per service. However, we're running both services in one process:
- Next.js will use `PORT` (3000)
- Socket.io will use `SOCKET_PORT` (3001)

**Potential Issue:** Render's free tier may only expose one port. If Socket.io can't be accessed on port 3001, you may need to:

1. **Option A:** Use a paid plan that supports multiple ports
2. **Option B:** Integrate Socket.io into Next.js API routes (more complex)
3. **Option C:** Use the same port with a reverse proxy (complex)

### Testing After Deployment

1. Check if frontend loads: `https://your-service.onrender.com`
2. Check if backend is accessible (may need to test socket connection)
3. Test creating a meeting
4. Test joining a meeting
5. Check browser console for socket connection errors

---

## Troubleshooting

### Socket Connection Fails

If socket.io can't connect:
- Check that `NEXT_PUBLIC_SOCKET_URL` is set correctly
- Verify both services are running (check Render logs)
- Try using the same URL for both (if Render only exposes one port)

### Services Don't Start

- Check Render logs for errors
- Verify `concurrently` is installed (it's in package.json)
- Ensure both `PORT` and `SOCKET_PORT` are set

### Build Fails

- Check build logs
- Verify all dependencies are in package.json
- Ensure TypeScript compiles without errors

---

## Alternative: If Single Port Doesn't Work

If Render only allows one port, you'll need to either:
1. Upgrade to a paid plan
2. Use two separate services (as in RENDER_SETUP.md)
3. Integrate Socket.io into Next.js (requires code changes)

---

## Quick Checklist

- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start:all`
- [ ] Health Check: `/`
- [ ] Env vars: NODE_ENV, PORT, SOCKET_PORT, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SOCKET_URL, NEXT_PUBLIC_SOCKET_PORT
- [ ] Test frontend loads
- [ ] Test socket connection
- [ ] Test meeting creation/joining

