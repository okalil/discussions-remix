import { toErrors } from '@discussions/form';
import { parseSafe } from 'remix/data-schema';
import { createController } from 'remix/router';

import { routes } from '../../routes.ts';
import { Comments } from '../../ui/discussion/comments.tsx';
import { editCommentSchema } from '../../ui/discussion/edit-comment-form.tsx';
import { newCommentSchema } from '../../ui/discussion/new-comment-form.tsx';
import { voteCommentSchema } from '../../ui/discussion/vote-comment.tsx';

export default createController(routes.comments, {
  actions: {
    async index({ render, url, params, auth, commentService }) {
      const discussionId = Number(params.discussionId);
      const currentUserId = auth.ok ? auth.identity.id : undefined;
      const sort = url.searchParams.get('sort') ?? 'oldest';

      const comments = await commentService.getComments(
        discussionId,
        currentUserId,
        sort,
      );

      return render(<Comments comments={comments} authenticated={auth.ok} />);
    },
    async new({ params, formData, auth, commentService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

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
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

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
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

      const commentId = Number(params.id);
      const currentUserId = auth.identity.id;
      await commentService.deleteComment(commentId, currentUserId);
      return Response.json({ ok: true });
    },
    async vote({ params, formData, auth, commentService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

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
