import { createController } from '@discussions/router';
import * as s from 'remix/data-schema';
import { parse } from 'remix/data-schema';

import type { CommentSort } from '../../../core/comment.types.ts';
import { routes } from '../../routes.ts';
import { DiscussionPage } from './discussion-page.tsx';
import { DiscussionPreviewCard } from './discussion-preview-card.tsx';
import { DiscussionsPage } from './discussions-page.tsx';
import { voteDiscussionSchema } from './vote-discussion.tsx';

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
      const filters = {
        q: url.searchParams.get('q') ?? undefined,
        category: params.category,
      };

      const viewerId = auth.ok ? auth.identity.id : undefined;

      const categories = await categoryService.listCategories();
      const paginator = await discussionService.listDiscussions({
        ...filters,
        page,
        limit: 20,
        viewerId,
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
    async show({ render, url, params, auth, discussionService }) {
      const discussionId = Number(params.id);
      const viewerId = auth.ok ? auth.identity.id : undefined;
      const sort = parse(commentSortSchema, url.searchParams.get('sort'));

      const discussion = await discussionService.getDiscussion(discussionId, {
        viewerId,
      });
      if (!discussion) {
        return new Response('Not found', { status: 404 });
      }

      const participants =
        await discussionService.listParticipants(discussionId);

      return render(
        <DiscussionPage
          discussion={discussion}
          participants={participants}
          sort={sort}
          authenticated={auth.ok}
        />,
      );
    },
    async preview({ render, params, discussionService }) {
      const discussionId = Number(params.id);
      const discussion =
        await discussionService.getDiscussionPreview(discussionId);
      if (!discussion) return new Response('Not found', { status: 404 });

      return render(<DiscussionPreviewCard discussion={discussion} />);
    },
    async vote({ params, formData, auth, discussionService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

      const data = parse(voteDiscussionSchema, formData);

      await discussionService.voteDiscussion({
        discussionId: Number(params.id),
        actorId: auth.identity.id,
        voted: data.voted,
      });

      return new Response(null, { status: 204 });
    },
  },
});

const commentSortSchema = s.union([
  s.enum_(['oldest', 'newest', 'top'] as const),
  s.any().transform((): CommentSort => 'oldest'),
]);
