import { createMixin, on } from 'remix/ui';
import { jsx } from 'remix/ui/jsx-runtime';

import type { Form } from './form.browser.ts';

export const submit = createMixin<HTMLFormElement, [Form<unknown>]>(
  (handle) => {
    return (form, { key, ...props }) => {
      return jsx(
        handle.element,
        {
          ...props,
          noValidate: true,
          mix: [
            on<HTMLFormElement>('submit', (e, signal) => {
              e.preventDefault();

              const formElement = e.currentTarget;
              form.setFormData(new FormData(formElement));

              form.submit({
                async handler() {
                  const response = await fetch(formElement.action, {
                    method: formElement.method,
                    body: form.formData,
                    signal,
                  });

                  if (isFrameResponse(response)) {
                    if (response.redirected) {
                      syncNavigationState(response.url);
                      handle.frame.src = response.url;
                    }

                    await handle.frame.replace(response.body);
                  } else {
                    await handle.frame.reload();
                  }
                },
                onInvalid(errors) {
                  const fieldName = Object.keys(errors).find(
                    (key) => key !== 'root',
                  );
                  if (!fieldName) return;

                  const control = formElement.elements.namedItem(fieldName);
                  const element =
                    control instanceof RadioNodeList ? control[0] : control;
                  if (element instanceof HTMLElement) element.focus();
                },
              });
            }),
          ],
        },
        key,
      );
    };
  },
);

function isFrameResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  return contentType?.includes('text/html') ?? false;
}

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
