CREATE VIEW "ViewFullItemInventory" AS
SELECT
  i.item_id,
  i.item_name,
  i.item_price,
  i.item_category,
  i.item_condition,
  i.item_description,
  i.item_status,
  i.item_selling_type,
  i.image_urls,
  i.created_at AS item_created_at,

  i.seller_id,
   COALESCE(
    u.raw_user_meta_data ->> 'profile_picture'::text,
    'Unknown'::text
  ) AS seller_profile_picture,
  COALESCE(
    u.raw_user_meta_data ->> 'first_name'::text,
    'Unknown'::text
  ) AS seller_first_name,
  COALESCE(
    u.raw_user_meta_data ->> 'last_name'::text,
    'Unknown'::text
  ) AS seller_last_name,
  COALESCE(
    u.raw_user_meta_data ->> 'email'::text,
    'Unknown'::text
  ) AS seller_email
 
FROM
  "ItemInventory" i
  JOIN auth.users u ON i.seller_id = u.id;