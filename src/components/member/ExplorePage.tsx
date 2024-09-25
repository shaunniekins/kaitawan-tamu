"use client";

import { RootState } from "@/app/reduxUtils/store";
import useItemInventory from "@/hooks/useItemInventory";
import {
  Avatar,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Image,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdOutlineSell } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { useSelector } from "react-redux";

const ExplorePage = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const rowsPerPage = 200;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { items, loadingItems, errorItems } = useItemInventory(
    rowsPerPage,
    currentPage,
    "approved",
    true,
    user?.id,
    false,
    selectedTags
  );

  useEffect(() => {
    setIsLoading(loadingItems);
  }, [loadingItems]);

  const tags = ["Clothing", "Electronics", "Bag", "Footwear", "Furniture"];

  const toggleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner color="success" />
        </div>
      )}
      <div className="w-full flex overflow-x-auto my-2 gap-2 custom-scrollbar">
        {tags.map((tag) => (
          <Chip
            key={tag}
            color={selectedTags.includes(tag) ? "success" : "default"}
            className="cursor-pointer"
            onClick={() => toggleTagSelection(tag)}
          >
            {tag}
          </Chip>
        ))}
      </div>

      {!isLoading && (
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 px-2">
          {items.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <p className="text-gray-500">No items available</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setIsLoading(true);
                  return router.push(`explore/${item.item_id}`);
                }}
              >
                <Card className="rounded-md shadow-none">
                  <CardBody className="p-0 w-full">
                    <Image
                      alt="Product Image"
                      className={`${
                        isLoading && "h-56 w-56"
                      } object-cover rounded-none w-full rounded-b-md aspect-square`}
                      src={
                        isLoading
                          ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                          : item.image_urls && item.image_urls.length > 0
                          ? item.image_urls[0]
                          : "https://fakeimg.pl/500x500?text=img&font=bebas"
                      }
                    />
                  </CardBody>
                  <CardFooter className="py-1 px-0 flex-col items-start rounded-none">
                    <div className="w-full flex justify-between">
                      <p className="font-semibold text-sm truncate">
                        {item.item_name}
                      </p>
                      <div className="flex gap-1">
                        {item.item_selling_type === "sell" ? (
                          <MdOutlineSell size={20} />
                        ) : (
                          <RiAuctionLine size={20} />
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-medium text-[#008B47]">
                      <span className="text-small">₱</span>
                      {parseFloat(item.item_price).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h4>
                    <div className="flex gap-1">
                      <Avatar
                        src="https://fakeimg.pl/500x500?text=user&font=bebas"
                        className="w-4 h-4 text-xs"
                        disableAnimation
                      />
                      <h6 className="text-xs truncate">
                        {item.seller_first_name} {item.seller_last_name}
                      </h6>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
