import { css } from 'pitlane/theme';
import { type Handle, type RemixNode } from 'remix/component';

import { routes } from '../../../routes.ts';
import { Button } from '../../../shared/button.tsx';
import { Document } from '../../../shared/document.tsx';
import { GithubIcon } from '../../../shared/icons/github-icon.tsx';
import { t } from '../../../theme.ts';
import { AuthLayout } from '../auth-layout.tsx';

type LoginLayoutProps = {
  children?: RemixNode;
};

export function LoginLayout(handle: Handle<LoginLayoutProps>) {
  return () => (
    <Document title="Login">
      <AuthLayout title="Login">
        <div>
          <form
            method="post"
            action={routes.auth.social.start.href({ provider: 'github' })}
            data-rmx-document
          >
            <Button type="submit" variant="github" block>
              <GithubIcon size={20} />
              Continue with Github
            </Button>
          </form>

          <div mix={styles.divider}>
            <hr />
            <span mix={styles.dividerLabel}>or</span>
          </div>

          {handle.props.children}
        </div>
      </AuthLayout>
    </Document>
  );
}

const styles = {
  divider: css({
    position: 'relative',
    margin: [t.spacing(6), 0],
  }),
  dividerLabel: css({
    position: 'absolute',
    top: 0,
    left: t.size.half,
    transform: 'translate(-50%, -50%)',
    padding: [0, t.spacing(4)],
    backgroundColor: t.color.surfaceContainerLowest,
    color: t.color.onSurfaceVariant,
    fontSize: t.type.bodyMedium.size,
  }),
};
