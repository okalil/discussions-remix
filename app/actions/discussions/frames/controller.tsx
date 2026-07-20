import { createController } from 'remix/router';

import { routes } from '../../../routes.ts';
import { Comments } from '../../../ui/discussion/comments.tsx';
import { DiscussionPreview } from '../../../ui/discussions/discussion-preview.tsx';

export default createController(routes.discussions.frames, {
  actions: {
    async preview({ render, params, discussionService }) {
      const discussionId = Number(params.id);
      const discussion =
        await discussionService.getDiscussionPreview(discussionId);
      if (!discussion) {
        return new Response('Not found', { status: 404 });
      }

      return render(<DiscussionPreview discussion={discussion} />);
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

      return render(<Comments comments={comments} authenticated={auth.ok} />);
    },
  },
});
