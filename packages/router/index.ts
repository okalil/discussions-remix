import {
  createController as remixCreateController,
  createRouter as remixCreateRouter,
  type MiddlewareContext,
  type RequestContext,
  type Router,
  type RouterOptions,
} from 'remix/router';
import { Route, type RouteMap } from 'remix/routes';

type RouterMiddleware = NonNullable<RouterOptions['middleware']>;

export type RouteModule = {
  default?: {
    route: RouteMap;
    actions: Record<string, unknown>;
    middleware?: unknown;
  };
};

export const createController: typeof remixCreateController = (
  route,
  controller,
) => Object.assign(remixCreateController(route, controller), { route });

export function createRouter<
  context extends RequestContext = RequestContext,
  const middleware extends RouterMiddleware = [],
>(
  options: RouterOptions<context, middleware> & {
    routes: RouteMap;
    routesDirectory: string;
    routesModules: Record<string, RouteModule>;
  },
): Router<MiddlewareContext<middleware, context>> {
  const { routes, routesDirectory, routesModules, ...routerOptions } = options;
  const router = remixCreateRouter(
    routerOptions as RouterOptions<context, middleware>,
  );

  const mapped = new Set<RouteMap>();

  for (const [file, mod] of Object.entries(routesModules)) {
    const controller = mod.default;
    if (controller == null) {
      throw new Error(`${file} must default-export a controller`);
    }

    const keys = toKeys(file, routesDirectory);
    const node = lookup(file, routes, keys);

    if (controller.route !== node) {
      throw new Error(
        `${file} must createController for routes.${keys.join('.')}`,
      );
    }

    (router.map as (route: RouteMap, controller: object) => void)(
      node,
      controller,
    );
    mapped.add(node);
  }

  requireControllers(routes, mapped, routesDirectory);
  return router;
}

function toKeys(file: string, routesDirectory: string) {
  const base = routesDirectory.replace(/^\.\//, '').replace(/\/$/, '');
  let path = file.replace(/^\.\//, '');

  if (base !== '' && base !== '.') {
    const prefix = `${base}/`;
    if (!path.startsWith(prefix)) {
      throw new Error(
        `${file} is outside routesDirectory '${routesDirectory}'`,
      );
    }
    path = path.slice(prefix.length);
  }

  return path
    .split('/')
    .slice(0, -1)
    .filter(Boolean)
    .map((segment) =>
      segment.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase()),
    );
}

function lookup(file: string, routes: RouteMap, keys: string[]) {
  let node: RouteMap | Route = routes;

  for (const key of keys) {
    if (node instanceof Route || node[key] == null) {
      throw new Error(
        `${file} has no matching route at routes.${keys.join('.')}`,
      );
    }
    node = node[key];
  }

  if (node instanceof Route) {
    throw new Error(
      `${file} points at a leaf. Put that action on the parent controller.`,
    );
  }

  return node;
}

function camelToKebab(segment: string) {
  return segment.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function requireControllers(
  map: RouteMap,
  mapped: Set<RouteMap>,
  routesDirectory: string,
  keys: string[] = [],
) {
  const leaves: string[] = [];

  for (const key of Object.keys(map)) {
    const child = map[key];
    if (child instanceof Route) leaves.push(key);
    else requireControllers(child, mapped, routesDirectory, [...keys, key]);
  }

  if (leaves.length > 0 && !mapped.has(map)) {
    const name = keys.length === 0 ? 'routes' : `routes.${keys.join('.')}`;
    throw new Error(
      `Missing controller for ${name} (${leaves.join(', ')}). Expected ${controllerFile(keys, routesDirectory)}`,
    );
  }
}

function controllerFile(keys: string[], routesDirectory: string) {
  const base = routesDirectory.replace(/^\.\//, '').replace(/\/$/, '');
  const root = base === '' || base === '.' ? '.' : `./${base}`;
  if (keys.length === 0) return `${root}/controller.tsx`;
  return `${root}/${keys.map(camelToKebab).join('/')}/controller.tsx`;
}
