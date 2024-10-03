CREATE VIEW "ViewFullLikedItems" AS
SELECT
    LI."liked_id",
    LI."item_id",
    LI."liker_id",
    LI."created_at",

    II."item_name",
    II."item_price",
    II."item_category",
    II."item_condition",
    II."item_description",
    II."item_status",
    II."item_selling_type",
    II."image_urls",
    II."created_at" AS "item_created_at",

    COALESCE(U."raw_user_meta_data" ->> 'profile_picture', 'Unknown') AS "liker_profile_picture",
    COALESCE(U."raw_user_meta_data" ->> 'first_name', 'Unknown') AS "liker_first_name",
    COALESCE(U."raw_user_meta_data" ->> 'last_name', 'Unknown') AS "liker_last_name",
    COALESCE(U."raw_user_meta_data" ->> 'email', 'Unknown') AS "liker_email"

FROM
    "LikedItems" AS LI
    JOIN "ItemInventory" AS II ON LI."item_id" = II."item_id"
    JOIN auth.users AS U ON LI."liker_id" = U.id;