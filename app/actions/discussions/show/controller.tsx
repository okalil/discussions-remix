import { createController } from 'remix/router';

import { routes } from '../../../routes.ts';
import { Comments } from '../../../ui/discussion/comments.tsx';
import { DiscussionPage } from '../../../ui/discussion/discussion-page.tsx';
import { Participants } from '../../../ui/discussion/participants.tsx';

export default createController(routes.discussions.show, {
  actions: {
    async index({ render, url, params, auth, discussionService }) {
      const discussionId = Number(params.id);
      const currentUserId = auth.ok ? auth.identity.id : undefined;
      const sort = url.searchParams.get('sort') ?? 'oldest';

      const discussion = await discussionService.getDiscussion(
        discussionId,
        currentUserId,
      );
      if (!discussion) {
        return new Response('Not found', { status: 404 });
      }

      return render(
        <DiscussionPage
          authenticated={auth.ok}
          discussion={discussion}
          sort={sort}
        />,
      );
    },
    async comments({ render, url, params, auth, commentService }) {
      const discussionId = Number(params.id);
      const currentUserId = auth.ok ? auth.identity.id : undefined;
      const sort = url.searchParams.get('sort') ?? 'oldest';

      const comments = await commentService.getComments(
        discussionId,
        currentUserId,
        sort,
      );

      return render(<Comments comments={comments} />);
    },
    async participants({ render, params, discussionService }) {
      const discussionId = Number(params.id);
      const participants =
        await discussionService.getParticipants(discussionId);

      return render(<Participants participants={participants} />);
    },
  },
});
