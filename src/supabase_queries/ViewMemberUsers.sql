create view "ViewMemberUsers" as
select
  id,
  email,
  email_confirmed_at, -- use if not yet confirmed
  raw_user_meta_data ->> 'role' as role,
  raw_user_meta_data ->> 'status' as status,
  raw_user_meta_data ->> 'first_name' as first_name,
  raw_user_meta_data ->> 'last_name' as last_name,
  raw_user_meta_data ->> 'id_number' as password,
  raw_user_meta_data ->> 'year_level' as year_level,
  raw_user_meta_data ->> 'password' as user_password,
  raw_user_meta_data,
  created_at
from
  auth.users
where raw_user_meta_data ->> 'role' = 'member'