import { addEventListeners, attrs, createMixin, on, ref } from 'remix/ui';

import { isFormValidationError, type Form } from '../form.ts';

const formMixin = createMixin<
  HTMLFormElement,
  [Form<unknown>, { history?: NavigationHistoryBehavior }]
>((handle) => {
  return (form, options) => {
    return [
      attrs({
        action: form.action,
        method: form.method,
        noValidate: true,
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
        addEventListeners(window.navigation, signal, {
          navigate(e) {
            if (!e.canIntercept) return;
            e.intercept({
              handler() {
                window.navigation.updateCurrentEntry({
                  state: {
                    $rmx: true,
                    resetScroll: true,
                    src: e.destination.url,
                    target: undefined,
                  },
                });
              },
            });
          },
        });
      }),
      on<HTMLFormElement>('submit', async (e, signal) => {
        e.preventDefault();

        const formElement = e.currentTarget;
        form.formData = new FormData(formElement);

        try {
          const response = await form.submit({ signal });
          if (response.redirected) {
            window.navigation.navigate(response.url, {
              history: options.history,
            });
            handle.frame.src = response.url;
          }
          if (response.ok) requestAnimationFrame(() => form.reset());
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
    ];
  };
});

export function form<Output>(
  instance: Form<Output>,
  options?: { history?: NavigationHistoryBehavior },
) {
  return formMixin(instance as Form<unknown>, options ?? {});
}

function focusField(formElement: HTMLFormElement, fieldName: string) {
  const control = formElement.elements.namedItem(fieldName);
  const element = control instanceof RadioNodeList ? control[0] : control;
  if (element instanceof HTMLElement) element.focus();
}
