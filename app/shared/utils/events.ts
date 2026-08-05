type EventMapOf<Target> = Target extends { __eventMap?: infer EventMap }
  ? EventMap
  : Record<string, Event>;

type ListenersFor<Target extends EventTarget> = {
  [Type in Extract<keyof EventMapOf<Target>, string>]?: (
    event: EventMapOf<Target>[Type] extends Event
      ? EventMapOf<Target>[Type]
      : Event,
  ) => void;
};

/**
 * Attach listeners cleaned up when `signal` aborts.
 *
 * Unlike `remix/ui`'s helper, this does not pass `{ signal }` into
 * `addEventListener` options. Some server runtimes brand-check that option and
 * throw when Remix's SSR AbortSignal stub is used.
 */
export function addEventListeners<Target extends EventTarget>(
  target: Target,
  signal: AbortSignal,
  listeners: ListenersFor<Target>,
): void {
  for (const type in listeners) {
    const listener = listeners[type as keyof typeof listeners];
    if (!listener) continue;

    const handler = listener as EventListener;
    target.addEventListener(type, handler);
    signal.addEventListener(
      'abort',
      () => target.removeEventListener(type, handler),
      { once: true },
    );
  }
}
