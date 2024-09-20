create view
  public.ViewSoldItems as
select
  i.item_id,
  i.seller_id,
  i.item_name,
  i.item_price,
  i.item_category,
  i.item_condition,
  i.item_description,
  i.item_status,
  i.item_selling_type,
  i.created_at as item_created_at,
  s.sold_item_id,
  s.buyer_id,
  s.bid_price,
  s.created_at as sold_created_at,
  coalesce(
    seller_u.raw_user_meta_data ->> 'first_name'::text,
    'Unknown'::text
  ) as seller_first_name,
  coalesce(
    seller_u.raw_user_meta_data ->> 'last_name'::text,
    'Unknown'::text
  ) as seller_last_name,
  coalesce(
    seller_u.raw_user_meta_data ->> 'email'::text,
    'Unknown'::text
  ) as seller_email,
  coalesce(
    buyer_u.raw_user_meta_data ->> 'first_name'::text,
    'Unknown'::text
  ) as buyer_first_name,
  coalesce(
    buyer_u.raw_user_meta_data ->> 'last_name'::text,
    'Unknown'::text
  ) as buyer_last_name,
  coalesce(
    buyer_u.raw_user_meta_data ->> 'email'::text,
    'Unknown'::text
  ) as buyer_email
from
  "ItemInventory" i
  join "SoldItemsInventory" s on i.item_id = s.item_list_id
  left join auth.users seller_u on i.seller_id = seller_u.id
  left join auth.users buyer_u on s.buyer_id = buyer_u.id;