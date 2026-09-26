import { toDraft, toErrors } from '@discussions/form';
import { createController } from '@discussions/router';
import { parseSafe } from 'remix/data-schema';
import { redirect } from 'remix/response/redirect';

import { requireAuth } from '../../../middleware/auth.ts';
import { routes } from '../../../routes.ts';
import {
  newDiscussionSchema,
  NewDiscussionForm,
} from './new-discussion-form.tsx';
import { NewDiscussionLayout } from './new-discussion-layout.tsx';

export default createController(routes.discussions.new, {
  middleware: [requireAuth()],
  actions: {
    async index({ render, categoryService }) {
      const categories = await categoryService.listCategories();
      return render(
        <NewDiscussionLayout>
          <NewDiscussionForm categories={categories} />
        </NewDiscussionLayout>,
      );
    },
    async action({
      render,
      formData,
      auth,
      categoryService,
      discussionService,
    }) {
      const parsed = parseSafe(newDiscussionSchema, formData);
      if (!parsed.success) {
        const categories = await categoryService.listCategories();
        return render(
          <NewDiscussionLayout>
            <NewDiscussionForm
              categories={categories}
              draft={toDraft(formData)}
              errors={toErrors(parsed.issues)}
            />
          </NewDiscussionLayout>,
          { status: 422 },
        );
      }

      const discussion = await discussionService.createDiscussion({
        ...parsed.value,
        actorId: auth.identity.id,
      });

      return redirect(routes.discussions.show.href({ id: discussion.id }));
    },
  },
});
