# Render Deployment Quick Checklist

## ✅ Pre-Deployment (COMPLETED)

- [x] All code pushed to GitHub ✅
- [x] Tests passed (see TEST_RESULTS.md) ✅
- [x] Build successful ✅
- [x] No lint errors ✅
- [x] render.yaml configured ✅
- [x] DEPLOYMENT.md created ✅

## 📋 Deployment Steps (DO THIS NOW)

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com/
2. Sign in to your account

### Step 2: Create Blueprint
1. Click "New" → "Blueprint"
2. Connect your GitHub repository: https://github.com/Suryanshu-Nabheet/StudyRoom.git
3. Render will automatically detect `render.yaml`
4. Click "Apply" to create both services

### Step 3: Wait for Initial Deployment
- Both services will start deploying
- Backend should deploy in ~2-3 minutes
- Frontend should deploy in ~3-5 minutes
- Monitor the logs for any errors

### Step 4: Get Service URLs
After deployment completes, note down your URLs:
- **Frontend URL**: `https://study-room-frontend.onrender.com` (or similar)
- **Backend URL**: `https://study-room-backend.onrender.com` (or similar)

### Step 5: Update Environment Variables

#### Frontend Service:
1. Go to frontend service in Render dashboard
2. Click "Environment" tab
3. Update these variables:
   - `NEXT_PUBLIC_APP_URL`: Set to your **frontend URL**
   - `NEXT_PUBLIC_SOCKET_URL`: Set to your **backend URL**
4. Save changes

#### Backend Service:
1. Go to backend service in Render dashboard
2. Click "Environment" tab
3. Update this variable:
   - `NEXT_PUBLIC_APP_URL`: Set to your **frontend URL**
4. Save changes

### Step 6: Redeploy Both Services
1. Go to frontend service → Click "Manual Deploy" → "Deploy latest commit"
2. Go to backend service → Click "Manual Deploy" → "Deploy latest commit"
3. Wait for redeployment (~3-5 minutes)

### Step 7: Test Your Deployment

#### Backend Test:
```bash
curl https://your-backend-url.onrender.com/socket.io/
# Should return: {"code":0,"message":"Transport unknown"}
```

#### Frontend Test:
1. Visit your frontend URL in a browser
2. You should see the Study Room landing page
3. Click "Create Room" or "Join Room"
4. Test video/audio/chat functionality
5. Open the same room in an incognito window to test with 2 users

### Step 8: Verify WebRTC Functionality
- [ ] Video works
- [ ] Audio works
- [ ] Chat works
- [ ] Screen sharing works
- [ ] Multiple participants can join
- [ ] Host controls work (if you're the first to join)

## 🐛 Troubleshooting

### If Frontend Can't Connect to Backend:
1. Check `NEXT_PUBLIC_SOCKET_URL` matches your backend URL exactly
2. Make sure backend service is running (check Render dashboard)
3. Check backend logs for CORS errors
4. Verify both services have been redeployed after updating env vars

### If Build Fails:
1. Check build logs in Render dashboard
2. Verify all dependencies are in package.json
3. Try building locally: `npm run build`
4. Check if you're using Node.js 18+ (recommended)

### If WebRTC Doesn't Connect:
1. Make sure you're using HTTPS (Render provides this automatically)
2. Check browser console for errors
3. Try in a different browser
4. For users behind strict firewalls, consider adding TURN server configuration

## 📝 Post-Deployment Notes

### Your Service URLs (Fill in after deployment):
- **Frontend**: ___________________________________
- **Backend**: ___________________________________

### Important Settings:
- Both services are on Render's **free tier**
- Services will spin down after **15 minutes** of inactivity
- First request after spin-down takes **30-60 seconds** to wake up
- You get **750 hours/month** of runtime per service

### Recommended Next Steps:
1. Test all functionality thoroughly
2. Share the frontend URL with users
3. Monitor the Render dashboard for any issues
4. Consider upgrading to a paid plan for:
   - No spin-down
   - Better performance
   - Custom domains
   - More resources

## 📚 Additional Resources

- Full deployment guide: See `DEPLOYMENT.md`
- Test results: See `TEST_RESULTS.md`
- Render documentation: https://render.com/docs
- GitHub repository: https://github.com/Suryanshu-Nabheet/StudyRoom.git

## ✅ Deployment Complete!

Once you've completed all steps above, your Study Room application is live and ready to use! 🎉

Share your frontend URL with others and start hosting study sessions!
