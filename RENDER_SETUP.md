# Render Deployment Setup Guide

## ⚠️ Important: You Need TWO Separate Services

You need to deploy **TWO services** on Render:
1. **Frontend** (Next.js app)
2. **Backend** (Socket.io server)

---

## Service 1: Frontend (Next.js)

### Configuration:

**Name:** `study-room-frontend`

**Language:** Node

**Branch:** `main`

**Region:** Oregon (US West) ✅

**Root Directory:** (Leave empty)

**Build Command:** 
```
npm install && npm run build
```
⚠️ **Change:** Use `&&` not `;` (semicolon)

**Start Command:**
```
npm start
```
⚠️ **Change:** Use `npm start` not `npm run start`

**Instance Type:** Free ✅

**Environment Variables:**
Add these variables (click "Add Environment Variable" for each):

1. `NODE_ENV` = `production`
2. `PORT` = `3000` ✅ (you already have this)
3. `NEXT_PUBLIC_APP_URL` = `https://study-room-frontend.onrender.com`
   - ⚠️ **Update this AFTER deployment** with your actual frontend URL
4. `NEXT_PUBLIC_SOCKET_URL` = `https://study-room-backend.onrender.com`
   - ⚠️ **Update this AFTER deploying backend** with your actual backend URL
5. `NEXT_PUBLIC_SOCKET_PORT` = `443`

**Health Check Path:**
```
/
```
⚠️ **Change:** Use `/` not `/healthz` (Next.js serves on root)

**Auto-Deploy:** On ✅

---

## Service 2: Backend (Socket.io)

**After deploying frontend, create a SECOND service:**

**Name:** `study-room-backend`

**Language:** Node

**Branch:** `main`

**Region:** Oregon (US West) ✅ (same as frontend)

**Root Directory:** (Leave empty)

**Build Command:**
```
npm install
```

**Start Command:**
```
npm run server
```

**Instance Type:** Free ✅

**Environment Variables:**
Add these variables:

1. `NODE_ENV` = `production`
2. `PORT` = `3001`
3. `SOCKET_PORT` = `3001`
4. `NEXT_PUBLIC_APP_URL` = `https://study-room-frontend.onrender.com`
   - ⚠️ **Update with your actual frontend URL**

**Health Check Path:**
```
/api/socket
```

**Auto-Deploy:** On ✅

---

## Deployment Steps:

### Step 1: Deploy Frontend
1. Use the configuration above for frontend
2. Click "Deploy web service"
3. Wait for deployment to complete
4. **Copy the service URL** (e.g., `https://study-room-frontend-xxxx.onrender.com`)

### Step 2: Deploy Backend
1. Create a NEW web service
2. Use the backend configuration above
3. Click "Deploy web service"
4. Wait for deployment to complete
5. **Copy the service URL** (e.g., `https://study-room-backend-xxxx.onrender.com`)

### Step 3: Update Environment Variables

**Frontend Service:**
1. Go to frontend service → Environment tab
2. Update `NEXT_PUBLIC_APP_URL` = your frontend URL
3. Update `NEXT_PUBLIC_SOCKET_URL` = your backend URL
4. Save changes (will trigger redeploy)

**Backend Service:**
1. Go to backend service → Environment tab
2. Update `NEXT_PUBLIC_APP_URL` = your frontend URL
3. Save changes (will trigger redeploy)

---

## Quick Checklist:

### Frontend Service:
- [ ] Name: `study-room-frontend`
- [ ] Build: `npm install && npm run build`
- [ ] Start: `npm start`
- [ ] Health: `/`
- [ ] Env vars: NODE_ENV, PORT, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SOCKET_URL, NEXT_PUBLIC_SOCKET_PORT

### Backend Service:
- [ ] Name: `study-room-backend`
- [ ] Build: `npm install`
- [ ] Start: `npm run server`
- [ ] Health: `/api/socket`
- [ ] Env vars: NODE_ENV, PORT, SOCKET_PORT, NEXT_PUBLIC_APP_URL

---

## Common Issues:

1. **Build fails:** Check build logs, ensure all dependencies are in package.json
2. **Socket connection fails:** Verify environment variables are set correctly
3. **Service sleeps:** Free tier services sleep after 15 min inactivity (first request may be slow)
4. **CORS errors:** Ensure NEXT_PUBLIC_APP_URL in backend matches frontend URL

---

## After Deployment:

1. Test frontend URL in browser
2. Create a meeting
3. Test socket connection (check browser console)
4. Test video/audio functionality

