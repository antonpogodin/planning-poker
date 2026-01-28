# Deploy to Render.com

Deploy the entire Planning Poker app (frontend + backend) as a single service on Render.com.

## One-Step Deployment

1. Go to [render.com](https://render.com) and sign up with GitHub

2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub repository and select **planning-poker**

4. Render will detect `render.yaml` and configure automatically:
   - **Name**: `planning-poker`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:custom`
   - **Plan**: Free

5. Click **"Create Web Service"**

6. Wait for deployment (~3-5 minutes)

7. Visit your app at: `https://planning-poker-xxxx.onrender.com` 🎉

## What Gets Deployed

This deploys the **full-stack application**:
- ✅ Next.js frontend (React UI)
- ✅ Socket.IO backend (WebSocket server)
- ✅ Custom Node.js server (handles both)

Everything runs on one Render service using the custom `server.js`.

## Verify Deployment

1. Open your Render URL in a browser

2. Open DevTools Console (F12) and look for:
   ```
   Initializing socket connection...
   ✅ Connected to Socket.io server with ID: xxxxx
   ```

3. Create a room and test voting in multiple browser tabs

## Render Free Tier Notes

The free tier has some limitations:

- **Spins down after 15 minutes** of inactivity
- First request after spin-down takes ~30 seconds to wake up
- Perfect for demos and testing
- Upgrade to Starter ($7/month) for always-on

## Troubleshooting

### "Failed to connect to server"

**Check Render logs:**
1. Go to Render dashboard → Your service → Logs
2. Look for startup message:
   ```
   > Ready on http://0.0.0.0:10000
   ```
3. Check for any build or startup errors

**Check browser console:**
- Look for Socket.IO connection errors
- Verify you're accessing via HTTPS (not HTTP)

### Build Failed

**Common issues:**
- Missing dependencies: Make sure `package.json` is committed
- TypeScript errors: Run `npm run build` locally first
- Node version: Render uses Node 20 by default

**Fix:**
1. Check build logs in Render dashboard
2. Fix errors locally and push changes
3. Render will auto-redeploy on push

### App Crashes on Startup

**Check logs for:**
- Port binding issues (server.js uses `process.env.PORT`)
- Missing dependencies
- Syntax errors

## Custom Domain

To use a custom domain:

1. Go to Render dashboard → Your service → Settings
2. Scroll to **Custom Domain**
3. Add your domain and follow DNS instructions

## Environment Variables

No environment variables are required for basic deployment. The app works out of the box.

Optional variables can be added in Render → Settings → Environment:
- Add any custom configuration as needed

## Local Development

For local development with the same setup:

```bash
npm run dev:custom
# Visit http://localhost:3000
```

This uses the same custom server as production.

## Production Optimizations

For production use, consider:

1. **Upgrade to Starter plan** ($7/month):
   - No cold starts
   - Always-on
   - Better performance

2. **Add Redis** for room persistence:
   - Survives server restarts
   - Enables horizontal scaling

3. **Enable health checks** (Render → Settings → Health Check Path):
   - Path: `/`
   - Helps Render detect issues

4. **Monitor performance**:
   - Check Render metrics dashboard
   - Set up uptime monitoring (UptimeRobot, etc.)

## Alternative: Deploy to Vercel + Separate Backend

If you prefer to use Vercel for the frontend, see [DEPLOYMENT.md](DEPLOYMENT.md) for instructions on split deployment.
