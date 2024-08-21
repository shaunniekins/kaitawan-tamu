CREATE VIEW "ViewFullBiddingTransactions" AS
SELECT
    b.id AS bid_id,
    b.item_list_id,
    b.bidder_id,
    b.bid_price,
    b.bid_due,
    b.status,
    b.created_at AS bid_created_at,
    -- Extracting first_name, last_name, and email from raw_user_meta_data JSON field
    COALESCE(
        (u.raw_user_meta_data->>'first_name')::text,
        'Unknown'
    ) AS bidder_first_name,
    COALESCE(
        (u.raw_user_meta_data->>'last_name')::text,
        'Unknown'
    ) AS bidder_last_name,
    COALESCE(
        (u.raw_user_meta_data->>'email')::text,
        'Unknown'
    ) AS bidder_email,
    -- Seller and item details from ItemInventory
    i.seller_id,
    COALESCE(
        (s.raw_user_meta_data->>'first_name')::text,
        'Unknown'
    ) AS seller_first_name,
    COALESCE(
        (s.raw_user_meta_data->>'last_name')::text,
        'Unknown'
    ) AS seller_last_name,
    COALESCE(
        (s.raw_user_meta_data->>'email')::text,
        'Unknown'
    ) AS seller_email,
    i.item_name,
    i.item_price AS selling_price,
    i.item_category,
    i.item_condition,
    i.created_at AS item_created_at
FROM
    public."BiddingTransactions" b
JOIN
    auth.users u ON b.bidder_id = u.id
JOIN
    public."ItemInventory" i ON b.item_list_id = i.id
JOIN
    auth.users s ON i.seller_id = s.id;