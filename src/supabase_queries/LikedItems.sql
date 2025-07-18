create table
  public."LikedItems" (
    liked_id bigint generated by default as identity not null,
    item_id bigint not null,
    liker_id uuid not null,
    created_at timestamp with time zone not null default now(),
    constraint LikedItems_pkey primary key (liked_id),
    constraint LikedItems_item_id_fkey foreign key (item_id) references "ItemInventory" (item_id) on update cascade on delete cascade,
    constraint LikedItems_liker_id_fkey foreign key (liker_id) references auth.users (id) on update cascade on delete cascade
  ) tablespace pg_default;