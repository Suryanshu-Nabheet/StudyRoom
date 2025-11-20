# Deployment Guide - Study Room

## 🚀 Deploying to Render

This guide will help you deploy the Study Room application to Render as a full-stack application.

### Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. Your GitHub repository connected to Render
3. Both frontend and backend code pushed to GitHub

### Deployment Steps

#### Option 1: Using Blueprint (render.yaml) - RECOMMENDED

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create New Blueprint on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create both services

3. **Configure Environment Variables**
   
   After both services are created, you need to update the environment variables:
   
   **Frontend Service:**
   - `NEXT_PUBLIC_APP_URL`: Set to your frontend URL (e.g., `https://study-room-frontend.onrender.com`)
   - `NEXT_PUBLIC_SOCKET_URL`: Set to your backend URL (e.g., `https://study-room-backend.onrender.com`)
   
   **Backend Service:**
   - `NEXT_PUBLIC_APP_URL`: Set to your frontend URL (same as above)

4. **Redeploy Both Services**
   - After updating environment variables, manually trigger a redeploy for both services
   - Go to each service → Click "Manual Deploy" → "Deploy latest commit"

#### Option 2: Manual Deployment

**Backend Service:**
1. Create a new "Web Service" on Render
2. Connect your repository
3. Configure:
   - **Name**: `study-room-backend`
   - **Root Directory**: Leave empty (or set to `/`)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `NEXT_PUBLIC_APP_URL`: (will set after frontend is deployed)

**Frontend Service:**
1. Create another "Web Service" on Render
2. Connect the same repository
3. Configure:
   - **Name**: `study-room-frontend`
   - **Root Directory**: Leave empty (or set to `/`)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `NEXT_PUBLIC_APP_URL`: `https://[your-frontend-name].onrender.com`
     - `NEXT_PUBLIC_SOCKET_URL`: `https://[your-backend-name].onrender.com`
     - `NEXT_PUBLIC_SOCKET_PORT`: `443`

4. After both services are deployed, update the backend's `NEXT_PUBLIC_APP_URL` to point to your frontend URL
5. Redeploy both services

### Important Configuration Notes

#### Port Configuration
- **Development**: Backend runs on port 3001, Frontend on port 3000
- **Production (Render)**: Render assigns ports dynamically via the `PORT` environment variable
- The backend will automatically use `process.env.PORT` if available
- The frontend socket client will connect to the backend URL without a port (defaults to 443 for HTTPS)

#### CORS Configuration
The backend is configured to accept requests from your frontend URL. Make sure `NEXT_PUBLIC_APP_URL` is set correctly in the backend service.

#### WebRTC Considerations
- For production use over HTTPS (which Render provides), WebRTC should work without additional TURN servers for most users
- For users behind strict NATs/firewalls, consider adding TURN server configuration:
  - `NEXT_PUBLIC_TURN_SERVER_URL`: Your TURN server URL
  - `NEXT_PUBLIC_TURN_USERNAME`: Your TURN username
  - `NEXT_PUBLIC_TURN_CREDENTIAL`: Your TURN credential

### Verification Steps

After deployment:

1. **Check Backend**
   - Visit `https://[your-backend-name].onrender.com/socket.io/`
   - You should see: `{"code":0,"message":"Transport unknown"}` (this is normal)

2. **Check Frontend**
   - Visit `https://[your-frontend-name].onrender.com`
   - You should see the Study Room landing page

3. **Test WebRTC**
   - Create a new room
   - Open the room link in an incognito/private window
   - Verify that both users can see and hear each other
   - Test chat functionality
   - Test screen sharing
   - Test host controls (if applicable)

### Troubleshooting

#### Backend Not Connecting
- Check that `NEXT_PUBLIC_SOCKET_URL` in frontend matches your backend URL exactly
- Verify backend logs for CORS errors
- Ensure backend is running (check Render logs)

#### Build Failures
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json`
- Make sure workspace configuration is correct

#### WebRTC Connection Issues
- Ensure you're using HTTPS (Render provides this by default)
- Check browser console for WebRTC errors
- Consider adding TURN server for users behind strict firewalls

### Free Tier Limitations

Render's free tier has some limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds to wake up
- 750 hours/month of runtime per service

For production use, consider upgrading to a paid plan for:
- No spin-down
- Better performance
- More resources

### Monitoring

Monitor your services:
- Check Render dashboard for service health
- View logs in real-time
- Set up alerts for downtime (paid plans)

### Updating the Application

To update after deployment:
1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Render will automatically redeploy (if auto-deploy is enabled)
5. Or manually trigger deployment from Render dashboard

---

## 🔧 Local Development

To run locally:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env.local`** (optional for local dev)
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   NEXT_PUBLIC_SOCKET_PORT=3001
   ```

3. **Start backend** (Terminal 1)
   ```bash
   npm run server
   ```

4. **Start frontend** (Terminal 2)
   ```bash
   npm run dev
   ```

5. **Visit** `http://localhost:3000`

---

## 📝 Checklist Before Deployment

- [ ] All code pushed to GitHub
- [ ] `render.yaml` is present and configured
- [ ] Dependencies are up to date
- [ ] Build succeeds locally (`npm run build`)
- [ ] No lint errors (`npm run lint`)
- [ ] Tested locally with both servers running
- [ ] `.env.local` is in `.gitignore` (do not commit)

---

## 🌐 Alternative Deployment Options

### Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
1. Import your GitHub repo to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_SOCKET_URL`: Your Render backend URL
   - `NEXT_PUBLIC_SOCKET_PORT`: `443`
3. Deploy

**Backend on Render:**
Follow the backend deployment steps above

### Railway (Full Stack)

1. Create new project from GitHub
2. Add two services: one for frontend, one for backend
3. Configure environment variables similar to Render
4. Deploy

---

For more help, see [Render Documentation](https://render.com/docs) or open an issue on GitHub.
