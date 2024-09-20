CREATE OR REPLACE FUNCTION insert_chat_message_on_in_progress_insert()
RETURNS TRIGGER AS $$
DECLARE
    seller_id uuid;
BEGIN
    -- Get the seller_id from the ItemInventory table based on the item_id
    SELECT i.seller_id INTO seller_id
    FROM public."ItemInventory" i
    WHERE i.item_id = NEW.item_id;

    -- Insert a new chat message from the seller to the buyer
    INSERT INTO public."ChatMessages" (
        sender_id,
        receiver_id,
        message
    ) VALUES (
        seller_id, -- sender is the seller
        NEW.buyer_id, -- receiver is the buyer
        'You have a pending transaction with me! Let''s talk more.'
    );

    -- Return the inserted row
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_insert_chat_message
AFTER INSERT ON public."InProgressPurchases"
FOR EACH ROW
EXECUTE FUNCTION insert_chat_message_on_in_progress_insert();
