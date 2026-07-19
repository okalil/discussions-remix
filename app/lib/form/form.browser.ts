import { TypedEventTarget } from 'remix/ui';

import type { FormValidator } from './form-validator.browser.ts';
import type {
  FormDraft,
  FormInternalState,
  FormStateOverrides,
  FormSubmitHandlers,
  TypedFormData,
} from './types.ts';

type FormEventMap = {
  statechange: Event;
};

type FormOptions<Output> = {
  validator: FormValidator<Output>;
  draft?: FormDraft;
};

export class Form<Output> extends TypedEventTarget<FormEventMap> {
  constructor(private options: FormOptions<Output>) {
    super();

    if (options.draft) {
      this.#formData = restoreFormData(options.draft);
    }
  }

  #state: FormInternalState<Output> = {
    errors: {},
    attempts: 0,
    submission: null,
  };
  #formData: TypedFormData<Output> = new FormData();

  get state() {
    return {
      ...this.#state,
      pending: !!this.#state.submission,
    };
  }

  get formData() {
    return this.#formData;
  }

  setFormData(formData: FormData) {
    this.#formData = formData;
  }

  mergeState(overrides: FormStateOverrides<Output>) {
    this.#state = {
      ...this.#state,
      errors: { ...this.#state.errors, ...overrides.errors },
    };
  }

  validate() {
    const validation = this.options.validator.validate(this.#formData);
    this.#state.errors = validation.errors ?? {};
    this.dispatchEvent(new Event('statechange'));
    return validation;
  }

  async submit(handlers: FormSubmitHandlers<Output>) {
    this.#state.attempts++;

    const validation = this.validate();
    if (!validation.valid) {
      handlers.onInvalid?.(validation.errors);
      return;
    }

    try {
      this.#state.submission = { data: validation.data };
      this.dispatchEvent(new Event('statechange'));
      await handlers.handler(validation.data);
    } finally {
      this.#state.submission = null;
      this.dispatchEvent(new Event('statechange'));
    }
  }
}

/** Recover FormData from a serialized draft after a page reload. */
function restoreFormData<Output>(draft: FormDraft): TypedFormData<Output> {
  const formData = new FormData();
  for (const [key, value] of draft) {
    formData.append(key, value);
  }
  return formData;
}
