create view
  public.ViewFullBiddingTransactions as
select
  b.bid_id,
  b.item_list_id,
  b.bidder_id,
  b.bid_price,
  b.bid_due,
  b.bid_status,
  b.created_at as bid_created_at,
  coalesce(
    u.raw_user_meta_data ->> 'first_name'::text,
    'Unknown'::text
  ) as bidder_first_name,
  coalesce(
    u.raw_user_meta_data ->> 'last_name'::text,
    'Unknown'::text
  ) as bidder_last_name,
  coalesce(
    u.raw_user_meta_data ->> 'email'::text,
    'Unknown'::text
  ) as bidder_email,
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
  i.item_name,
  i.item_price as selling_price,
  i.item_category,
  i.item_condition,
  i.item_description,
  i.item_status,
  i.item_selling_type,
  i.created_at as item_created_at
from
  "BiddingTransactions" b
  join auth.users u on b.bidder_id = u.id
  join "ItemInventory" i on b.item_list_id = i.item_id
  join auth.users s on i.seller_id = s.id;