import {
  createRouter as remixCreateRouter,
  type Controller,
  type MiddlewareContext,
  type RequestContext,
  type Router,
  type RouterOptions,
  type RouterTypes,
} from 'remix/router';
import { Route, type RouteMap } from 'remix/routes';

import { actionsDirectory, toKeys } from './keys.ts';

type RouterMiddleware = NonNullable<RouterOptions['middleware']>;

type RouteModule = {
  default?: {
    actions: Record<string, unknown>;
    middleware?: unknown;
  };
};

type DefaultContext = RouterTypes extends {
  context: infer context extends RequestContext<any, any>;
}
  ? context
  : RequestContext;

export type AnyMiddleware = NonNullable<
  Controller<RouteMap, DefaultContext>['middleware']
>[number];

export type ControllerFor<
  routes extends RouteMap,
  middleware extends readonly AnyMiddleware[] = [],
> = Controller<routes, DefaultContext, middleware>;

export function createController<controller>(controller: controller) {
  return controller;
}

export function createRouter<
  context extends RequestContext = RequestContext,
  const middleware extends RouterMiddleware = [],
>(
  options: RouterOptions<context, middleware> & {
    routes: RouteMap;
    controllers: Record<string, unknown>;
  },
): Router<MiddlewareContext<middleware, context>> {
  const { routes, controllers, ...routerOptions } = options;
  const router = remixCreateRouter(
    routerOptions as RouterOptions<context, middleware>,
  );

  const mapped = new Set<RouteMap>();

  for (const [file, mod] of Object.entries(
    controllers as Record<string, RouteModule>,
  )) {
    const controller = mod.default;
    if (controller == null) {
      throw new Error(`${file} must default-export a controller`);
    }

    const keys = toKeys(file);
    const node = lookup(file, routes, keys);

    (router.map as (route: RouteMap, controller: object) => void)(
      node,
      controller,
    );
    mapped.add(node);
  }

  requireControllers(routes, mapped);
  return router;
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
  keys: string[] = [],
) {
  const leaves: string[] = [];

  for (const key of Object.keys(map)) {
    const child = map[key];
    if (child instanceof Route) leaves.push(key);
    else requireControllers(child, mapped, [...keys, key]);
  }

  if (leaves.length > 0 && !mapped.has(map)) {
    const name = keys.length === 0 ? 'routes' : `routes.${keys.join('.')}`;
    throw new Error(
      `Missing controller for ${name} (${leaves.join(', ')}). Expected ${controllerFile(keys)}`,
    );
  }
}

function controllerFile(keys: string[]) {
  if (keys.length === 0) return `./${actionsDirectory}/controller.tsx`;
  return `./${actionsDirectory}/${keys.map(camelToKebab).join('/')}/controller.tsx`;
}
