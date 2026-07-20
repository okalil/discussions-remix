import { createController } from 'remix/router';

import { requireAuth } from '../../middleware/auth.ts';
import { routes } from '../../routes.ts';
import { updateCommentValidator } from '../../ui/discussion/edit-comment-form.browser.tsx';
import { createCommentValidator } from '../../ui/discussion/new-comment-form.browser.tsx';
import { voteCommentValidator } from '../../ui/discussion/vote-comment.browser.tsx';

export default createController(routes.comments, {
  middleware: [requireAuth()],
  actions: {
    async new({ params, formData, auth, commentService }) {
      const { errors, data } = createCommentValidator.validate(formData);
      if (errors) {
        return Response.json({ errors }, { status: 422 });
      }

      const discussionId = Number(params.discussionId);
      const currentUserId = auth.identity.id;
      const comment = await commentService.createComment(
        discussionId,
        data.body,
        currentUserId,
      );

      return Response.json({ comment });
    },
    async edit({ params, formData, auth, commentService }) {
      const { errors, data } = updateCommentValidator.validate(formData);
      if (errors) {
        return Response.json({ errors }, { status: 422 });
      }

      const commentId = Number(params.id);
      const currentUserId = auth.identity.id;
      await commentService.updateComment(commentId, data.body, currentUserId);

      return Response.json({ ok: true });
    },
    async destroy({ params, auth, commentService }) {
      const commentId = Number(params.id);
      const currentUserId = auth.identity.id;
      await commentService.deleteComment(commentId, currentUserId);
      return Response.json({ ok: true });
    },
    async vote({ params, formData, auth, commentService }) {
      const { errors, data } = voteCommentValidator.validate(formData);
      if (errors) {
        return Response.json({ errors }, { status: 422 });
      }

      const commentId = Number(params.id);
      const currentUserId = auth.identity.id;
      if (data.voted) {
        await commentService.voteComment(commentId, currentUserId);
      } else {
        await commentService.unvoteComment(commentId, currentUserId);
      }

      return Response.json({ ok: true });
    },
  },
});
