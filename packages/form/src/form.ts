import { TypedEventTarget } from 'remix/ui';

import type { FormValidator } from './form-validator.ts';
import type {
  ErrorsOf,
  FormDraft,
  FormInternalState,
  FormStateOverrides,
  FormSubmitOptions,
  TypedFormData,
} from './types.ts';

type FormEventMap = {
  statechange: Event;
  submitcomplete: FormSubmitCompleteEvent;
};

type FormOptions<Output> = {
  action?: string;
  method?: string;
  validator?: FormValidator<Output>;
  draft?: FormDraft;
};

export class Form<Output = unknown> extends TypedEventTarget<FormEventMap> {
  readonly #action: string | undefined;
  readonly #method: string | undefined;
  readonly #validator: FormValidator<Output> | undefined;

  constructor(options?: FormOptions<Output>) {
    super();

    this.#action = options?.action;
    this.#method = options?.method;
    this.#validator = options?.validator;

    if (options?.draft) {
      this.#formData = restoreFormData(options.draft);
    }
  }

  #state: FormInternalState<Output> = {
    errors: {},
    attempts: 0,
    submission: null,
  };
  #formData: TypedFormData<Output> = new FormData();
  #submitAbortController: SubmitAbortController | null = null;

  get action() {
    return this.#action;
  }

  get method() {
    return this.#method;
  }

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
    if (!this.#validator) {
      return { valid: true, data: null as Output, errors: null } as const;
    }

    const validation = this.#validator.validate(this.#formData);
    this.#state.errors = validation.errors ?? {};
    this.dispatchEvent(new Event('statechange'));
    return validation;
  }

  async submit({ signal }: FormSubmitOptions = {}): Promise<Response> {
    this.#state.attempts++;

    const validation = this.validate();
    if (!validation.valid) {
      throw new FormValidationError(validation.errors);
    }

    this.#submitAbortController?.abort();
    const submitAbortController = new SubmitAbortController();
    this.#submitAbortController = submitAbortController;

    const method = this.method ?? 'get';
    const action = this.action ?? location.href;

    const supportsBody = !['GET', 'HEAD'].includes(method.toUpperCase());
    const body = supportsBody ? this.#formData : undefined;

    try {
      this.#state.submission = { data: validation.data };
      this.dispatchEvent(new Event('statechange'));

      const unfollow = submitAbortController.follow(signal);
      const response = await fetch(action, {
        method,
        body,
        signal: submitAbortController.signal,
      });
      unfollow();

      const event = new FormSubmitCompleteEvent(response);
      this.dispatchEvent(event);
      await event.settle();

      return response;
    } finally {
      if (this.#submitAbortController === submitAbortController) {
        this.#submitAbortController = null;
        this.#state.submission = null;
        this.dispatchEvent(new Event('statechange'));
      }
    }
  }
}

export class FormSubmitCompleteEvent extends Event {
  #extenders: Promise<unknown>[] = [];

  constructor(public readonly response: Response) {
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

function restoreFormData(draft: FormDraft) {
  const formData = new FormData();
  for (const [key, value] of draft) {
    formData.append(key, value);
  }
  return formData;
}

class SubmitAbortController extends AbortController {
  follow(signal?: AbortSignal) {
    if (signal?.aborted) {
      this.abort(signal.reason);
      throw new Error(signal.reason);
    }

    const onAbort = () => this.abort(signal?.reason);
    signal?.addEventListener('abort', onAbort);
    return () => signal?.removeEventListener('abort', onAbort);
  }
}
