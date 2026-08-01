/** Readable change-detection cookie; must match session middleware. */
export const SESSION_VERSION_COOKIE = '__sv';

export type ClientMessage =
  | { type: 'resolve'; id: string; src: string; target?: string }
  | { type: 'abort'; id: string };

export type ServerMessage =
  | { type: 'frame'; id: string; status: number; url: string; body: string }
  | { type: 'error'; id: string; message: string };
