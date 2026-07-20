import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { requireAuth } from '../../../middleware/auth.ts';
import { routes } from '../../../routes.ts';
import {
  createDiscussionValidator,
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
      const validation = createDiscussionValidator.validate(formData);
      if (validation.errors) {
        const categories = await categoryService.getCategories();
        return render(
          <NewDiscussionLayout>
            <NewDiscussionForm
              categories={categories}
              draft={validation.getDraft()}
              errors={validation.errors}
            />
          </NewDiscussionLayout>,
          { status: 422 },
        );
      }

      const discussion = await discussionService.createDiscussion({
        ...validation.data,
        authorId: auth.identity.id,
      });

      return redirect(routes.discussions.show.href({ id: discussion.id }));
    },
  },
});
