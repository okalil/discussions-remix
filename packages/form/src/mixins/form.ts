import { addEventListeners, attrs, createMixin, on, ref } from 'remix/ui';

import { isFormValidationError, type Form } from '../form.ts';
import type { FormSubmitHandler, FormSubmitResult } from '../types.ts';

type FormMixinOptions<Output = unknown> =
  | {
      navigate?: boolean;
      history?: NavigationHistoryBehavior;
      handler?: never;
    }
  | {
      navigate?: never;
      history?: never;
      handler: FormSubmitHandler<Output>;
    };

const formMixin = createMixin<
  HTMLFormElement,
  [Form<unknown>, FormMixinOptions]
>(() => {
  return (form, options) => {
    return [
      attrs({
        action: form.action,
        method: form.method,
        noValidate: true,
        ...(options.history == null || options.history === 'auto'
          ? {}
          : { 'rmx-history': options.history }),
      }),
      ref<HTMLFormElement>((formElement, signal) => {
        form.formData = new FormData(formElement);
        addEventListeners(form, signal, {
          fieldchange() {
            if (form.state.attempts) {
              form.validate();
            }
          },
          reset() {
            formElement.reset();
          },
        });
      }),
      on<HTMLFormElement>('submit', async (e, signal) => {
        const formElement = e.currentTarget;
        form.formData = new FormData(formElement);

        const navigate = options.navigate ?? !options.handler;
        if (!navigate) e.preventDefault();

        try {
          const result = await form.submit({
            signal,
            handler: navigate
              ? () => waitFormNavigation(formElement, signal)
              : options.handler,
          });
          if (result.ok) form.reset();
        } catch (error) {
          if (isFormValidationError(error)) {
            e.preventDefault();
            focusFirstError(formElement, error.errors);
            return;
          }
          throw error;
        }
      }),
    ];
  };
});

export function form<Output>(
  instance: Form<Output>,
  options?: FormMixinOptions<Output>,
) {
  return formMixin(
    instance as Form<unknown>,
    (options ?? {}) as FormMixinOptions,
  );
}

export async function waitFormNavigation(
  formElement: HTMLFormElement,
  signal?: AbortSignal,
): Promise<FormSubmitResult> {
  const outcome = { redirected: false, failed: false };
  const watch = new AbortController();
  signal?.addEventListener('abort', () => watch.abort(), {
    once: true,
    signal: watch.signal,
  });

  window.navigation.addEventListener(
    'navigate',
    (event) => {
      if (isServerRedirectNavigation(event)) outcome.redirected = true;
    },
    { signal: watch.signal },
  );
  window.navigation.addEventListener(
    'navigateerror',
    () => {
      outcome.failed = true;
    },
    { signal: watch.signal },
  );

  try {
    await waitNavigation({
      signal,
      match(event) {
        const source = event.sourceElement;
        return (
          source instanceof Element &&
          (source === formElement || formElement.contains(source))
        );
      },
    });
    if (signal?.aborted) return { ok: false };

    await waitNavigationIdle(signal);
    if (signal?.aborted || outcome.failed) return { ok: false };

    // In-place action renders (4xx with errors) never start a redirect
    // navigation. GET navigations have no action response to inspect.
    if (formElement.method.toLowerCase() !== 'post') return { ok: true };
    return { ok: outcome.redirected };
  } finally {
    watch.abort();
  }
}

function isServerRedirectNavigation(event: NavigateEvent) {
  const info = event.info;
  return (
    typeof info === 'object' &&
    info != null &&
    'type' in info &&
    info.type === 'frame-redirect'
  );
}

async function waitNavigationIdle(signal?: AbortSignal) {
  // `navigation.transition` is assigned after the `navigate` event, once
  // intercept() runs. Reading it in the event handler always sees `null`.
  let transition =
    window.navigation.transition ?? (await nextTransition(signal));

  while (transition && !signal?.aborted) {
    // Same-URL POSTs are often replaced; the cancelled transition rejects.
    // Server redirects start a successor before this one settles.
    await transition.finished.catch(() => {});
    transition = window.navigation.transition;
  }
}

function nextTransition(signal?: AbortSignal) {
  return new Promise<NavigationTransition | null>((resolve) => {
    if (signal?.aborted) {
      resolve(null);
      return;
    }

    const done = new AbortController();
    const finish = () => {
      done.abort();
      resolve(window.navigation.transition);
    };

    const timer = setTimeout(finish, 0);
    done.signal.addEventListener('abort', () => clearTimeout(timer));
    signal?.addEventListener('abort', finish, {
      once: true,
      signal: done.signal,
    });
  });
}

type WaitNavigationOptions = {
  signal?: AbortSignal;
  match?: (event: NavigateEvent) => boolean;
};
function waitNavigation({ signal, match }: WaitNavigationOptions) {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    const done = new AbortController();
    done.signal.addEventListener('abort', () => resolve(), { once: true });
    signal?.addEventListener('abort', () => done.abort(), {
      once: true,
      signal: done.signal,
    });

    window.navigation.addEventListener(
      'navigate',
      (event) => {
        if (match && !match(event)) return;
        done.abort();
      },
      { signal: done.signal },
    );
  });
}

function focusFirstError(
  formElement: HTMLFormElement,
  errors: Record<string, string>,
) {
  const fieldName = Object.keys(errors).find((key) => key !== 'root');
  if (fieldName) focusField(formElement, fieldName);
}

function focusField(formElement: HTMLFormElement, fieldName: string) {
  const control = formElement.elements.namedItem(fieldName);
  const element = control instanceof RadioNodeList ? control[0] : control;
  if (element instanceof HTMLElement) element.focus();
}
