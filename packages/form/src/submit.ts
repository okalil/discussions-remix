import { createMixin, on } from 'remix/ui';
import { jsx } from 'remix/ui/jsx-runtime';

import { isFormValidationError, type Form } from './form.ts';

export const submit = createMixin<HTMLFormElement, [Form<unknown>]>(
  (handle) => {
    return (form, { key, ...props }) => {
      return jsx(
        handle.element,
        {
          ...props,
          action: form.action,
          method: form.method,
          noValidate: true,
          mix: [
            on<HTMLFormElement>('submit', async (e, signal) => {
              e.preventDefault();

              const formElement = e.currentTarget;
              form.formData = new FormData(formElement);

              try {
                const response = await form.submit({ signal });
                if (response.redirected) {
                  syncNavigationState(response.url);
                  handle.frame.src = response.url;
                }
                if (response.ok) {
                  formElement.reset();
                  form.reset();
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
          ],
        },
        key,
      );
    };
  },
);

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
