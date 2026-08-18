import { parse } from 'remix/data-schema';
import { createController } from 'remix/router';

import { routes } from '../routes.ts';
import { Comments } from './comments.tsx';
import { editCommentSchema } from './edit-comment-form.tsx';
import { newCommentSchema } from './new-comment-form.tsx';
import { voteCommentSchema } from './vote-comment.tsx';

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

      const data = parse(newCommentSchema, formData);

      const discussionId = Number(params.discussionId);
      const currentUserId = auth.identity.id;
      await commentService.createComment(
        discussionId,
        data.content,
        currentUserId,
      );

      return Response.json(null, { status: 201 });
    },
    async edit({ params, formData, auth, commentService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

      const data = parse(editCommentSchema, formData);

      const commentId = Number(params.id);
      const currentUserId = auth.identity.id;
      await commentService.updateComment(
        commentId,
        data.content,
        currentUserId,
      );

      return new Response(null, { status: 204 });
    },
    async destroy({ params, auth, commentService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

      const commentId = Number(params.id);
      const currentUserId = auth.identity.id;
      await commentService.deleteComment(commentId, currentUserId);

      return new Response(null, { status: 204 });
    },
    async vote({ params, formData, auth, commentService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

      const data = parse(voteCommentSchema, formData);

      const commentId = Number(params.id);
      const currentUserId = auth.identity.id;
      if (data.voted) {
        await commentService.voteComment(commentId, currentUserId);
      } else {
        await commentService.unvoteComment(commentId, currentUserId);
      }

      return new Response(null, { status: 204 });
    },
  },
});
