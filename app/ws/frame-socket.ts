import { routes } from '../routes.ts';
import {
  sessionVersionCookie,
  type ClientMessage,
  type ServerMessage,
} from './protocol.ts';

type FrameBody = ReadableStream<Uint8Array>;

const FLUSH_MARKER_RE = /<!--\s*rmx:flush\s+(document|fragment)\s*-->/;

export class FrameSocket {
  #ws: WebSocket | null = null;
  #sv = '';
  #ready: Promise<WebSocket | null> | null = null;
  #pending = new Map<
    string,
    {
      resolve: (body: FrameBody | null) => void;
      reject: (error: Error) => void;
    }
  >();
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
        this.#pending.delete(id);
        ws.send(JSON.stringify({ type: 'abort', id } satisfies ClientMessage));
        reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
      };

      signal?.addEventListener('abort', onAbort, { once: true });

      this.#pending.set(id, {
        resolve: (body) => {
          signal?.removeEventListener('abort', onAbort);
          resolve(body);
        },
        reject: (error) => {
          signal?.removeEventListener('abort', onAbort);
          reject(error);
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
        this.#flushPending(null);
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
    this.#flushPending(null);
  }

  #flushPending(body: FrameBody | null) {
    const pending = [...this.#pending.values()];
    this.#pending.clear();
    for (const entry of pending) entry.resolve(body);
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
    this.#pending.delete(message.id);

    if (message.type === 'frame') {
      // Remix document navigations need a stream + flush marker, not a bare
      // HTML string (that path skips head stylesheet handling).
      entry.resolve(toHtmlStream(withDocumentFlush(message.body)));
      return;
    }

    entry.reject(new Error(message.message));
  }
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

function withDocumentFlush(html: string) {
  if (FLUSH_MARKER_RE.test(html)) return html;
  if (/<html[\s>]/i.test(html)) {
    return `${html}<!-- rmx:flush document -->`;
  }
  return html;
}

function toHtmlStream(html: string): ReadableStream<Uint8Array> {
  const bytes = new TextEncoder().encode(html);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}
