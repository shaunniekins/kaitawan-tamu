CREATE VIEW "ViewActiveItems" AS
SELECT
    i.id AS item_id,
    i.seller_id,
    i.item_name,
    i.item_price,
    i.item_category,
    i.item_condition,
    i.created_at AS item_created_at,
    -- Extracting first_name, last_name, and email from raw_user_meta_data JSON field
    COALESCE(
        (u.raw_user_meta_data->>'first_name')::text,
        'Unknown'
    ) AS seller_first_name,
    COALESCE(
        (u.raw_user_meta_data->>'last_name')::text,
        'Unknown'
    ) AS seller_last_name,
    COALESCE(
        (u.raw_user_meta_data->>'email')::text,
        'Unknown'
    ) AS seller_email
FROM
    public."ItemInventory" i
LEFT JOIN
    public."SoldItemsInventory" s
ON
    i.id = s.item_list_id
-- Join with auth.users to get user information
LEFT JOIN
    auth.users u
ON
    i.seller_id = u.id
WHERE
    s.item_list_id IS NULL;
