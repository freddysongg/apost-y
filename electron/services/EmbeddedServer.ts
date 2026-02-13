import { createServer } from 'http';
import type { Server } from 'http';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import type { StoreManager } from '../managers/StoreManager';

export class EmbeddedServer {
  private server: Server | null = null;
  private wss: WebSocketServer | null = null;
  private port: number = 0;
  private storeManager: StoreManager;

  constructor(storeManager: StoreManager) {
    this.storeManager = storeManager;
  }

  async start(): Promise<number> {
    const expressApp = express();
    expressApp.use(express.json());

    expressApp.get('/api/health', (_req, res) => {
      const config = this.storeManager.getConfig();
      res.json({ status: 'ok', hasApiKey: !!config.apiKey });
    });

    this.server = createServer(expressApp);
    this.wss = new WebSocketServer({ server: this.server, path: '/ws' });

    this.wss.on('connection', (clientWs) => {
      console.log('Client connected to embedded WebSocket proxy');

      const config = this.storeManager.getConfig();
      const apiKey = config.apiKey;
      if (!apiKey) {
        clientWs.send(JSON.stringify({
          type: 'error',
          error: { message: 'No API key configured. Set your API key in Settings.' },
        }));
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
        },
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
          } catch { /* non-JSON message */ }
        }
      });

      openaiWs.on('message', (data) => {
        const str = data.toString();
        try {
          const parsed = JSON.parse(str);
          const t: string = parsed.type;
          if (t !== 'response.audio.delta') {
            console.log('[OpenAI -> Client]', t, t === 'error' ? JSON.stringify(parsed.error) : '');
          }
        } catch { /* non-JSON message */ }

        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(str);
        }
      });

      clientWs.on('message', (data) => {
        const str = data.toString();
        try {
          const parsed = JSON.parse(str);
          const t: string = parsed.type;
          if (t !== 'input_audio_buffer.append') {
            console.log('[Client -> OpenAI]', t, openaiReady ? '' : '(queued)');
          }
        } catch { /* non-JSON message */ }

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
          clientWs.send(JSON.stringify({
            type: 'error',
            error: { message: 'OpenAI connection error: ' + err.message },
          }));
        }
      });
    });

    return new Promise<number>((resolve, reject) => {
      this.server!.listen(0, '127.0.0.1', () => {
        const addr = this.server!.address();
        if (addr && typeof addr === 'object') {
          this.port = addr.port;
          console.log(`Embedded server listening on 127.0.0.1:${this.port}`);
          resolve(this.port);
        }
      });
      this.server!.on('error', reject);
    });
  }

  getPort(): number {
    return this.port;
  }

  async stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.wss) {
        this.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.close();
          }
        });
        this.wss.close();
        this.wss = null;
      }

      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
