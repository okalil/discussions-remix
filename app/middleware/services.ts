import { env } from 'cloudflare:workers';
import type { Middleware } from 'remix/router';

import { AccountService } from '../core/account.ts';
import { CategoryService } from '../core/category.ts';
import { CommentService } from '../core/comment.ts';
import { DiscussionService } from '../core/discussion.ts';
import { GithubAuthProvider } from '../core/integrations/auth/providers/github.ts';
import {
  createDatabase,
  createD1DatabaseAdapter,
} from '../core/integrations/db.ts';
import {
  createMailer,
  createResendMailerAdapter,
} from '../core/integrations/mailer.ts';
import { createR2FileStorage } from '../core/integrations/storage/adapters/r2.ts';
import { SessionService } from '../core/session.ts';
import { UserService } from '../core/user.ts';

export function services(): Middleware<ServicesContextTransform> {
  return async (context, next) => {
    const d1DatabaseAdapter = createD1DatabaseAdapter(env.DB);
    const db = createDatabase(d1DatabaseAdapter);

    const resendMailerAdapter = createResendMailerAdapter(env.RESEND_API_KEY);
    const mailer = createMailer(resendMailerAdapter, {
      site: env.SITE_URL,
      production: import.meta.env.PROD,
    });

    const storage = createR2FileStorage(env.R2);

    const authProviders = [
      new GithubAuthProvider(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET),
    ];
    context.set(AccountService, new AccountService(db, mailer, authProviders), {
      property: 'accountService',
    });
    context.set(CategoryService, new CategoryService(db), {
      property: 'categoryService',
    });
    context.set(CommentService, new CommentService(db), {
      property: 'commentService',
    });
    context.set(DiscussionService, new DiscussionService(db), {
      property: 'discussionService',
    });
    context.set(SessionService, new SessionService(db), {
      property: 'sessionService',
    });
    context.set(UserService, new UserService(db, storage), {
      property: 'userService',
    });

    return next();
  };
}

type ServicesContextTransform = [
  {
    key: typeof AccountService;
    value: AccountService;
    property: 'accountService';
  },
  {
    key: typeof CategoryService;
    value: CategoryService;
    property: 'categoryService';
  },
  {
    key: typeof CommentService;
    value: CommentService;
    property: 'commentService';
  },
  {
    key: typeof DiscussionService;
    value: DiscussionService;
    property: 'discussionService';
  },
  {
    key: typeof SessionService;
    value: SessionService;
    property: 'sessionService';
  },
  {
    key: typeof UserService;
    value: UserService;
    property: 'userService';
  },
];
