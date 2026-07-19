import * as s from 'remix/data-schema';
import type { FormDataSource } from 'remix/data-schema/form-data';

import type {
  ErrorsOf,
  FormDraft,
  FormValidation,
  GetDraftOptions,
} from './types.ts';

type OutputOf<V> = V extends FormValidator<infer Output> ? Output : never;

export type FormValues<V> = OutputOf<V>;
export type FormErrors<V> = ErrorsOf<OutputOf<V>>;

export class FormValidator<Output> {
  constructor(private schema: s.Schema<FormDataSource, Output>) {}

  validate(formData: FormDataSource): FormValidation<Output> {
    const getDraft = (options?: GetDraftOptions<Output>): FormDraft => {
      const omit = new Set<string>(options?.omit ?? []);
      const draft: FormDraft = [];

      for (const [key, value] of formData.entries()) {
        if (typeof value !== 'string' || omit.has(key)) continue;
        draft.push([key, value]);
      }

      return draft;
    };

    const result = s.parseSafe(this.schema, formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.issues) {
        const head = issue.path?.[0];
        const key = typeof head === 'string' ? head : 'root';
        errors[key] = issue.message;
      }
      return {
        valid: false,
        errors: errors,
        data: null,
        getDraft,
      };
    }

    return { valid: true, errors: null, data: result.value, getDraft };
  }
}
