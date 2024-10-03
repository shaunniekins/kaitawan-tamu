create view
  "ViewFullAIMessages" as
select
  cm.chat_message_id,
  cm.message,
  cm.created_at,

  cm.sender_id,
  coalesce(
    s.raw_user_meta_data ->> 'profile_picture'::text,
    'Unknown'::text
  ) as sender_profile_picture,
  coalesce(
    s.raw_user_meta_data ->> 'first_name'::text,
    'Unknown'::text
  ) as sender_first_name,
  coalesce(
    s.raw_user_meta_data ->> 'last_name'::text,
    'Unknown'::text
  ) as sender_last_name,
  coalesce(
    s.raw_user_meta_data ->> 'email'::text,
    'Unknown'::text
  ) as sender_email,

  cm.receiver_id,
  coalesce(
    r.raw_user_meta_data ->> 'profile_picture'::text,
    'Unknown'::text
  ) as receiver_profile_picture,
  coalesce(
    r.raw_user_meta_data ->> 'first_name'::text,
    'Unknown'::text
  ) as receiver_first_name,
  coalesce(
    r.raw_user_meta_data ->> 'last_name'::text,
    'Unknown'::text
  ) as receiver_last_name,
  coalesce(
    r.raw_user_meta_data ->> 'email'::text,
    'Unknown'::text
  ) as receiver_email
from
  "AIMessages" cm
  left join auth.users s on cm.sender_id = s.id
  left join auth.users r on cm.receiver_id = r.id;