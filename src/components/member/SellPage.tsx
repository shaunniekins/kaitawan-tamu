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
import Joyride, { Step } from "react-joyride";

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
  const [isTourOpen, setIsTourOpen] = useState(false);

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

  const tourSteps: Step[] = [
    {
      target: ".upload-section",
      content:
        "Click in the upload input to upload images and video. You can upload up to 5 images and 1 video (within 12-15 seconds).",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".video-instruction",
      content:
        "For the video: Record a 12-15 second video of your item from different angles. This will serve as a 3D view for buyers.",
      placement: "bottom",
    },
    {
      target: ".image-instruction",
      content:
        "For images: Upload clear, well-lit photos in portrait or square format. Drag and drop to reorder them.",
      placement: "bottom",
    },
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
    const imageUrls: { url: string; item_order: number }[] = [];

    // Separate video and images
    const video = selectedImages.find((image) =>
      image.type.startsWith("video/")
    );
    const images = selectedImages.filter(
      (image) => !image.type.startsWith("video/")
    );

    // Upload video first if it exists
    if (video) {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`public/${Date.now()}_${video.name}`, video);

      if (error) {
        setIsLoading(false);
        console.error("Error uploading video:", error.message);
        return;
      }

      const { publicUrl } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path).data; // Get the public URL

      imageUrls.push({ url: publicUrl, item_order: 0 }); // Add video URL with order 0
    }

    // Upload each image and get the public URL
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
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

      imageUrls.push({ url: publicUrl, item_order: video ? i + 1 : i }); // Add URL with order
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
      image_urls: imageUrls,
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

    // Redirect to the listing page
    return router.push("/member/listing");
  };

  return (
    <>
      <Joyride
        steps={tourSteps}
        run={isTourOpen}
        continuous
        showSkipButton
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setIsTourOpen(false);
          }
        }}
      />
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
                <div className="upload-section">
                  <ImageSelector
                    isDisabled={false}
                    title="Items"
                    selectedMedia={selectedImages}
                    previewMedia={previewImages}
                    onChange={handleImagesChange}
                  />
                  <p className="text-xs text-gray-600">
                    Ensure the images are in portrait or square mode. You can
                    upload 1 video (as the 3d picture) and 1-5 images and drag
                    and drop to reorder them.{" "}
                    <button
                      onClick={() => setIsTourOpen(true)}
                      className="text-blue-600 hover:underline"
                    >
                      How?
                    </button>
                  </p>
                  <div className="hidden video-instruction image-instruction" />
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
