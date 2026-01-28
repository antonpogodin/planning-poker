# Deployment Guide

This application consists of two parts:
1. **Frontend (Next.js)** - Deployed on Vercel
2. **Backend (Socket.IO Server)** - Needs to be deployed on a platform supporting WebSockets

## Why Separate Deployments?

Vercel uses serverless functions which don't support persistent WebSocket connections required by Socket.IO. The backend must be deployed on a platform with long-running processes.

## Step 1: Deploy Backend (Socket.IO Server)

### Option A: Deploy to Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Railway will auto-detect the Node.js app
6. Set the start command: `NODE_ENV=production node server.js`
7. Railway will assign you a URL like `https://your-app.up.railway.app`

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
