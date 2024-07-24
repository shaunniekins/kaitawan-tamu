// components/admin/pages/ListingPage.tsx
"use client";
import { sellMockupData } from "@/app/api/sell";
import ListingHeader from "../headers/ListingHeader";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ListingPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");

  const filteredData = sellMockupData.filter((item: any) =>
    activeTab === "active" ? item.status === "active" : item.status === "sold"
  );

  const renderItems = () => {
    if (filteredData.length === 0) {
      return (
        <div className="w-full col-span-full flex justify-center items-center h-full">
          <p className="text-gray-500">No items available</p>
        </div>
      );
    }

    return filteredData.map((item: any) => (
      <div key={item.id} onClick={() => router.push(`explore/${item.id}`)}>
        <Card className="rounded-md shadow-none">
          <CardBody className="p-0 h-40 w-full">
            <img
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
            </div>
            <h4 className="font-semibold text-medium">{item.productPrice}</h4>
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
