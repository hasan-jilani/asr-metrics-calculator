# TTS Alphanumeric Comparison Demo

A full-stack web application to compare Text-to-Speech (TTS) providers for challenging alphanumeric strings, measuring Time-to-First-Audio (TTFA) latency.

## Features

- Compare 4 TTS providers: ElevenLabs Flash v2.5, Cartesia Sonic-3, Deepgram Aura-2, and Rime Mist v2
- Real-time streaming audio with WebSocket support
- TTFA (Time-to-First-Audio) latency measurement
- Voice selection for each provider
- Audio download functionality
- Pre-set alphanumeric challenges with pronunciation guides

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your API keys:
   ```
   ELEVENLABS_API_KEY=your_key_here
   CARTESIA_API_KEY=your_key_here
   DEEPGRAM_API_KEY=your_key_here
   RIME_API_KEY=your_key_here
   PORT=3000
   ```
4. Start the server: `npm start`
5. Open http://localhost:3000 in your browser

## Deployment

### Render (Recommended)

1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
5. Add environment variables in the Render dashboard
6. Deploy!

### Railway

1. Push to GitHub
2. Go to [Railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add environment variables
5. Deploy

### Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in your project
3. Set secrets: `fly secrets set ELEVENLABS_API_KEY=...` (repeat for each)
4. Deploy: `fly deploy`

## Important Notes

- **WebSocket Support Required**: Make sure your hosting platform supports WebSockets
- **Environment Variables**: Never commit your `.env` file. Add API keys in the platform's environment variable settings
- **Port**: The app uses `process.env.PORT` for cloud platforms (defaults to 3000 locally)

## Tech Stack

- **Backend**: Node.js, Express, WebSocket (ws)
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **APIs**: ElevenLabs, Cartesia, Deepgram, Rime
