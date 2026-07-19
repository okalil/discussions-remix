import { createController } from 'remix/router';

import { routes } from '../../routes.ts';
import { DiscussionHovercard } from '../../ui/discussions/discussion-hovercard.tsx';
import { DiscussionsPage } from '../../ui/discussions/discussions-page.tsx';
import { voteDiscussionValidator } from '../../ui/discussions/vote-discussion.browser.tsx';

export default createController(routes.discussions, {
  actions: {
    async index({
      render,
      url,
      params,
      auth,
      categoryService,
      discussionService,
    }) {
      const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
      const limit = Math.max(1, Number(url.searchParams.get('limit')) || 20);
      const filters = {
        q: url.searchParams.get('q') ?? '',
        category: params.category,
      };

      const currentUserId = auth.ok ? auth.identity.id : undefined;
      const categories = await categoryService.getCategories();
      const paginator = await discussionService.getDiscussions({
        ...filters,
        page,
        limit,
        currentUserId,
      });

      return render(
        <DiscussionsPage
          categories={categories}
          discussions={paginator.discussions}
          total={paginator.total}
          limit={paginator.limit}
          page={page}
          filters={filters}
          authenticated={auth.ok}
        />,
      );
    },
    async vote({ params, formData, auth, discussionService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

      const validation = voteDiscussionValidator.validate(formData);
      if (!validation.valid) {
        return Response.json({ errors: validation.errors }, { status: 422 });
      }

      const discussionId = Number(params.id);
      const currentUserId = auth.identity.id;
      const voted = validation.data.voted;
      if (voted) {
        await discussionService.voteDiscussion(discussionId, currentUserId);
      } else {
        await discussionService.unvoteDiscussion(discussionId, currentUserId);
      }

      return Response.json({ ok: true });
    },
    async hovercard({ render, params, discussionService }) {
      const discussionId = Number(params.id);
      const discussion =
        await discussionService.getDiscussionSummary(discussionId);
      if (!discussion) {
        return new Response('Not found', { status: 404 });
      }

      return render(<DiscussionHovercard discussion={discussion} />);
    },
  },
});
