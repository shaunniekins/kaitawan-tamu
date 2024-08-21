// components/admin/pages/ExplorePage.tsx

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardBody, CardFooter, Avatar, Chip } from "@nextui-org/react";
import { TiShoppingCart } from "react-icons/ti";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { sellMockupData } from "@/app/api/sell";
import { useRouter } from "next/navigation";
import ExploreHeader from "../headers/ExploreHeader";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { fetchItemInventoryData } from "@/app/api/itemInventoryData";

const ExplorePage = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [exploreItems, setExploreItems] = useState<any[]>([]);

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

  const memoizedFetchItemInventoryData = useCallback(async () => {
    if (!user?.id) {
      console.error("User ID is undefined");
      return;
    }

    try {
      const response = await fetchItemInventoryData(user.id);
      if (response?.error) {
        console.error(response.error);
      } else {
        setExploreItems(response?.data ?? []);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [user?.id, setExploreItems]);

  useEffect(() => {
    memoizedFetchItemInventoryData();
  }, [memoizedFetchItemInventoryData]);

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
    <>
      <ExploreHeader />
      <div className="main-container px-2 py-4">
        <div className="w-full flex overflow-x-auto md:mt-2 mb-2 gap-2">
          {tags.map((tag) => (
            <Chip
              key={tag}
              color={selectedTags.includes(tag) ? "primary" : "default"}
              className="cursor-pointer"
              onClick={() => toggleTagSelection(tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-3">
          {exploreItems.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <p className="text-gray-500">No items available</p>
            </div>
          ) : (
            exploreItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  return router.push(`explore/${item.item_id}`);
                }}
              >
                <Card className="rounded-md shadow-none">
                  <CardBody className="p-0 h-40 w-full">
                    <img
                      alt="Card background"
                      className="object-cover rounded-none w-full h-40 rounded-b-md"
                      src="https://nextui.org/images/hero-card-complete.jpeg"
                    />
                  </CardBody>
                  <CardFooter className="py-1 px-0 flex-col items-start rounded-none">
                    <div className="w-full flex justify-between">
                      <p className="font-semibold text-sm truncate">
                        {item.item_name}
                      </p>
                      <div className="flex gap-1">
                        <TiShoppingCart size={20} />
                        {/* <FaRegMoneyBillAlt size={20} /> */}
                      </div>
                    </div>
                    <h4 className="font-semibold text-medium">
                      PHP {item.item_price}
                    </h4>
                    <div className="flex gap-1">
                      <Avatar
                        src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                        className="w-4 h-4 text-xs"
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
      </div>
    </>
  );
};

export default ExplorePage;
