// components/admin/pages/ListingPage.tsx
"use client";
import { sellMockupData } from "@/app/api/sell";
import ListingHeader from "../headers/ListingHeader";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  CardFooter,
  Avatar,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  fetchActiveListingData,
  fetchSoldListingData,
} from "@/app/api/listingsData";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

const ListingPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [user, setUser] = useState<User | null>(null);
  const [activeItems, setActiveItems] = useState<any[]>([]);
  const [soldItems, setSoldItems] = useState<any[]>([]);

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

  const memoizedFetchActiveListingData = useCallback(async () => {
    if (!user?.id) {
      console.error("User ID is undefined");
      return;
    }

    try {
      const response = await fetchActiveListingData(user.id);
      if (response?.error) {
        console.error(response.error);
      } else {
        setActiveItems(response?.data ?? []);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [user?.id, setActiveItems]);

  const memoizedFetchSoldListingData = useCallback(async () => {
    if (!user?.id) {
      console.error("User ID is undefined");
      return;
    }

    try {
      const response = await fetchSoldListingData(user.id);
      if (response?.error) {
        console.error(response.error);
      } else {
        setSoldItems(response?.data ?? []);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [user?.id, setSoldItems]);

  useEffect(() => {
    memoizedFetchActiveListingData();
    memoizedFetchSoldListingData();
  }, [memoizedFetchActiveListingData, memoizedFetchSoldListingData]);

  const filteredData = activeTab === "active" ? activeItems : soldItems;

  const renderItems = () => {
    if (filteredData.length === 0) {
      return (
        <div className="w-full col-span-full flex justify-center items-center h-full">
          <p className="text-gray-500">No items available</p>
        </div>
      );
    }

    return filteredData.map((item: any) => (
      <div
        key={item.id}
        onClick={() => {
          return router.push(`explore/${item.id}`);
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
              <p className="font-semibold text-sm truncate">{item.item_name}</p>
            </div>
            <h4 className="font-semibold text-medium">{item.item_price}</h4>
          </CardFooter>
        </Card>
      </div>
    ));
  };

  const tabs = [
    { id: "active", label: "Active" },
    { id: "sold", label: "Sold" },
  ];

  return (
    <>
      <ListingHeader />
      <div className="main-container justify-start">
        <div className="product-details-container overflow-x-hidden">
          <div className="w-full flex-col px-2">
            <div className="w-full flex flex-col mt-3">
              <Tabs
                aria-label="Dynamic tabs"
                items={tabs}
                color="primary"
                variant="underlined"
                fullWidth
                selectedKey={activeTab}
                radius="none"
                onSelectionChange={(key) => setActiveTab(key.toString())}
              >
                {(item) => (
                  <Tab key={item.id} title={item.label}>
                    <Card className="rounded-none bg-none shadow-none">
                      <CardBody className="w-full grid grid-cols-2 md:grid-cols-5 gap-3 p-0">
                        {renderItems()}
                      </CardBody>
                    </Card>
                  </Tab>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingPage;
