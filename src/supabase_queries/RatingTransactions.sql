
create table
  "RatingTransactions" (
    rating_id bigint generated by default as identity not null,
    item_id bigint not null,
    buyer_id uuid not null,
    seller_id uuid not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    created_at timestamp with time zone not null default now(),
    constraint ratingtransactions_pkey primary key (rating_id),
    constraint ratingtransactions_item_id_fkey foreign key (item_id) references "ItemInventory" (item_id) on update cascade on delete cascade,
    constraint ratingtransactions_buyer_id_fkey foreign key (buyer_id) references auth.users (id) on update cascade on delete cascade,
    constraint ratingtransactions_seller_id_fkey foreign key (seller_id) references auth.users (id) on update cascade on delete cascade
  ) tablespace pg_default;