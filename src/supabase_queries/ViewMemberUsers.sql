CREATE VIEW "ViewMemberUsers" AS
SELECT
  users.id,
  users.email,
  users.raw_user_meta_data ->> 'role' AS role,
  users.raw_user_meta_data ->> 'account_status' AS account_status,
  users.raw_user_meta_data ->> 'profile_picture' AS profile_picture,
  users.raw_user_meta_data ->> 'first_name' AS first_name,
  users.raw_user_meta_data ->> 'last_name' AS last_name,
  users.raw_user_meta_data ->> 'id_number' AS id_number,
  users.raw_user_meta_data ->> 'year_level' AS year_level,
  users.raw_user_meta_data ->> 'password' AS user_password,
  users.raw_user_meta_data,
  users.created_at
FROM
  auth.users
WHERE users.raw_user_meta_data ->> 'role' = 'member';
