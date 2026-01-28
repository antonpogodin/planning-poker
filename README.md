# Planning Poker

A real-time planning poker application built with Next.js and Socket.IO.

## Features

- Real-time collaboration with WebSocket connections
- Multiple voting scales (Fibonacci, T-shirt sizes, powers of 2)
- Room-based sessions with shareable 6-digit codes
- Vote reveal/hide functionality
- Responsive design with dark mode support

## Architecture

Full-stack Next.js application with:
- **Frontend**: React 19 + Next.js 16 + Tailwind CSS 4
- **Backend**: Socket.IO server for real-time WebSocket connections
- **Deployment**: Single service on Render.com (runs both frontend + backend)

## Quick Start - Local Development

```bash
# Install dependencies
npm install

# Start development server (with Socket.IO)
npm run dev:custom

# Visit http://localhost:3000
```

## Deployment

### Deploy to Render.com (Recommended)

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect this repository
4. Render will auto-detect `render.yaml` configuration
5. Click **"Create Web Service"**
6. Visit your app at: `https://planning-poker-xxxx.onrender.com` 🎉

**📖 Detailed guide:** [RENDER_DEPLOY.md](RENDER_DEPLOY.md)

**Alternative:** Split deployment (Vercel + separate backend) - see [DEPLOYMENT.md](DEPLOYMENT.md)

## Environment Variables

No environment variables required for deployment to Render.com.

The app works out of the box with default configuration.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Node.js, Socket.IO
- **Deployment**: Vercel (frontend) + Railway (backend)

## Development Scripts

```bash
npm run dev          # Next.js dev server (Pages API - limited Socket.IO)
npm run dev:custom   # Custom server with full Socket.IO support (recommended)
npm run build        # Build for production
npm run start        # Start production Next.js server
npm run start:custom # Start production custom server
```

## License

MIT
