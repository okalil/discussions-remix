import { TypedEventTarget } from 'remix/ui';

import type { Form } from './form.ts';
import type { FormDataEntryOf, FormFieldName } from './types.ts';

export type FieldEventMap = {
  change: Event;
};

export type FieldHandle = {
  readonly name: string;
  readonly value: string | File | null;
  readonly error: string | undefined;
  commit(source: FormData): void;
};

export class Field<
  Output,
  Name extends FormFieldName<Output> = FormFieldName<Output>,
> extends TypedEventTarget<FieldEventMap> {
  readonly name: Name;
  readonly #form: Form<Output>;

  constructor(form: Form<Output>, name: Name) {
    super();
    this.#form = form;
    this.name = name;
  }

  get value(): FormDataEntryOf<Output[Name]> | null {
    return this.#form.formData.get(this.name) as FormDataEntryOf<
      Output[Name]
    > | null;
  }

  get error(): string | undefined {
    return this.#form.state.errors[this.name];
  }

  commit(source: FormData) {
    this.#form.formData = source;
    this.dispatchEvent(new Event('change'));
    this.#form.dispatchEvent(new Event('fieldchange'));
  }
}
