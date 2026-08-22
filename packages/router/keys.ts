export const actionsDirectory = 'actions';

export function toKeys(file: string) {
  const normalized = file.replaceAll('\\', '/');
  const prefix = `/${actionsDirectory}/`;
  const index = `/${normalized}`.lastIndexOf(prefix);
  if (index === -1) {
    throw new Error(`${file} is not under '${actionsDirectory}/'`);
  }

  return `/${normalized}`
    .slice(index + prefix.length)
    .split('/')
    .slice(0, -1)
    .filter(Boolean)
    .map((segment) =>
      segment.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase()),
    );
}
