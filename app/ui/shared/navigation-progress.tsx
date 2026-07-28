import { addEventListeners, clientEntry, css } from 'remix/ui';

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

    handle.signal.addEventListener('abort', clearTimers);

    addEventListeners(handle.frame, handle.signal, {
      reloadStart() {
        if (!window.navigation.transition) return;

        progressTimer = setInterval(() => {
          progress = Math.min(
            progress + 0.05 * Math.pow(1 - Math.sqrt(progress), 2),
            1,
          );
          handle.update();
        }, 20);
        handle.update();
      },
      reloadComplete() {
        if (!window.navigation.transition) return;

        clearInterval(progressTimer);
        progressTimer = undefined;

        progress = 1;
        handle.update();

        resetTimer = setTimeout(() => {
          progress = 0;
          handle.update();
        }, 400);
      },
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
