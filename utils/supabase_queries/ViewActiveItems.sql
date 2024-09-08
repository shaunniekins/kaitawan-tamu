create view
  public.ViewActiveItems as
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
  coalesce(
    u.raw_user_meta_data ->> 'first_name'::text,
    'Unknown'::text
  ) as seller_first_name,
  coalesce(
    u.raw_user_meta_data ->> 'last_name'::text,
    'Unknown'::text
  ) as seller_last_name,
  coalesce(
    u.raw_user_meta_data ->> 'email'::text,
    'Unknown'::text
  ) as seller_email
from
  "ItemInventory" i
  left join "SoldItemsInventory" s on i.item_id = s.item_list_id
  left join auth.users u on i.seller_id = u.id
where
  s.item_list_id is null;