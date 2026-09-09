import { createController } from '@discussions/router';
import * as s from 'remix/data-schema';

import type { CommentSort } from '../../../core/comment.types.ts';
import { routes } from '../../routes.ts';
import { Comments } from './comments.tsx';
import { editCommentSchema } from './edit-comment-form.tsx';
import { newCommentSchema } from './new-comment-form.tsx';
import { voteCommentSchema } from './vote-comment.tsx';

export default createController(routes.comments, {
  actions: {
    async index({ render, url, params, auth, commentService }) {
      const comments = await commentService.listComments({
        discussionId: Number(params.discussionId),
        viewerId: auth.ok ? auth.identity.id : undefined,
        sort: s.parse(commentSortSchema, url.searchParams.get('sort')),
      });

      return render(<Comments comments={comments} authenticated={auth.ok} />);
    },
    async new({ params, formData, auth, commentService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

      const data = s.parse(newCommentSchema, formData);

      const discussionId = Number(params.discussionId);
      await commentService.createComment({
        discussionId,
        content: data.content,
        actorId: auth.identity.id,
      });

      return Response.json(null, { status: 201 });
    },
    async edit({ params, formData, auth, commentService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

      const data = s.parse(editCommentSchema, formData);

      await commentService.updateComment(Number(params.id), {
        content: data.content,
        actorId: auth.identity.id,
      });

      return new Response(null, { status: 204 });
    },
    async destroy({ params, auth, commentService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

      await commentService.deleteComment(Number(params.id), {
        actorId: auth.identity.id,
      });

      return new Response(null, { status: 204 });
    },
    async vote({ params, formData, auth, commentService }) {
      if (!auth.ok) return Response.json(auth.error, { status: 401 });

      const data = s.parse(voteCommentSchema, formData);

      await commentService.voteComment({
        commentId: Number(params.id),
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
