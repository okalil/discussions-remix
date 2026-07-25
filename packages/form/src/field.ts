import { on, type Dispatched } from 'remix/ui';

const FIELD_CHANGE_EVENT = 'field:change' as const;

export class FieldChangeEvent extends Event {
  constructor() {
    super(FIELD_CHANGE_EVENT, { bubbles: true, cancelable: true });
  }
}

type FieldChangeHandler<target extends HTMLElement> = (
  event: Dispatched<FieldChangeEvent, target>,
  signal: AbortSignal,
) => void | Promise<void>;

export function onFieldChange<target extends HTMLElement>(
  handler: FieldChangeHandler<target>,
  captureBoolean?: boolean,
) {
  return on(FIELD_CHANGE_EVENT as never, handler as never, captureBoolean);
}
