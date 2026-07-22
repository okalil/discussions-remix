import * as s from 'remix/data-schema';
import type { FormDataSource } from 'remix/data-schema/form-data';
import { TypedEventTarget } from 'remix/ui';

import type {
  ErrorsOf,
  FormDraft,
  FormInternalState,
  FormStateOverrides,
  FormSubmitOptions,
  TypedFormData,
} from './types.ts';
import { toErrors, toFormData } from './utils.ts';

type FormEventMap = {
  statechange: Event;
  submitcomplete: FormSubmitCompleteEvent;
};

type FormOptions<Output> = {
  action?: string;
  method?: string;
  schema?: s.Schema<FormDataSource, Output>;
  draft?: FormDraft;
};

export class Form<Output> extends TypedEventTarget<FormEventMap> {
  readonly #action: string | undefined;
  readonly #method: string | undefined;
  readonly #schema: s.Schema<FormDataSource, Output> | undefined;

  constructor(options?: FormOptions<Output>) {
    super();

    this.#action = options?.action;
    this.#method = options?.method;
    this.#schema = options?.schema;

    if (options?.draft) {
      this.#formData = toFormData(options.draft);
    }
  }

  #state: FormInternalState<Output> = {
    errors: {},
    attempts: 0,
    submission: null,
  };
  #formData = new FormData();
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

  get formData(): TypedFormData<Output> {
    return this.#formData;
  }

  set formData(formData: FormData) {
    this.#formData = formData;
  }

  reset() {
    this.#formData = new FormData();
  }

  mergeState(overrides: FormStateOverrides) {
    this.#state = {
      ...this.#state,
      errors: {
        ...this.#state.errors,
        ...overrides.errors,
      } as ErrorsOf<Output>,
    };
  }

  validate() {
    if (!this.#schema) {
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
