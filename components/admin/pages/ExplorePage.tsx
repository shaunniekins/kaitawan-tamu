// components/admin/pages/ExplorePage.tsx

"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
  Avatar,
  Chip,
} from "@nextui-org/react";
import { TiShoppingCart } from "react-icons/ti";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { sellMockupData } from "@/app/api/sell";
import { useRouter } from "next/navigation";

const ExplorePage = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const tags = ["Clothing", "Electronics", "Bag", "Footwear", "Furniture"];

  const filteredData = sellMockupData.filter((item) =>
    selectedTags.length > 0 ? selectedTags.includes(item.tag) : true
  );

  const router = useRouter();

  return (
    <div className="max-w-4xl h-full w-full flex items-center flex-col overflow-x-hidden overflow-y-auto">
      <div className="w-full flex overflow-x-auto md:mt-2 mb-2 gap-2">
        {tags.map((tag) => (
          <Chip
            key={tag}
            color={selectedTags.includes(tag) ? "primary" : "default"}
            className="cursor-pointer"
            onClick={() => toggleTagSelection(tag)}>
            {tag}
          </Chip>
        ))}
      </div>
      <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-3">
        {filteredData.map((item) => (
          <div onClick={() => router.push(`explore/${item.id}`)}>
            <Card key={item.id} className="rounded-md shadow-none">
              <CardBody className="bg-blue-200 p-0 h-40 w-full">
                <Image
                  alt="Card background"
                  className="object-cover rounded-none w-full h-40 rounded-b-md"
                  src={item.imageUrl}
                />
              </CardBody>
              <CardFooter className="py-1 px-0 flex-col items-start rounded-none">
                <div className="w-full flex justify-between">
                  <p className="font-semibold text-sm truncate">
                    {item.productName}
                  </p>
                  <div className="flex gap-1">
                    <TiShoppingCart size={20} />
                    <FaRegMoneyBillAlt size={20} />
                  </div>
                </div>
                <h4 className="font-semibold text-medium">
                  {item.productPrice}
                </h4>
                <div className="flex gap-1">
                  <Avatar src={item.sellerAvatar} className="w-4 h-4 text-xs" />
                  <h6 className="text-xs truncate">{item.sellerName}</h6>
                </div>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
