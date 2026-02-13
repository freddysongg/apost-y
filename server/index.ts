import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.OPENAI_API_KEY });
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (clientWs) => {
  console.log('Client connected to WebSocket proxy');

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    clientWs.send(JSON.stringify({ type: 'error', error: { message: 'No API key configured. Set OPENAI_API_KEY.' } }));
    clientWs.close();
    return;
  }

  let openaiReady = false;
  const messageQueue: string[] = [];

  const openaiWs = new WebSocket(
    'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    }
  );

  openaiWs.on('open', () => {
    console.log('Connected to OpenAI Realtime API');
    openaiReady = true;

    while (messageQueue.length > 0) {
      const queued = messageQueue.shift()!;
      openaiWs.send(queued);
      try {
        const parsed = JSON.parse(queued);
        console.log('[Queued -> OpenAI]', parsed.type);
      } catch {}
    }
  });

  openaiWs.on('message', (data) => {
    const str = data.toString();
    try {
      const parsed = JSON.parse(str);
      const t = parsed.type;
      if (t !== 'response.audio.delta') {
        console.log('[OpenAI -> Client]', t, t === 'error' ? JSON.stringify(parsed.error) : '');
      }
    } catch {}

    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(str);
    }
  });

  clientWs.on('message', (data) => {
    const str = data.toString();
    try {
      const parsed = JSON.parse(str);
      const t = parsed.type;
      if (t !== 'input_audio_buffer.append') {
        console.log('[Client -> OpenAI]', t, openaiReady ? '' : '(queued)');
      }
    } catch {}

    if (openaiReady && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(str);
    } else {
      try {
        const parsed = JSON.parse(str);
        if (parsed.type !== 'input_audio_buffer.append') {
          messageQueue.push(str);
        }
      } catch {
        messageQueue.push(str);
      }
    }
  });

  clientWs.on('close', () => {
    console.log('Client disconnected');
    if (openaiWs.readyState === WebSocket.OPEN) openaiWs.close();
  });

  openaiWs.on('close', (code, reason) => {
    console.log('OpenAI connection closed:', code, reason.toString());
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });

  clientWs.on('error', (err) => console.error('Client WS error:', err.message));
  openaiWs.on('error', (err) => {
    console.error('OpenAI WS error:', err.message);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: 'error', error: { message: 'OpenAI connection error: ' + err.message } }));
    }
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
