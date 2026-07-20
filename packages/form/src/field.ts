import { createMixin, on } from 'remix/ui';
import { jsx } from 'remix/ui/jsx-runtime';

import type { Form } from './form.ts';
import type { FormFieldName } from './types.ts';

export const fieldChangeType = 'field:change' as const;

declare global {
  interface HTMLElementEventMap {
    [fieldChangeType]: FieldChangeEvent;
  }
}

class FieldChangeEvent extends Event {
  constructor() {
    super(fieldChangeType, { bubbles: true, cancelable: true });
  }
}

type FormControlElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

const fieldMixin = createMixin<FormControlElement, [Form<unknown>, string]>(
  (handle) => {
    return (form, name, { key, ...props }) => {
      const hasError = !!Reflect.get(form.state.errors, name);

      function getControlProps() {
        if (props.type === 'checkbox') {
          const values = form.formData.getAll(name);
          return {
            defaultChecked: values.includes(props.value ?? 'on'),
          };
        }

        if (props.type === 'radio') {
          const value = form.formData.get(name);
          return {
            defaultChecked: value === props.value,
          };
        }

        return { defaultValue: form.formData.get(name) ?? undefined };
      }

      return jsx(
        handle.element,
        {
          ...props,
          name,
          autoFocus: hasError ? true : undefined,
          'aria-invalid': hasError ? true : undefined,
          ...getControlProps(),
          mix: [
            on<FormControlElement>('change', (e) => {
              const node = e.currentTarget;

              form.formData = new FormData(node.form!);
              if (form.state.attempts) {
                form.validate();
              }

              node.dispatchEvent(new FieldChangeEvent());
            }),
            on<FormControlElement>('input', (e) => {
              const node = e.currentTarget;

              form.formData = new FormData(node.form!);
              if (form.state.attempts) {
                form.validate();
              }

              node.dispatchEvent(new FieldChangeEvent());
            }),
          ],
        },
        key,
      );
    };
  },
);

export function field<Output>(form: Form<Output>, name: FormFieldName<Output>) {
  return fieldMixin(form as Form<unknown>, name);
}
