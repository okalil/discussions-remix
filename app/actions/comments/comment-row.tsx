import * as menu from '@remix-run/ui/menu';
import { css } from 'pitlane/theme';
import { clientEntry, on } from 'remix/component';

import type { Comment } from '../../../core/comment.types.ts';
import { Avatar } from '../../shared/avatar.tsx';
import { Button } from '../../shared/button.tsx';
import { DotsIcon } from '../../shared/icons/dots-icon.tsx';
import { t } from '../../theme.ts';
import { DeleteComment } from './delete-comment.tsx';
import { EditCommentForm } from './edit-comment-form.tsx';
import { VoteComment } from './vote-comment.tsx';

type CommentRowProps = {
  comment: Comment;
  authenticated: boolean;
};

export const CommentRow = clientEntry<CommentRowProps>(
  import.meta.url,
  function CommentRow(handle) {
    let editing = false;
    let deleting = false;

    function onReloadComplete() {
      editing = false;
      deleting = false;
      handle.update();
    }

    handle.frame.addEventListener('reloadComplete', onReloadComplete);

    handle.signal.addEventListener('abort', () => {
      handle.frame.removeEventListener('reloadComplete', onReloadComplete);
    });

    return () => {
      const { comment, authenticated } = handle.props;

      if (editing) {
        return (
          <li
            mix={[
              styles.editRow,
              on('cancel', () => {
                editing = false;
                handle.update();
              }),
            ]}
          >
            <EditCommentForm comment={comment} />
          </li>
        );
      }

      return (
        <li id={`comment-${comment.id}`} mix={styles.row}>
          <div mix={styles.header}>
            <div mix={styles.authorRow}>
              <Avatar
                src={comment.author.avatar}
                alt={`${comment.author.name}'s avatar`}
                fallback={comment.author.name.at(0)}
                size={32}
                mix={styles.avatar}
              />
              <p mix={styles.meta}>
                <span mix={styles.authorName}>{comment.author.name}</span> on{' '}
                {new Date(comment.createdAt).toLocaleDateString('en', {
                  dateStyle: 'medium',
                })}
              </p>
              {comment.isDiscussionAuthor && (
                <span mix={styles.authorBadge}>Author</span>
              )}
            </div>

            {comment.isCommentAuthor && (
              <div>
                <menu.Context label="Comment options">
                  <button
                    type="button"
                    aria-label="Comment options"
                    title="Comment options"
                    mix={[
                      styles.menuTrigger,
                      menu.trigger({ placement: 'bottom-end', offset: 4 }),
                    ]}
                  >
                    <DotsIcon size={20} />
                  </button>
                  <div mix={[styles.menuContent, menu.popover()]}>
                    <div
                      mix={[
                        styles.menuList,
                        menu.list(),
                        menu.onMenuSelect((event) => {
                          if (event.item.name === 'copy') {
                            navigator.clipboard.writeText(
                              window.location.href
                                .split('#')[0]
                                .concat(`#comment-${comment.id}`),
                            );
                            return;
                          }
                          if (event.item.name === 'edit') {
                            editing = true;
                            handle.update();
                            return;
                          }
                          if (event.item.name === 'delete') {
                            deleting = true;
                            handle.update();
                          }
                        }),
                      ]}
                    >
                      <div mix={[styles.menuItem, menu.item({ name: 'copy' })]}>
                        Copy Link
                      </div>
                      <div mix={[styles.menuItem, menu.item({ name: 'edit' })]}>
                        Edit
                      </div>
                      <div
                        mix={[
                          styles.menuItem,
                          styles.menuItemDanger,
                          menu.item({ name: 'delete' }),
                        ]}
                      >
                        Delete
                      </div>
                    </div>
                  </div>
                </menu.Context>

                {deleting && (
                  <div
                    mix={[
                      styles.modalBackdrop,
                      on('click', (e) => {
                        if (e.target === e.currentTarget) {
                          deleting = false;
                          handle.update();
                        }
                      }),
                    ]}
                  >
                    <div
                      role="alertdialog"
                      aria-modal="true"
                      aria-labelledby={`delete-comment-title-${comment.id}`}
                      aria-describedby={`delete-comment-desc-${comment.id}`}
                      mix={styles.modal}
                    >
                      <h3
                        id={`delete-comment-title-${comment.id}`}
                        mix={styles.modalTitle}
                      >
                        Delete comment
                      </h3>
                      <p
                        id={`delete-comment-desc-${comment.id}`}
                        mix={styles.modalDescription}
                      >
                        Are you sure you want to delete this comment?
                      </p>
                      <div mix={styles.modalActions}>
                        <Button
                          type="button"
                          variant="default"
                          mix={on('click', () => {
                            deleting = false;
                            handle.update();
                          })}
                        >
                          Cancel
                        </Button>
                        <DeleteComment id={comment.id} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <p mix={styles.body}>{comment.content}</p>
          <VoteComment
            id={comment.id}
            voted={comment.voted}
            votesCount={comment.votesCount}
            disabled={!authenticated}
          />
        </li>
      );
    };
  },
);

const styles = {
  row: css({
    padding: [t.spacing(2), t.spacing(4)],
    marginBottom: t.spacing(5),
    backgroundColor: t.color.surfaceContainerLowest,
    border: `${t.size.px} solid ${t.color.outlineVariant}`,
    borderRadius: t.shape.medium,
    '&:target': {
      borderColor: t.color.primary,
    },
  }),
  editRow: css({
    marginBottom: t.spacing(4),
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: t.spacing(3),
    fontSize: t.type.bodyMedium.size,
  }),
  authorRow: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    marginRight: t.spacing(2),
  }),
  meta: css({
    margin: 0,
    color: t.color.onSurfaceVariant,
  }),
  authorName: css({
    color: t.color.onSurface,
    fontWeight: t.type.labelLarge.weight,
  }),
  authorBadge: css({
    marginLeft: t.spacing(2),
    padding: [t.size.px, t.spacing(2)],
    fontSize: t.type.bodySmall.size,
    border: `${t.size.px} solid ${t.color.outline}`,
    borderRadius: t.shape.small,
  }),
  body: css({
    margin: [0, 0, t.spacing(3)],
    whiteSpace: 'pre-wrap',
  }),
  menuTrigger: css({
    display: 'grid',
    placeItems: 'center',
    padding: t.spacing(2),
    border: 'none',
    borderRadius: t.shape.small,
    backgroundColor: 'transparent',
    color: t.color.onSurfaceVariant,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: t.color.surfaceContainer,
    },
  }),
  menuContent: css({
    backgroundColor: t.color.surfaceContainerLowest,
    borderRadius: t.shape.medium,
    padding: t.spacing(2),
    border: `${t.size.px} solid ${t.color.outlineVariant}`,
  }),
  menuList: css({
    display: 'grid',
    gap: t.spacing(2),
    fontSize: t.type.bodyMedium.size,
    outline: 'none',
  }),
  menuItem: css({
    padding: [t.spacing(1), t.spacing(2)],
    textAlign: 'left',
    borderRadius: t.shape.extraSmall,
    cursor: 'pointer',
    outline: 'none',
    '&:hover, &[data-highlighted]': {
      backgroundColor: t.color.surfaceContainer,
    },
  }),
  menuItemDanger: css({
    color: t.color.error,
    '&:hover, &[data-highlighted]': {
      backgroundColor: t.color.errorContainer,
    },
  }),
  modalBackdrop: css({
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'grid',
    placeItems: 'center',
    padding: t.spacing(4),
    backgroundColor: t.color.scrim,
  }),
  modal: css({
    width: t.size.full,
    maxWidth: t.spacing(96),
    padding: t.spacing(5),
    backgroundColor: t.color.surfaceContainerLowest,
    borderRadius: t.shape.medium,
    boxShadow: t.elevation.level3,
  }),
  modalTitle: css({
    margin: [0, 0, t.spacing(2)],
    fontSize: t.type.titleLarge.size,
    fontWeight: t.type.titleMedium.weight,
    color: t.color.onSurface,
  }),
  modalDescription: css({
    margin: [0, 0, t.spacing(5)],
    fontSize: t.type.bodyMedium.size,
    color: t.color.onSurfaceVariant,
  }),
  modalActions: css({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: t.spacing(2),
  }),
};
