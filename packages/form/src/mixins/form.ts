import { createMixin, on } from 'remix/ui';
import { jsx } from 'remix/ui/jsx-runtime';

import { isFormValidationError, type Form } from '../form.ts';

export const form = createMixin<HTMLFormElement, [Form<unknown>]>((handle) => {
  return (instance, { key, ...props }) => {
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
                syncNavigationState(response.url);
                handle.frame.src = response.url;
              }
              if (response.ok) formElement.reset()
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
          on<HTMLFormElement>('reset', () => instance.reset())
        ],
      },
      key,
    );
  };
});

function syncNavigationState(url: string) {
  const navigationState = {
    $rmx: true,
    resetScroll: true,
    src: url,
    target: undefined,
  };
  history.pushState(navigationState, '', url);
  window.navigation.updateCurrentEntry({
    state: navigationState,
  });
}

function focusField(formElement: HTMLFormElement, fieldName: string) {
  const control = formElement.elements.namedItem(fieldName);
  const element = control instanceof RadioNodeList ? control[0] : control;
  if (element instanceof HTMLElement) element.focus();
}
