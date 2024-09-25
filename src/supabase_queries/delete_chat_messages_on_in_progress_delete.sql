create or replace function delete_chat_messages_on_in_progress_delete()
returns trigger as $$
begin
  -- Delete messages between buyer and seller when the InProgressPurchases row is deleted
  delete from public."ChatMessages"
  where 
    (sender_id = old.buyer_id and receiver_id = (select seller_id from public."ItemInventory" where item_id = old.item_id))
    or 
    (receiver_id = old.buyer_id and sender_id = (select seller_id from public."ItemInventory" where item_id = old.item_id));
  
  return old;
end;
$$ language plpgsql;


create trigger trigger_delete_chat_messages
after delete on public."InProgressPurchases"
for each row
execute function delete_chat_messages_on_in_progress_delete();
