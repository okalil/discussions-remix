import type { InferOutput, Schema } from 'remix/data-schema';
import type { FormDataSource } from 'remix/data-schema/form-data';

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

export type FormErrors = Partial<Record<string | 'root', string>>;

export type ErrorsOf<Output> = Partial<
  Record<FormFieldName<Output> | 'root', string>
>;

export type FormValues<S> =
  S extends Schema<FormDataSource, unknown> ? InferOutput<S> : never;

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

export type FormStateOverrides = {
  errors?: FormErrors;
};

export type FormSubmitOptions = {
  signal?: AbortSignal;
};
