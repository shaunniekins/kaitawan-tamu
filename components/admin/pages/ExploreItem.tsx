// components/admin/pages/ExploreItem.tsx

"use client";

import { Avatar, Button, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoChevronBack } from "react-icons/io5";

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

  const offers = [
    {
      price: "PHP 1,000",
      until: "Monday, 2024 July 08",
      from: "Seller Name 1",
    },
    {
      price: "PHP 1,500",
      until: "Friday, 2024 July 12",
      from: "Seller Name 2",
    },
    {
      price: "PHP 2,000",
      until: "Wednesday, 2024 July 31",
      from: "Seller Name 3",
    },
    {
      price: "PHP 2,000",
      until: "Wednesday, 2024 July 31",
      from: "Seller Name 3",
    },
    {
      price: "PHP 2,000",
      until: "Wednesday, 2024 July 31",
      from: "Seller Name 3",
    },
    {
      price: "PHP 2,000",
      until: "Wednesday, 2024 July 31",
      from: "Seller Name 3",
    },
  ];

  return (
    <>
      <div className="main-container justify-start">
        <Button onClick={() => router.back()}>
          <IoChevronBack />
          back
        </Button>
        <div className="product-details-container overflow-x-hidden">
          <div className="w-full">
            <img
              src={imageUrl}
              alt={productName}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="w-full flex-col ">
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
                onClick={() => {}}>
                Visit Store
              </Button>
            </div>
            {/* <h1 className="text-xs">{id}</h1> */}
          </div>
          <div className="w-full bg-gray-50 flex flex-col justify-between py-3">
            <h3 className="font-semibold font-lg">
              Bidding Offers{" "}
              <span className="font-normal">({offers.length})</span>
            </h3>
            {offers.map((offer, index) => (
              <div key={index} className="flex flex-col my-3 px-3">
                <div className="flex justify-between">
                  <h6 className="text-sm">Price: {offer.price}</h6>
                  <h6 className="text-sm">Until: {offer.until}</h6>
                </div>
                <h6 className="text-sm">From: {offer.from}</h6>
                <hr />
              </div>
            ))}
          </div>
        </div>
      </div>
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
              onClick={() => {}}>
              Offer Bid
            </Button>
            <Button
              variant="solid"
              radius="sm"
              color="danger"
              fullWidth
              onClick={() => {}}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExploreItem;
