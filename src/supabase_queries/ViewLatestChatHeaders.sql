CREATE VIEW "ViewLatestChatHeaders" AS
SELECT
  cm.chat_message_id,
  cm.sender_id,
  cm.receiver_id,
  cm.message,
  cm.last_accessed_at,
  cm.created_at,
  GREATEST(cm.sender_id, cm.receiver_id) AS partner_id,
  LEAST(cm.sender_id, cm.receiver_id) AS other_id,
  sender_user.raw_user_meta_data AS sender_raw_user_meta_data,
  receiver_user.raw_user_meta_data AS receiver_raw_user_meta_data,
  
  COALESCE(sender_user.raw_user_meta_data ->> 'profile_picture', 'Unknown') AS sender_profile_picture,
  COALESCE(receiver_user.raw_user_meta_data ->> 'profile_picture', 'Unknown') AS receiver_profile_picture
FROM
  "ChatMessages" cm
  JOIN auth.users sender_user ON cm.sender_id = sender_user.id
  JOIN auth.users receiver_user ON cm.receiver_id = receiver_user.id
WHERE
  cm.created_at = (
    SELECT
      MAX(subquery.created_at) AS max
    FROM
      "ChatMessages" subquery
    WHERE
      (subquery.sender_id = cm.sender_id AND subquery.receiver_id = cm.receiver_id)
      OR (subquery.sender_id = cm.receiver_id AND subquery.receiver_id = cm.sender_id)
  );