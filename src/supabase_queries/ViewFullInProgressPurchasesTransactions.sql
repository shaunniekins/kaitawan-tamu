create view
  public.ViewFullInProgressPurchasesTransactions as
select
  ipp.in_progress_id,
  ipp.final_price,
  ipp.progress_status,
  ipp.buyer_id,
  ipp.created_at as progress_created_at,
  ipp.last_accessed_at as progress_last_accessed_at,
  coalesce(
    u.raw_user_meta_data ->> 'first_name'::text,
    'Unknown'::text
  ) as buyer_first_name,
  coalesce(
    u.raw_user_meta_data ->> 'last_name'::text,
    'Unknown'::text
  ) as buyer_last_name,
  coalesce(
    u.raw_user_meta_data ->> 'email'::text,
    'Unknown'::text
  ) as buyer_email,
  i.seller_id,
  coalesce(
    s.raw_user_meta_data ->> 'first_name'::text,
    'Unknown'::text
  ) as seller_first_name,
  coalesce(
    s.raw_user_meta_data ->> 'last_name'::text,
    'Unknown'::text
  ) as seller_last_name,
  coalesce(
    s.raw_user_meta_data ->> 'email'::text,
    'Unknown'::text
  ) as seller_email,
  i.item_id,
  i.item_name,
  i.item_price as selling_price,
  i.item_category,
  i.item_condition,
  i.item_description,
  i.item_status,
  i.item_selling_type,
  i.created_at as item_created_at
from
  "InProgressPurchases" ipp
  join auth.users u on ipp.buyer_id = u.id
  join "ItemInventory" i on ipp.item_id = i.item_id
  join auth.users s on i.seller_id = s.id;