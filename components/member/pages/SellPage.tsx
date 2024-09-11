// components/admin/pages/SellPage.tsx

"use client";

import {
  Button,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import SellHeader from "../headers/SellHeader";
import ImageSelector from "@/components/ImageSelector";
import { useEffect, useState } from "react";
import { insertItemInventoryData } from "@/app/api/itemInventoryData";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import ExploreHeader from "../headers/ExploreHeader";

const SellPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }, [supabase]);

  const categoryOptions = [
    "Clothing",
    "Electronics",
    "Bag",
    "Footwear",
    "Furniture",
  ];

  const conditionOptions = [
    // "Brand new",
    "Lightly used",
    "Moderately used",
    "Heavily used",
  ];

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleImagesChange = (newImages: File[], newPreviews: string[]) => {
    setSelectedImages(newImages);
    setPreviewImages(newPreviews);
  };

  const [newSelectedCategory, setNewSelectedCategory] = useState<string>("");
  const [newSelectedCondition, setNewSelectedCondition] = useState<string>("");
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemDescription, setNewItemDescription] = useState<string>("");
  const [newSelectedSellingType, setNewSelectedSellingType] =
    useState<string>("sell");

  const handleInsertItem = async (e: any) => {
    e.preventDefault();

    const newRecord = {
      item_name: newItemName,
      item_price: newItemPrice,
      item_category: newSelectedCategory,
      item_condition: newSelectedCondition,
      item_description: newItemDescription,
      item_selling_type: newSelectedSellingType,
      seller_id: user?.id,
    };

    const response = await insertItemInventoryData(newRecord);

    if (!response) {
      console.error("Error inserting item:", response);
      return;
    }
    setNewItemName("");
    setNewItemPrice(0);
    setNewSelectedCategory("");
    setNewSelectedCondition("");
    setSelectedImages([]);

    return router.push("/ident/member/listing");
  };

  return (
    <>
      <div className="lg:hidden">
        <SellHeader />
      </div>
      <div className="hidden lg:block">
        <ExploreHeader />
      </div>
      <div className="main-container justify-start">
        <div className="product-details-container overflow-x-hidden">
          <div className="w-full flex-col px-2">
            <div className="w-full flex flex-col gap-6 py-3 lg:py-2 mt-3 lg:mt-14">
              <div>
                <ImageSelector
                  isDisabled={false}
                  title="Items"
                  selectedImages={selectedImages}
                  previewImages={previewImages}
                  onChange={handleImagesChange}
                />
                <p className="text-xs text-gray-600">
                  1-5 images only. Drag and drop to reorder.
                </p>
              </div>
              <RadioGroup
                label="Select Selling Type"
                color="success"
                value={newSelectedSellingType}
                size="sm"
                // orientation="horizontal"
                onValueChange={setNewSelectedSellingType}
              >
                <Radio value="sell" description="Sell your item directly">
                  Sell
                </Radio>
                <Radio value="auction" description="Auction your item">
                  Auction
                </Radio>
              </RadioGroup>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Select
                  fullWidth
                  label="Category"
                  size="md"
                  className="w-full"
                  labelPlacement="outside"
                  placeholder="Select a category"
                  onChange={(e) => setNewSelectedCategory(e.target.value)}
                >
                  {categoryOptions.map((category) => (
                    <SelectItem key={category}>{category}</SelectItem>
                  ))}
                </Select>

                <Select
                  fullWidth
                  label="Condition"
                  size="md"
                  labelPlacement="outside"
                  placeholder="Select item condition"
                  onChange={(e) => setNewSelectedCondition(e.target.value)}
                >
                  {conditionOptions.map((condition) => (
                    <SelectItem key={condition}>{condition}</SelectItem>
                  ))}
                </Select>

                <Input
                  fullWidth
                  type="text"
                  label="Item Name"
                  labelPlacement="outside"
                  placeholder="Input item name"
                  onChange={(e) => setNewItemName(e.target.value)}
                />
                <Input
                  fullWidth
                  type="number"
                  label="Item Price"
                  labelPlacement="outside"
                  placeholder="0.00"
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">₱</span>
                    </div>
                  }
                />
              </div>

              <Textarea
                fullWidth
                label="Description"
                labelPlacement="outside"
                placeholder="Describe your item"
                onChange={(e) => setNewItemDescription(e.target.value)}
              />
              <Button
                variant="solid"
                radius="sm"
                className="w-full lg:w-32 hidden lg:block bg-[#008B47] text-white lg:self-center"
                isDisabled={
                  !selectedImages.length ||
                  !newSelectedCategory ||
                  !newSelectedCondition ||
                  !newItemName ||
                  !newItemPrice ||
                  !newItemDescription ||
                  !newSelectedSellingType
                }
                onClick={handleInsertItem}
              >
                List it
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* footer */}
      <div className="fixed lg:hidden inset-x-0 bottom-0 z-50 bg-white shadow-lg">
        <div className="max-w-6xl mx-auto flex p-2">
          <Button
            variant="solid"
            radius="sm"
            fullWidth
            className="bg-[#008B47] text-white font-semibold"
            isDisabled={
              !selectedImages.length ||
              !newSelectedCategory ||
              !newSelectedCondition ||
              !newItemName ||
              !newItemPrice ||
              !newItemDescription ||
              !newSelectedSellingType
            }
            onClick={handleInsertItem}
          >
            List it
          </Button>
        </div>
      </div>
    </>
  );
};

export default SellPage;
