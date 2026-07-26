import { createMixin, on } from 'remix/ui';
import { jsx } from 'remix/ui/jsx-runtime';

import { onFieldChange } from '../field.ts';
import { isFormValidationError, type Form } from '../form.ts';

const formMixin = createMixin<
  HTMLFormElement,
  [Form<unknown>, { replace?: boolean }]
>((handle) => {
  return (instance, options, { key, ...props }) => {
    return jsx(
      handle.element,
      {
        ...props,
        action: instance.action,
        method: instance.method,
        noValidate: true,
        mix: [
          on<HTMLFormElement>('submit', async (e, signal) => {
            e.preventDefault();

            const formElement = e.currentTarget;
            instance.formData = new FormData(formElement);

            try {
              const response = await instance.submit({ signal });
              if (response.redirected) {
                syncNavigationState(response.url, options.replace);
                handle.frame.src = response.url;
              }
              if (response.ok) {
                requestAnimationFrame(() => {
                  instance.reset();
                  formElement.reset();
                });
              }
            } catch (error) {
              if (isFormValidationError(error)) {
                const fieldName = Object.keys(error.errors).find(
                  (key) => key !== 'root',
                );
                if (fieldName) focusField(formElement, fieldName);
                return;
              }

              throw error;
            }
          }),
          onFieldChange<HTMLFormElement>((e) => {
            instance.formData = new FormData(e.currentTarget);
            if (instance.state.attempts) {
              instance.validate();
            }
          }),
        ],
      },
      key,
    );
  };
});

export function form<Output>(
  instance: Form<Output>,
  options?: { replace?: boolean },
) {
  return formMixin(instance as Form<unknown>, options ?? {});
}

function syncNavigationState(url: string, replace?: boolean) {
  const navigationState = {
    $rmx: true,
    resetScroll: true,
    src: url,
    target: undefined,
  };
  if (replace) {
    history.replaceState(navigationState, '', url);
  } else {
    history.pushState(navigationState, '', url);
  }
  window.navigation.updateCurrentEntry({
    state: navigationState,
  });
}

function focusField(formElement: HTMLFormElement, fieldName: string) {
  const control = formElement.elements.namedItem(fieldName);
  const element = control instanceof RadioNodeList ? control[0] : control;
  if (element instanceof HTMLElement) element.focus();
}
