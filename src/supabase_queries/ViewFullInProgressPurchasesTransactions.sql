CREATE VIEW "ViewFullInProgressPurchasesTransactions" AS
SELECT
  ipp.in_progress_id,
  ipp.final_price,
  ipp.progress_status,
  ipp.created_at AS progress_created_at,
  ipp.last_accessed_at AS progress_last_accessed_at,
  
  -- Buyer details
  ipp.buyer_id,
  COALESCE(u.raw_user_meta_data ->> 'profile_picture', 'Unknown') AS buyer_profile_picture,
  COALESCE(u.raw_user_meta_data ->> 'first_name', 'Unknown') AS buyer_first_name,
  COALESCE(u.raw_user_meta_data ->> 'last_name', 'Unknown') AS buyer_last_name,
  COALESCE(u.raw_user_meta_data ->> 'email', 'Unknown') AS buyer_email,
  
  -- Seller details
  i.seller_id,
  COALESCE(s.raw_user_meta_data ->> 'profile_picture', 'Unknown') AS seller_profile_picture,
  COALESCE(s.raw_user_meta_data ->> 'first_name', 'Unknown') AS seller_first_name,
  COALESCE(s.raw_user_meta_data ->> 'last_name', 'Unknown') AS seller_last_name,
  COALESCE(s.raw_user_meta_data ->> 'email', 'Unknown') AS seller_email,
  
  i.item_id,
  i.item_name,
  i.item_price AS selling_price,
  i.item_category,
  i.item_condition,
  i.item_description,
  i.item_status,
  i.item_selling_type,
  i.image_urls,
  i.created_at AS item_created_at
FROM
  "InProgressPurchases" ipp
  JOIN auth.users u ON ipp.buyer_id = u.id
  JOIN "ItemInventory" i ON ipp.item_id = i.item_id
  JOIN auth.users s ON i.seller_id = s.id;