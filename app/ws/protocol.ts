import { createCookie } from 'remix/cookie';

/** Readable change-detection cookie for frame WebSocket reconnects. Not a secret. */
export const sessionVersionCookie = createCookie('__sv', {
  httpOnly: false,
  secure: true,
  sameSite: 'Lax',
  path: '/',
});

export type ClientMessage =
  | { type: 'resolve'; id: string; src: string; target?: string }
  | { type: 'abort'; id: string };

export type ServerMessage =
  | { type: 'frame'; id: string; status: number; url: string; body: string }
  | { type: 'error'; id: string; message: string };
