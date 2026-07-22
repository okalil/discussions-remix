import { createMixin, on, type Dispatched } from 'remix/ui';
import { jsx } from 'remix/ui/jsx-runtime';

import type { Form } from '../form.ts';
import type { FormFieldName } from '../types.ts';

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

const FIELD_CHANGE_EVENT = 'field:change' as const;

class FieldChangeEvent extends Event {
  constructor() {
    super(FIELD_CHANGE_EVENT, { bubbles: true, cancelable: true });
  }
}

type FieldChangeHandler<target extends HTMLElement> = (
  event: Dispatched<FieldChangeEvent, target>,
  signal: AbortSignal,
) => void | Promise<void>;

export function onFieldChange<target extends HTMLElement>(
  handler: FieldChangeHandler<target>,
  captureBoolean?: boolean,
) {
  return on(FIELD_CHANGE_EVENT as never, handler as never, captureBoolean);
}
