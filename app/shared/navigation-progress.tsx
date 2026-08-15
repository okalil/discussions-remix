import { clientEntry, css } from 'remix/ui';

import { addEventListeners } from './utils/events.ts';

export const NavigationProgress = clientEntry(
  import.meta.url,
  function NavigationProgress(handle) {
    let progress = 0;
    let progressTimer: ReturnType<typeof setInterval> | undefined;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    function clearTimers() {
      clearInterval(progressTimer);
      clearTimeout(resetTimer);
      progressTimer = undefined;
      resetTimer = undefined;
    }

    function startProgress() {
      clearTimers();
      progressTimer = setInterval(() => {
        progress = Math.min(
          progress + 0.05 * Math.pow(1 - Math.sqrt(progress), 2),
          1,
        );
        handle.update();
      }, 20);
    }

    function finishProgress() {
      if (!progressTimer) return;
      clearTimers();
      progress = 1;
      handle.update();
      resetTimer = setTimeout(resetProgress, 400);
    }

    function resetProgress() {
      clearTimers();
      progress = 0;
      handle.update();
    }

    handle.signal.addEventListener('abort', clearTimers);

    handle.queueTask(() => {
      addEventListeners(window.navigation, handle.signal, {
        navigate(event) {
          if (isGetNavigation(event)) startProgress();
        },
        navigatesuccess: finishProgress,
        navigateerror: resetProgress,
      });
    });

    return () => (
      <div mix={styles.root}>
        {progress > 0 && (
          <div mix={styles.bar} style={{ width: `${progress * 100}%` }} />
        )}
      </div>
    );
  },
);

type SourceElementNavigateEvent = NavigateEvent & {
  sourceElement?: EventTarget | null;
};
function isGetNavigation(event: Event) {
  if (!(event instanceof NavigateEvent) || event.hashChange) return false;
  if (event.formData != null) return false;
  if (isInternalNavigationType(event.info)) return false;

  const source = (event as SourceElementNavigateEvent).sourceElement;
  const form = getSourceForm(source);
  if (!form) return true;

  const submitter =
    source instanceof HTMLButtonElement || source instanceof HTMLInputElement
      ? source
      : null;
  const method = submitter?.hasAttribute('formmethod')
    ? submitter.formMethod
    : form.method;
  return method.toLowerCase() === 'get';
}

function isInternalNavigationType(info: unknown) {
  return typeof info === 'object' && info != null && 'type' in info;
}

function getSourceForm(source: EventTarget | null | undefined) {
  if (source instanceof HTMLFormElement) return source;
  if (
    source instanceof HTMLButtonElement ||
    source instanceof HTMLInputElement
  ) {
    return source.form;
  }
}

const styles = {
  root: css({
    height: '0.25rem',
    position: 'fixed',
    zIndex: 30,
    top: 0,
    left: 0,
    right: 0,
  }),
  bar: css({
    backgroundColor: '#6366f1',
    height: '100%',
    transitionProperty: 'all',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }),
};
