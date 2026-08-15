import * as s from 'remix/data-schema';
import type { FormDataSource } from 'remix/data-schema/form-data';
import { TypedEventTarget } from 'remix/ui';

import { Field } from './field.ts';
import type {
  ErrorsOf,
  FormDraft,
  FormErrors,
  FormFieldName,
  FormInternalState,
  FormPropGetter,
  FormSubmitOptions,
  TypedFormData,
} from './types.ts';
import { toErrors, toFormData } from './utils.ts';

type FormEventMap = {
  statechange: Event;
  fieldchange: Event;
  submitcomplete: FormSubmitCompleteEvent;
  reset: Event;
};

type FormOptions<Output> = {
  action?: string;
  method?: string;
  schema?: s.Schema<FormDataSource, Output>;
  draft?: FormPropGetter<FormDraft>;
  errors?: FormPropGetter<FormErrors>;
};

export class Form<Output> extends TypedEventTarget<FormEventMap> {
  readonly #action: string | undefined;
  readonly #method: string | undefined;
  readonly #schema: s.Schema<FormDataSource, Output> | undefined;
  readonly #draft: FormPropGetter<FormDraft> | undefined;
  readonly #errors: FormPropGetter<FormErrors> | undefined;

  constructor(options?: FormOptions<Output>) {
    super();

    this.#action = options?.action;
    this.#method = options?.method;
    this.#schema = options?.schema;
    this.#draft = options?.draft;
    this.#errors = options?.errors;
    this.#formData = toFormData(this.#draft?.() ?? []);
  }

  #state: FormInternalState<Output> = {
    errors: {},
    attempts: 0,
    submission: null,
  };
  #formData = new FormData();
  #fields = new Map<string, Field<Output>>();

  get action() {
    return this.#action;
  }

  get method() {
    return this.#method;
  }

  get state() {
    return {
      ...this.#state,
      errors: {
        ...this.#state.errors,
        ...this.#errors?.(),
      },
      pending: !!this.#state.submission,
    };
  }

  get formData(): TypedFormData<Output> {
    return this.#formData as TypedFormData<Output>;
  }

  set formData(formData: FormData) {
    this.#formData = formData;
  }

  reset() {
    this.#formData = toFormData(this.#draft?.() ?? []);
    this.#state.errors = {};
    this.#state.attempts = 0;
    this.dispatchEvent(new Event('statechange'));
    this.dispatchEvent(new Event('reset'));
  }

  field<Name extends FormFieldName<Output>>(name: Name): Field<Output, Name> {
    let field = this.#fields.get(name);
    if (!field) {
      field = new Field(this, name);
      this.#fields.set(name, field);
    }
    return field as Field<Output, Name>;
  }

  validate() {
    if (!this.#schema) {
      this.#state.errors = {};
      return { valid: true, data: null as Output, errors: null } as const;
    }

    const result = s.parseSafe(this.#schema, this.#formData);
    if (!result.success) {
      const errors = toErrors(result.issues) as ErrorsOf<Output>;
      this.#state.errors = errors;
      this.dispatchEvent(new Event('statechange'));
      return { valid: false as const, errors, data: null };
    }

    this.#state.errors = {};
    this.dispatchEvent(new Event('statechange'));
    return { valid: true as const, errors: null, data: result.value };
  }

  async submit({
    signal,
    handler,
  }: FormSubmitOptions<Output> = {}): Promise<void> {
    const validation = this.#prepareSubmission();
    if (!validation.valid) {
      throw new FormValidationError(validation.errors);
    }

    this.#startSubmission(validation.data);
    try {
      const submitHandler = handler ?? ((_, signal) => this.#fetch(signal));
      await submitHandler(validation.data, signal);
      if (signal?.aborted) return;

      const event = new FormSubmitCompleteEvent();
      this.dispatchEvent(event);
      await event.settle();
    } finally {
      if (!signal?.aborted) {
        this.#endSubmission();
      }
    }
  }

  #prepareSubmission() {
    this.#state.attempts++;
    return this.validate();
  }

  #startSubmission(data: Output) {
    this.#state.submission = { data };
    this.dispatchEvent(new Event('statechange'));
  }

  #endSubmission() {
    if (!this.#state.submission) return;
    this.#state.submission = null;
    this.dispatchEvent(new Event('statechange'));
  }

  async #fetch(signal?: AbortSignal) {
    const method = this.method ?? 'get';
    const action = this.action ?? location.href;
    const supportsBody = method.toUpperCase() !== 'GET';
    const body = supportsBody ? this.#formData : undefined;

    await fetch(action, { method, body, signal });
  }
}

export class FormSubmitCompleteEvent extends Event {
  #extenders: Promise<unknown>[] = [];

  constructor() {
    super('submitcomplete');
  }

  waitUntil(promise: PromiseLike<unknown>) {
    this.#extenders.push(Promise.resolve(promise));
  }

  /** @internal */
  async settle() {
    await Promise.allSettled(this.#extenders);
  }
}

export class FormValidationError<Output = unknown> extends Error {
  readonly errors: ErrorsOf<Output>;

  constructor(errors: ErrorsOf<Output>) {
    super('Form validation failed');
    this.name = 'FormValidationError';
    this.errors = errors;
  }
}

export function isFormValidationError(
  error: unknown,
): error is FormValidationError {
  return error instanceof FormValidationError;
}
