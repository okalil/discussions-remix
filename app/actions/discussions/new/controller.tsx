import { toDraft, toErrors } from '@discussions/form';
import { parseSafe } from 'remix/data-schema';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { requireAuth } from '../../../middleware/auth.ts';
import { routes } from '../../../routes.ts';
import {
  newDiscussionSchema,
  NewDiscussionForm,
} from '../../../ui/discussions/new-discussion-form.browser.tsx';
import { NewDiscussionLayout } from '../../../ui/discussions/new-discussion-layout.tsx';

export default createController(routes.discussions.new, {
  middleware: [requireAuth()],
  actions: {
    async index({ render, categoryService }) {
      const categories = await categoryService.getCategories();
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
      const validation = parseSafe(newDiscussionSchema, formData);
      if (!validation.success) {
        const categories = await categoryService.getCategories();
        return render(
          <NewDiscussionLayout>
            <NewDiscussionForm
              categories={categories}
              draft={toDraft(formData)}
              errors={toErrors(validation.issues)}
            />
          </NewDiscussionLayout>,
          { status: 422 },
        );
      }

      const discussion = await discussionService.createDiscussion({
        ...validation.value,
        authorId: auth.identity.id,
      });

      return redirect(routes.discussions.show.href({ id: discussion.id }));
    },
  },
});
