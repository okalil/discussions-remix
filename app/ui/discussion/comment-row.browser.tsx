import { addEventListeners, clientEntry, css, on } from 'remix/ui';
import * as menu from 'remix/ui/menu/primitives';

import { Avatar } from '../shared/avatar.browser.tsx';
import { Button } from '../shared/button.browser.tsx';
import { Icon } from '../shared/icon.browser.tsx';
import { DeleteComment } from './delete-comment.browser.tsx';
import { EditCommentForm } from './edit-comment-form.browser.tsx';
import { VoteComment } from './vote-comment.browser.tsx';

export type CommentListItem = {
  id: number;
  body: string;
  createdAt: string;
  author: {
    name: string;
    image: string | null;
  };
  votesCount: number;
  voted: boolean;
  isCommentAuthor: boolean;
  isDiscussionAuthor: boolean;
};

type CommentRowProps = {
  comment: CommentListItem;
  authenticated: boolean;
};

export const CommentRow = clientEntry<CommentRowProps>(
  import.meta.url,
  function CommentRow(handle) {
    let editing = false;
    let deleting = false;

    addEventListeners(handle.frame, handle.signal, {
      reloadComplete() {
        editing = false;
        deleting = false;
        handle.update();
      },
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
            <EditCommentForm id={comment.id} body={comment.body} />
          </li>
        );
      }

      return (
        <li id={`comment-${comment.id}`} mix={styles.row}>
          <div mix={styles.header}>
            <div mix={styles.authorRow}>
              <Avatar
                src={comment.author.image}
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
                    <Icon name="dots" size={20} />
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

          <p mix={styles.body}>{comment.body}</p>
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
    padding: '0.5rem 1rem',
    marginBottom: '1.25rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    '&:target': {
      borderColor: '#3b82f6',
    },
  }),
  editRow: css({
    marginBottom: '1rem',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    fontSize: '0.875rem',
  }),
  authorRow: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    marginRight: '0.5rem',
  }),
  meta: css({
    margin: 0,
    color: '#6b7280',
  }),
  authorName: css({
    color: '#111827',
    fontWeight: 500,
  }),
  authorBadge: css({
    marginLeft: '0.5rem',
    padding: '1px 0.5rem',
    fontSize: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.75rem',
  }),
  body: css({
    margin: '0 0 0.75rem',
    color: '#374151',
    whiteSpace: 'pre-wrap',
  }),
  menuTrigger: css({
    display: 'grid',
    placeItems: 'center',
    padding: '0.5rem',
    border: 'none',
    borderRadius: '0.375rem',
    backgroundColor: 'transparent',
    color: '#374151',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    },
  }),
  menuContent: css({
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    padding: '0.5rem',
    border: '1px solid #e5e7eb',
  }),
  menuList: css({
    display: 'grid',
    gap: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
  }),
  menuItem: css({
    padding: '0.25rem 0.5rem',
    textAlign: 'left',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    outline: 'none',
    '&:hover, &[data-highlighted]': {
      backgroundColor: '#f3f4f6',
    },
  }),
  menuItemDanger: css({
    color: '#ef4444',
    '&:hover, &[data-highlighted]': {
      backgroundColor: '#fef2f2',
    },
  }),
  modalBackdrop: css({
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'grid',
    placeItems: 'center',
    padding: '1rem',
    backgroundColor: 'rgb(0 0 0 / 0.4)',
  }),
  modal: css({
    width: '100%',
    maxWidth: '24rem',
    padding: '1.25rem',
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    boxShadow:
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  }),
  modalTitle: css({
    margin: '0 0 0.5rem',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
  }),
  modalDescription: css({
    margin: '0 0 1.25rem',
    fontSize: '0.875rem',
    color: '#4b5563',
  }),
  modalActions: css({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  }),
};
