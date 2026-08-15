import { env } from 'cloudflare:workers';
import { createContextKey, type Middleware } from 'remix/router';

import { AccountService } from '../../core/account.ts';
import { CategoryService } from '../../core/category.ts';
import { CommentService } from '../../core/comment.ts';
import { DiscussionService } from '../../core/discussion.ts';
import { GithubAuthProvider } from '../../core/integrations/auth/providers/github.ts';
import { createD1Database } from '../../core/integrations/db/d1.ts';
import { createResendMailer } from '../../core/integrations/mailer/resend.ts';
import type { FileStorage } from '../../core/integrations/storage.ts';
import { createR2FileStorage } from '../../core/integrations/storage/r2.ts';
import { SessionService } from '../../core/session.ts';
import { UserService } from '../../core/user.ts';

const Storage = createContextKey<FileStorage>();

export function services(): Middleware<ServicesContextTransform> {
  return async (context, next) => {
    const db = createD1Database(env.DB);
    const mailer = createResendMailer(env.RESEND_API_KEY, {
      site: env.SITE_URL,
      production: import.meta.env.PROD,
    });
    const storage = createR2FileStorage(env.R2);
    const authProviders = [
      new GithubAuthProvider(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET),
    ];

    context.set(Storage, storage, {
      property: 'storage',
    });
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
    key: typeof Storage;
    value: FileStorage;
    property: 'storage';
  },
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
