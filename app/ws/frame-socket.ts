import { routes } from '../routes.ts';
import {
  sessionVersionCookie,
  type ClientMessage,
  type ServerMessage,
} from './protocol.ts';

type FrameBody = ReadableStream<Uint8Array>;

type PendingFrame = {
  resolve: (body: FrameBody | null) => void;
  reject: (error: Error) => void;
  finish: () => void;
  controller: ReadableStreamDefaultController<Uint8Array> | null;
};

const encoder = new TextEncoder();

export class FrameSocket {
  #ws: WebSocket | null = null;
  #sv = '';
  #ready: Promise<WebSocket | null> | null = null;
  #pending = new Map<string, PendingFrame>();
  #nextId = 0;

  constructor() {
    cookieStore.addEventListener('change', (event) => {
      const touched = [...event.changed, ...event.deleted].some(
        (cookie) => cookie.name === sessionVersionCookie.name,
      );
      if (!touched) return;
      this.#reset();
      this.#connect();
    });
    this.#connect();
  }

  async resolveFrame(
    src: string,
    signal?: AbortSignal,
    target?: string,
  ): Promise<FrameBody | null> {
    if (signal?.aborted) {
      throw signal.reason ?? new DOMException('Aborted', 'AbortError');
    }

    const ws = await this.#connect();
    if (!ws) return null;

    const id = String(++this.#nextId);
    const absoluteSrc = new URL(src, location.href).href;

    return new Promise<FrameBody | null>((resolve, reject) => {
      const onAbort = () => {
        const entry = this.#pending.get(id);
        this.#pending.delete(id);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'abort', id } satisfies ClientMessage));
        }
        const error =
          signal?.reason ?? new DOMException('Aborted', 'AbortError');
        if (entry?.controller) {
          try {
            entry.controller.error(error);
          } catch {
            // Stream already closed.
          }
        } else {
          reject(error);
        }
      };

      signal?.addEventListener('abort', onAbort, { once: true });

      this.#pending.set(id, {
        controller: null,
        resolve,
        reject: (error) => {
          signal?.removeEventListener('abort', onAbort);
          reject(error);
        },
        finish: () => {
          signal?.removeEventListener('abort', onAbort);
        },
      });

      ws.send(
        JSON.stringify({
          type: 'resolve',
          id,
          src: absoluteSrc,
          target,
        } satisfies ClientMessage),
      );
    });
  }

  #connect(): Promise<WebSocket | null> {
    const sv = readSessionVersion();

    if (this.#ws?.readyState === WebSocket.OPEN && this.#sv === sv) {
      return Promise.resolve(this.#ws);
    }
    if (this.#ready && this.#sv === sv) return this.#ready;

    this.#reset();
    this.#sv = sv;

    const ready = new Promise<WebSocket | null>((resolve) => {
      const url = new URL(routes.ws.frames.href(), location.href);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

      const ws = new WebSocket(url);
      let settled = false;
      const settle = (value: WebSocket | null) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      ws.addEventListener('open', () => {
        if (this.#sv !== sv || readSessionVersion() !== sv) {
          ws.close();
          settle(null);
          void this.#connect();
          return;
        }
        this.#ws = ws;
        settle(ws);
      });

      ws.addEventListener('message', (event) => {
        this.#onMessage(String(event.data));
      });

      ws.addEventListener('close', () => {
        if (this.#ws === ws) this.#ws = null;
        this.#flushPending();
        settle(null);
      });

      ws.addEventListener('error', () => settle(null));
    });

    this.#ready = ready;
    void ready.finally(() => {
      if (this.#ready === ready) this.#ready = null;
    });
    return ready;
  }

  #reset() {
    const ws = this.#ws;
    this.#ws = null;
    this.#ready = null;
    this.#sv = '';
    if (ws && ws.readyState < WebSocket.CLOSING) ws.close();
    this.#flushPending();
  }

  #flushPending() {
    const pending = [...this.#pending.values()];
    this.#pending.clear();
    const error = new Error('WebSocket closed');
    for (const entry of pending) {
      if (entry.controller) {
        try {
          entry.controller.error(error);
        } catch {
          // Stream already closed.
        }
      } else {
        entry.resolve(null);
      }
      entry.finish();
    }
  }

  #onMessage(raw: string) {
    let message: ServerMessage;
    try {
      message = JSON.parse(raw) as ServerMessage;
    } catch {
      return;
    }

    const entry = this.#pending.get(message.id);
    if (!entry) return;

    if (message.type === 'frame-start') {
      if (entry.controller) return;
      const stream = new ReadableStream<Uint8Array>({
        start: (controller) => {
          entry.controller = controller;
        },
      });
      entry.resolve(stream);
      return;
    }

    if (message.type === 'frame-chunk') {
      if (!entry.controller || !message.body) return;
      entry.controller.enqueue(encoder.encode(message.body));
      return;
    }

    this.#pending.delete(message.id);

    if (message.type === 'frame-end') {
      if (entry.controller) {
        try {
          entry.controller.close();
        } catch {
          // Stream already closed.
        }
      } else {
        entry.resolve(emptyHtmlStream());
      }
      entry.finish();
      return;
    }

    const error = new Error(message.message);
    if (entry.controller) {
      try {
        entry.controller.error(error);
      } catch {
        // Stream already closed.
      }
      entry.finish();
      return;
    }

    entry.reject(error);
  }
}

function emptyHtmlStream(): FrameBody {
  return new ReadableStream({
    start(controller) {
      controller.close();
    },
  });
}

function readSessionVersion() {
  const prefix = `${sessionVersionCookie.name}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return '';
}
