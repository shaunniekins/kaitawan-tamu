// components/admin/pages/SellPage.tsx

"use client";

import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import SellHeader from "../headers/SellHeader";
import ImageSelector from "@/components/ImageSelector";
import { useState } from "react";

const SellPage = () => {
  const categoryOptions = [
    "Clothing",
    "Electronics",
    "Bag",
    "Footwear",
    "Furniture",
  ];

  const conditionOptions = [
    "Brand new",
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

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<number>(0);

  return (
    <>
      <SellHeader />
      <div className="main-container justify-start">
        <div className="product-details-container overflow-x-hidden">
          <div className="w-full flex-col px-2">
            <div className="w-full flex flex-col gap-6 py-3 mt-3">
              <div className="">
              <ImageSelector
                isDisabled={false}
                title="Items"
                selectedImages={selectedImages}
                previewImages={previewImages}
                onChange={handleImagesChange}
              />
              <p className="text-xs text-gray-600">1-5 images only. Drag and drop to reorder.</p>
              </div>
              <Select
                fullWidth
                label="Category"
                size="md"
                className="w-full"
                labelPlacement="outside"
                placeholder="Select a category"
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                onChange={(e) => setSelectedCondition(e.target.value)}
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
                onChange={(e) => setItemName(e.target.value)}
              />
              <Input
                fullWidth
                type="number"
                label="Item Price"
                labelPlacement="outside"
                placeholder="0.00"
                onChange={(e) => setItemPrice(Number(e.target.value))}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">₱</span>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
      {/* footer */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto flex p-2">
          <Button
            variant="solid"
            radius="sm"
            color="primary"
            fullWidth
            className="text-white font-semibold"
            isDisabled={
              !selectedImages.length  ||
              !selectedCategory ||
              !selectedCondition ||
              !itemName ||
              !itemPrice
            }
            onClick={() => {}}
          >
            List it
          </Button>
        </div>
      </div>
    </>
  );
};

export default SellPage;
