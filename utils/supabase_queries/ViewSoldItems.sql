CREATE VIEW "ViewSoldItems" AS
SELECT
    i.id AS item_id,
    i.seller_id,
    i.item_name,
    i.item_price,
    i.item_category,
    i.item_condition,
    i.item_description,
    i.item_status,
    i.created_at AS item_created_at,
    s.id AS sold_id,
    s.buyer_id,
    s.bid_price,
    s.created_at AS sold_created_at,
    -- Extracting seller's first_name, last_name, and email from raw_user_meta_data JSON field
    COALESCE(
        (seller_u.raw_user_meta_data->>'first_name')::text,
        'Unknown'
    ) AS seller_first_name,
    COALESCE(
        (seller_u.raw_user_meta_data->>'last_name')::text,
        'Unknown'
    ) AS seller_last_name,
    COALESCE(
        (seller_u.raw_user_meta_data->>'email')::text,
        'Unknown'
    ) AS seller_email,
    -- Extracting buyer's first_name, last_name, and email from raw_user_meta_data JSON field
    COALESCE(
        (buyer_u.raw_user_meta_data->>'first_name')::text,
        'Unknown'
    ) AS buyer_first_name,
    COALESCE(
        (buyer_u.raw_user_meta_data->>'last_name')::text,
        'Unknown'
    ) AS buyer_last_name,
    COALESCE(
        (buyer_u.raw_user_meta_data->>'email')::text,
        'Unknown'
    ) AS buyer_email
FROM
    public."ItemInventory" i
JOIN
    public."SoldItemsInventory" s
ON
    i.id = s.item_list_id
-- Join with auth.users to get the seller's information
LEFT JOIN
    auth.users seller_u
ON
    i.seller_id = seller_u.id
-- Join with auth.users to get the buyer's information
LEFT JOIN
    auth.users buyer_u
ON
    s.buyer_id = buyer_u.id;
