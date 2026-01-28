# Deployment Guide

This application consists of two parts:
1. **Frontend (Next.js)** - Deployed on Vercel
2. **Backend (Socket.IO Server)** - Deployed on Railway/Render/Fly.io

## Why Separate Deployments?

Vercel's serverless architecture doesn't support persistent WebSocket connections required by Socket.IO. Testing confirmed that even with Pages API routes, Vercel returns 400 errors on Socket.IO connections.

The backend must be deployed on a platform with long-running processes that support WebSockets.

## Step 1: Deploy Backend (Socket.IO Server)

### Option A: Deploy to Railway (Recommended - Easiest)

1. Go to [railway.app](https://railway.app) and sign up with GitHub

2. Click **"New Project"** → **"Deploy from GitHub repo"**

3. Select the **planning-poker** repository

4. Railway will auto-detect it as a Node.js app

5. Go to **Settings** tab and configure:
   - **Start Command**: `npm run start:custom`
   - Or: `NODE_ENV=production node server.js`

6. Go to **Settings** → **Networking** → Click **"Generate Domain"**
   - You'll get a URL like: `https://planning-poker-production.up.railway.app`
   - Copy this URL for Step 2

7. The backend will start automatically. Check logs to verify:
   ```
   > Ready on http://localhost:3000
   ```

### Option B: Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign up and click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `NODE_ENV=production node server.js`
   - **Plan**: Free
5. Render will assign you a URL like `https://your-app.onrender.com`

### Option C: Deploy to Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in the project directory
3. Follow the prompts to configure and deploy
4. Your app will be available at `https://your-app.fly.dev`

## Step 2: Configure Vercel Frontend

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Name**: `NEXT_PUBLIC_SOCKET_URL`
   - **Value**: Your backend URL (e.g., `https://your-app.up.railway.app`)
4. Redeploy your Vercel project

## Step 3: Test the Connection

1. Visit your Vercel URL
2. Check the browser console for Socket.IO connection logs
3. Try creating/joining a room to verify real-time functionality

## Local Development

For local development, you don't need to set `NEXT_PUBLIC_SOCKET_URL`. The app will connect to `localhost:3000` automatically.

```bash
npm run dev
# Visit http://localhost:3000
```

## Troubleshooting

### Connection errors on deployed app
- Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly in Vercel
- Ensure your backend is running (check Railway/Render logs)
- Check that the backend URL uses `https://` not `http://`

### CORS errors
- The server.js file has CORS configured with `origin: '*'`
- If issues persist, update the CORS configuration in server.js

### Backend keeps sleeping (Render free tier)
- Render's free tier spins down after inactivity
- Consider upgrading or using Railway which has a more generous free tier
