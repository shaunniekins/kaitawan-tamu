"use client";

import { insertItemInventoryData } from "@/app/api/itemInventoryIUD";
import { RootState } from "@/app/reduxUtils/store";
import { resizeImage } from "@/utils/compUtils";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import SellHeader from "./headers/SellHeader";
import {
  Button,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import ImageSelector from "../ImageSelector";

const SellPage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const router = useRouter();

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const [newSelectedCategory, setNewSelectedCategory] = useState<string>("");
  const [newSelectedCondition, setNewSelectedCondition] = useState<string>("");
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemDescription, setNewItemDescription] = useState<string>("");
  const [newSelectedSellingType, setNewSelectedSellingType] =
    useState<string>("sell");
  const [isLoading, setIsLoading] = useState(false);

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

  // Image resizing function (assuming you have the resizeImage function defined)
  const handleImagesChange = async (
    newImages: File[],
    newPreviews: string[]
  ) => {
    const resizedImages: File[] = [];

    for (const file of newImages) {
      const resizedImage = await resizeImage(file); // Resize the image
      resizedImages.push(resizedImage as File); // Store resized image
    }

    setSelectedImages(resizedImages); // Store resized images
    setPreviewImages(newPreviews); // Set previews for display
  };

  const handleInsertItem = async (e: any) => {
    e.preventDefault();

    setIsLoading(true);

    if (!selectedImages.length) {
      setIsLoading(false);
      console.error("No images selected!");
      return;
    }

    const BUCKET_NAME = "inventory-items"; // Use the correct bucket name
    const imageUrls: string[] = [];

    // Upload each image and get the public URL
    for (const image of selectedImages) {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`public/${Date.now()}_${image.name}`, image);

      if (error) {
        setIsLoading(false);
        console.error("Error uploading image:", error.message);
        return;
      }

      const { publicUrl } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path).data; // Get the public URL

      imageUrls.push(publicUrl); // Add URL to array
    }

    // Prepare the new item record
    const newRecord = {
      item_name: newItemName,
      item_price: newItemPrice,
      item_category: newSelectedCategory,
      item_condition: newSelectedCondition,
      item_description: newItemDescription,
      item_selling_type: newSelectedSellingType,
      seller_id: user?.id,
      image_urls: imageUrls, // Store the array of image URLs
    };

    // Insert the item into the database
    const response = await insertItemInventoryData(newRecord);

    if (!response) {
      setIsLoading(false);
      console.error("Error inserting item");
      return;
    }

    // Reset form and state after successful insertion
    setNewItemName("");
    setNewItemPrice(0);
    setNewSelectedCategory("");
    setNewSelectedCondition("");
    setSelectedImages([]);
    setPreviewImages([]);
    // setIsLoading(false);

    // Redirect to the listing page
    return router.push("/member/listing");
  };

  return (
    <>
      <div className="w-full h-full flex flex-col items-center">
        <SellHeader />
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Spinner color="success" />
          </div>
        )}
        {!isLoading && (
          <>
            <div className="w-full flex flex-col flex-grow px-2">
              <div className="w-full flex flex-col gap-6 py-3 lg:py-2 mt-3 flex-grow">
                <div>
                  <ImageSelector
                    isDisabled={false}
                    title="Items"
                    selectedImages={selectedImages}
                    previewImages={previewImages}
                    onChange={handleImagesChange}
                  />
                  <p className="text-xs text-gray-600">
                    Ensure the images are in portrait or square mode. You can
                    upload 1-5 images and drag and drop to reorder them.
                  </p>
                </div>
                <RadioGroup
                  label="Select Selling Type"
                  color="success"
                  value={newSelectedSellingType}
                  size="sm"
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
            {/* footer */}
            <div className="sticky lg:hidden bottom-0 w-full z-50 bg-white shadow-lg">
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
        )}
      </div>
    </>
  );
};

export default SellPage;
