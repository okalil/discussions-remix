export type FormFieldName<Output> = Extract<keyof Output, string>;

/**
 * FormData whose name-based helpers only accept schema field keys.
 * Erases to plain FormData when Output is unknown.
 */
export type TypedFormData<Output> = unknown extends Output
  ? FormData
  : Omit<FormData, 'append' | 'delete' | 'get' | 'getAll' | 'has' | 'set'> & {
      append(name: FormFieldName<Output>, value: string | Blob): void;
      append(name: FormFieldName<Output>, value: Blob, filename?: string): void;
      delete(name: FormFieldName<Output>): void;
      get(name: FormFieldName<Output>): FormDataEntryValue | null;
      getAll(name: FormFieldName<Output>): FormDataEntryValue[];
      has(name: FormFieldName<Output>): boolean;
      set(name: FormFieldName<Output>, value: string | Blob): void;
      set(name: FormFieldName<Output>, value: Blob, filename?: string): void;
    };

/** Serializable FormData string entries. */
export type FormDraft = Array<[string, string]>;

export type GetDraftOptions<Output> = {
  omit?: readonly FormFieldName<Output>[];
};

export type ErrorsOf<Output> = Partial<
  Record<FormFieldName<Output> | 'root', string>
>;

export type InvalidValidation<Output> = {
  valid: false;
  errors: ErrorsOf<Output>;
  data: null;
  getDraft: (options?: GetDraftOptions<Output>) => FormDraft;
};

export type ValidValidation<Output> = {
  valid: true;
  errors: null;
  data: Output;
  getDraft: (options?: GetDraftOptions<Output>) => FormDraft;
};

export type FormValidation<Output> =
  | InvalidValidation<Output>
  | ValidValidation<Output>;

export type FormSubmission<Output> = {
  data: Output;
};

export type FormInternalState<Output> = {
  attempts: number;
  errors: ErrorsOf<Output>;
  submission: FormSubmission<Output> | null;
};

export type FormState<Output> = FormInternalState<Output> & {
  pending: boolean;
};

export type FormStateOverrides<Output> = {
  errors?: ErrorsOf<Output>;
};

export type FormSubmitOptions<Output> = {
  handler: (values: Output) => Promise<void>;
  onInvalid?: (errors: ErrorsOf<Output>) => void;
};
