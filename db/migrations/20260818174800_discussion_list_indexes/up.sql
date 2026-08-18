create index comments_discussion_id_created_at_idx
  on comments (discussion_id, created_at desc);

create index discussion_votes_discussion_id_user_id_idx
  on discussion_votes (discussion_id, user_id);

create index discussions_category_id_idx
  on discussions (category_id);
