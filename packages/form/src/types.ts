import type { InferOutput, Schema } from 'remix/data-schema';
import type { FormDataSource } from 'remix/data-schema/form-data';

export type FormFieldName<Output> = Extract<keyof Output, string>;

/**
 * Raw FormData entry type for a parsed field value.
 * File (or File[]) outputs map to File; everything else maps to string.
 */
export type FormDataEntryOf<Value> =
  NonNullable<Value> extends File
    ? File
    : NonNullable<Value> extends ReadonlyArray<File>
      ? File
      : string;

/** Value accepted by append/set for a parsed field value. */
export type FormDataValueOf<Value> =
  FormDataEntryOf<Value> extends File ? Blob : string;

/**
 * FormData whose name-based helpers only accept schema field keys,
 * with per-key string vs File inference from the parsed output shape.
 * Erases to plain FormData when Output is unknown.
 */
export type TypedFormData<Output> = unknown extends Output
  ? FormData
  : Omit<FormData, 'append' | 'delete' | 'get' | 'getAll' | 'has' | 'set'> & {
      append<Name extends FormFieldName<Output>>(
        name: Name,
        value: FormDataValueOf<Output[Name]>,
        ...rest: FormDataEntryOf<Output[Name]> extends File
          ? [filename?: string]
          : []
      ): void;
      delete(name: FormFieldName<Output>): void;
      get<Name extends FormFieldName<Output>>(
        name: Name,
      ): FormDataEntryOf<Output[Name]> | null;
      getAll<Name extends FormFieldName<Output>>(
        name: Name,
      ): Array<FormDataEntryOf<Output[Name]>>;
      has(name: FormFieldName<Output>): boolean;
      set<Name extends FormFieldName<Output>>(
        name: Name,
        value: FormDataValueOf<Output[Name]>,
        ...rest: FormDataEntryOf<Output[Name]> extends File
          ? [filename?: string]
          : []
      ): void;
    };

/** Serializable FormData string entries. */
export type FormDraft = Array<[string, string]>;

/** Reads the live draft/errors from props when Form needs them. */
export type FormPropGetter<T> = () => T | undefined;

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

export type FormSubmitOptions = {
  signal?: AbortSignal;
};
