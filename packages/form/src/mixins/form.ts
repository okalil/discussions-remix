import { addEventListeners, attrs, createMixin, on, ref } from 'remix/ui';

import { isFormValidationError, type Form } from '../form.ts';
import type { FormSubmitHandler } from '../types.ts';

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
          await form.submit({
            signal,
            handler: navigate
              ? (_, signal) => waitFormNavigation(formElement, signal)
              : options.handler,
          });
          form.reset();
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
) {
  await waitNavigation({
    signal,
    match: (event) => isSubmitFrom(event, formElement),
  });
  if (signal?.aborted) return;

  let transition = window.navigation.transition;
  if (!transition) {
    await waitNavigation({ signal });
    if (signal?.aborted) return;
    transition = window.navigation.transition;
  }

  await transition?.finished;
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

type SourceElementNavigateEvent = NavigateEvent & {
  sourceElement?: EventTarget | null;
};
function isSubmitFrom(event: NavigateEvent, formElement: HTMLFormElement) {
  const source = (event as SourceElementNavigateEvent).sourceElement;
  return (
    source instanceof Element &&
    (source === formElement || formElement.contains(source))
  );
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
