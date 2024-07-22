// components/admin/pages/ExploreItem.tsx

"use client";

import { Avatar, Badge, Button, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoChevronBack, IoChevronDown, IoChevronUp } from "react-icons/io5";
import ExploreItemHeader from "../headers/ExploreItemHeader";

interface ExploreItemProps {
  id: number;
  imageUrl: string;
  productName: string;
  productPrice: string;
  tag: string;
  sellerAvatar: string;
  sellerName: string;
}

const ExploreItem = ({
  id,
  imageUrl,
  productName,
  productPrice,
  tag,
  sellerAvatar,
  sellerName,
}: ExploreItemProps) => {
  const router = useRouter();

  const [showAll, setShowAll] = useState(false);

  const offers = [
    {
      price: "PHP 1,000",
      until: "Monday, 2024 July 08",
      from: "Seller Name 1",
      status: "Active",
    },
    {
      price: "PHP 1,500",
      until: "Friday, 2024 July 12",
      from: "Seller Name 2",
      status: "Expired",
    },

    {
      price: "PHP 2,000",
      until: "Wednesday, 2024 July 31",
      from: "Seller Name 3",
      status: "Cancelled",
    },
    {
      price: "PHP 2,000",
      until: "Wednesday, 2024 July 31",
      from: "Seller Name 3",
      status: "Cancelled",
    },
    {
      price: "PHP 2,000",
      until: "Wednesday, 2024 July 31",
      from: "Seller Name 3",
      status: "Expired",
    },
    {
      price: "PHP 2,000",
      until: "Wednesday, 2024 July 31",
      from: "Seller Name 3",
      status: "Active",
    },
  ];

  return (
    <>
      <ExploreItemHeader />
      <div className="main-container justify-start">
        <div className="product-details-container overflow-x-hidden">
          <div className="w-full">
            <img
              src={imageUrl}
              alt={productName}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="w-full flex-col px-2">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-3xl">{productPrice}</h2>
              <Chip color="primary">{tag}</Chip>
            </div>
            <h3 className="font-semibold text-xl">{productName}</h3>
            <div className="w-full bg-gray-50 flex justify-between py-3 mt-3">
              <div className="flex gap-1">
                <Avatar src={sellerAvatar} radius="sm" />
                <h6 className="text-sm truncate">{sellerName}</h6>
              </div>
              <Button
                variant="solid"
                radius="sm"
                color="danger"
                onClick={() => {}}
              >
                Visit Store
              </Button>
            </div>
            {/* <h1 className="text-xs">{id}</h1> */}
          </div>
          <div className="w-full bg-gray-50 flex flex-col justify-between py-3 px-2">
            <h3 className="font-semibold font-lg">
              Bidding Offers{" "}
              <span className="font-normal">({offers.length})</span>
            </h3>
            {offers
              .slice(0, showAll ? offers.length : 3)
              .map((offer, index) => (
                <Badge
                  key={`badge-${index}`}
                  content="Highest Bidder"
                  color="secondary"
                  variant="flat"
                  size="sm"
                  className={`${index !== 0 && "hidden"} mr-7 md:mr-0 mb-10`}
                >
                  <div key={index} className="w-full flex flex-col my-3">
                    <div className="flex justify-between">
                      <h6 className="text-sm">Offer: {offer.price}</h6>
                      <h6 className="text-xs italic">{offer.until}</h6>
                    </div>
                    <div className="flex justify-between">
                      <h6 className="text-sm">{offer.from}</h6>
                      <h6
                        className={`text-xs ${
                          offer.status === "Active"
                            ? "text-green-500"
                            : offer.status === "Expired"
                            ? "text-orange-500"
                            : "text-red-500"
                        }`}
                      >
                        {offer.status}
                      </h6>
                    </div>
                    <hr />
                  </div>
                </Badge>
              ))}
            <div
              className={`flex justify-center ${
                offers.length <= 3 && "hidden"
              }`}
            >
              <Button
                size="sm"
                endContent={showAll ? <IoChevronUp /> : <IoChevronDown />}
                variant={showAll ? "bordered" : "solid"}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : "Show All"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* footer */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-around items-center gap-5 px-2 border-t-3 py-1">
          <div className="flex flex-col items-center">
            <Avatar src={sellerAvatar} className="w-7 h-7 text-sm" />
            <h6 className="text-xs">Seller</h6>
          </div>
          <div className="w-full flex gap-2">
            <Button
              variant="bordered"
              radius="sm"
              color="primary"
              fullWidth
              onClick={() => {}}
            >
              Offer Bid
            </Button>
            <Button
              variant="solid"
              radius="sm"
              color="danger"
              fullWidth
              onClick={() => {}}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExploreItem;
