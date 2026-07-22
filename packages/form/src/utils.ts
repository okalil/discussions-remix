import type { Issue } from 'remix/data-schema';
import type { FormDataSource } from 'remix/data-schema/form-data';

import type { FormDraft, FormErrors, GetDraftOptions } from './types.ts';

export function toErrors(issues: readonly Issue[]): FormErrors {
  const errors: FormErrors = {};
  for (const issue of issues) {
    const head = issue.path?.[0];
    const key =
      typeof head === 'string'
        ? head
        : typeof head === 'object' &&
            head !== null &&
            'key' in head &&
            typeof head.key === 'string'
          ? head.key
          : 'root';
    errors[key] = issue.message;
  }
  return errors;
}

export function toDraft<Output = unknown>(
  formData: FormDataSource,
  options?: GetDraftOptions<Output>,
): FormDraft {
  const omit = new Set<string>(options?.omit ?? []);
  const draft: FormDraft = [];

  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string' || omit.has(key)) continue;
    draft.push([key, value]);
  }

  return draft;
}

export function toFormData(draft: FormDraft): FormData {
  const formData = new FormData();
  for (const [key, value] of draft) {
    formData.append(key, value);
  }
  return formData;
}
