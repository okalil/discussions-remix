import { toErrors } from '@discussions/form';
import { parseSafe } from 'remix/data-schema';
import { createController } from 'remix/router';

import { requireAuth } from '../../middleware/auth.ts';
import { routes } from '../../routes.ts';
import { editCommentSchema } from '../../ui/discussion/edit-comment-form.browser.tsx';
import { newCommentSchema } from '../../ui/discussion/new-comment-form.browser.tsx';
import { voteCommentSchema } from '../../ui/discussion/vote-comment.browser.tsx';

export default createController(routes.comments, {
  middleware: [requireAuth()],
  actions: {
    async new({ params, formData, auth, commentService }) {
      const validation = parseSafe(newCommentSchema, formData);
      if (!validation.success) {
        return Response.json(
          { errors: toErrors(validation.issues) },
          { status: 422 },
        );
      }

      const discussionId = Number(params.discussionId);
      const currentUserId = auth.identity.id;
      const comment = await commentService.createComment(
        discussionId,
        validation.value.body,
        currentUserId,
      );

      return Response.json({ comment });
    },
    async edit({ params, formData, auth, commentService }) {
      const validation = parseSafe(editCommentSchema, formData);
      if (!validation.success) {
        return Response.json(
          { errors: toErrors(validation.issues) },
          { status: 422 },
        );
      }

      const commentId = Number(params.id);
      const currentUserId = auth.identity.id;
      await commentService.updateComment(
        commentId,
        validation.value.body,
        currentUserId,
      );

      return Response.json({ ok: true });
    },
    async destroy({ params, auth, commentService }) {
      const commentId = Number(params.id);
      const currentUserId = auth.identity.id;
      await commentService.deleteComment(commentId, currentUserId);
      return Response.json({ ok: true });
    },
    async vote({ params, formData, auth, commentService }) {
      const validation = parseSafe(voteCommentSchema, formData);
      if (!validation.success) {
        return Response.json(
          { errors: toErrors(validation.issues) },
          { status: 422 },
        );
      }

      const commentId = Number(params.id);
      const currentUserId = auth.identity.id;
      if (validation.value.voted) {
        await commentService.voteComment(commentId, currentUserId);
      } else {
        await commentService.unvoteComment(commentId, currentUserId);
      }

      return Response.json({ ok: true });
    },
  },
});
