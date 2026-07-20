import { TypedEventTarget } from 'remix/ui';

import type { FormValidator } from './form-validator.browser.ts';
import type {
  FormDraft,
  FormInternalState,
  FormStateOverrides,
  FormSubmitOptions,
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
  #submissionId = 0;

  get state() {
    return {
      ...this.#state,
      pending: !!this.#state.submission,
    };
  }

  get formData() {
    return this.#formData;
  }

  set formData(formData: FormData) {
    this.#formData = formData;
  }

  reset() {
    this.#formData = new FormData();
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

  async submit(options: FormSubmitOptions<Output>) {
    const submissionId = ++this.#submissionId;

    this.#state.attempts++;

    const validation = this.validate();
    if (!validation.valid) {
      options.onInvalid?.(validation.errors);
      return;
    }

    try {
      this.#state.submission = { data: validation.data };
      this.dispatchEvent(new Event('statechange'));
      await options.handler(validation.data);
    } finally {
      // A newer submit may have replaced this one; don't clear its pending state.
      if (submissionId === this.#submissionId) {
        this.#state.submission = null;
        this.dispatchEvent(new Event('statechange'));
      }
    }
  }
}

/** Recover FormData from a serialized draft after a page reload. */
function restoreFormData(draft: FormDraft) {
  const formData = new FormData();
  for (const [key, value] of draft) {
    formData.append(key, value);
  }
  return formData;
}
