create view
  public."ViewLatestChatHeaders" as
select
  cm.chat_message_id,
  cm.sender_id,
  cm.receiver_id,
  cm.message,
  cm.last_accessed_at,
  cm.created_at,
  greatest(cm.sender_id, cm.receiver_id) as partner_id,
  least(cm.sender_id, cm.receiver_id) as other_id,
  sender_user.raw_user_meta_data as sender_raw_user_meta_data,
  receiver_user.raw_user_meta_data as receiver_raw_user_meta_data
from
  "ChatMessages" cm
  join auth.users sender_user on cm.sender_id = sender_user.id
  join auth.users receiver_user on cm.receiver_id = receiver_user.id
where
  cm.created_at = (
    (
      select
        max(subquery.created_at) as max
      from
        "ChatMessages" subquery
      where
        subquery.sender_id = cm.sender_id
        and subquery.receiver_id = cm.receiver_id
        or subquery.sender_id = cm.receiver_id
        and subquery.receiver_id = cm.sender_id
    )
  );