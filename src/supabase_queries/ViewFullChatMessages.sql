CREATE VIEW "ViewFullChatMessages" AS
SELECT
    cm.chat_message_id,
    cm.message,
    cm.created_at,
    cm.last_accessed_at,

    -- Sender details
    cm.sender_id,
    COALESCE(s.raw_user_meta_data ->> 'first_name', 'Unknown') AS sender_first_name,
    COALESCE(s.raw_user_meta_data ->> 'last_name', 'Unknown') AS sender_last_name,
    COALESCE(s.raw_user_meta_data ->> 'email', 'Unknown') AS sender_email,

    -- Receiver details
    cm.receiver_id,
    COALESCE(r.raw_user_meta_data ->> 'first_name', 'Unknown') AS receiver_first_name,
    COALESCE(r.raw_user_meta_data ->> 'last_name', 'Unknown') AS receiver_last_name,
    COALESCE(r.raw_user_meta_data ->> 'email', 'Unknown') AS receiver_email

FROM
    public."ChatMessages" cm

-- Join for sender details
LEFT JOIN auth.users s ON cm.sender_id = s.id

-- Join for receiver details
LEFT JOIN auth.users r ON cm.receiver_id = r.id;
