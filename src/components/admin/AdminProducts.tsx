"use client";

import {
  SelectItem,
  Select,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Image,
  Avatar,
  Pagination,
} from "@nextui-org/react";
import React from "react";
import { useState, useEffect } from "react";
import useItemInventory from "@/hooks/useItemInventory";
import { updateItemInventoryData } from "@/app/api/itemInventoryIUD";

const AdminProductsComponent = () => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 9;

  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [openSpecificItemModal, setOpenSpecificItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [productListingFilter, setProductListingFilter] = useState("pending");

  const { items, loadingItems, totalItems } = useItemInventory(
    rowsPerPage,
    page,
    productListingFilter,
    true,
    undefined,
    undefined,
    undefined
  );

  const totalPages = Math.ceil(totalItems / rowsPerPage);

  useEffect(() => {
    // console.log(items);
    setPendingItems(items);
  }, [items]);

  useEffect(() => {
    if (!openSpecificItemModal) {
      setSelectedItem(null);
    }
  }, [openSpecificItemModal]);

  const handleItemStatusUpdate = async (itemId: number, newStatus: string) => {
    const data = { item_status: newStatus };
    await updateItemInventoryData(data, itemId);
    setOpenSpecificItemModal(false);
    setSelectedItem(null);
  };

  const getDisplayImageUrl = (imageUrls: any[]) => {
    if (!imageUrls || imageUrls.length === 0) {
      return "https://fakeimg.pl/500x500?text=img&font=bebas";
    }

    // Find the first non-video URL
    const firstImageUrl = imageUrls.find((img) => {
      const url = img.url.toLowerCase();
      return (
        !url.endsWith(".mp4") && !url.endsWith(".mov") && !url.endsWith(".avi")
      );
    });

    // If found, return it; otherwise return the default image
    return firstImageUrl
      ? firstImageUrl.url
      : "https://fakeimg.pl/500x500?text=img&font=bebas";
  };

  return (
    <>
      <Modal
        backdrop="blur"
        isOpen={openSpecificItemModal}
        onOpenChange={setOpenSpecificItemModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Item Posted
              </ModalHeader>
              <ModalBody>
                <div className="flex gap-2">
                  <div className="w-56 h-56">
                    <Image
                      alt="Product Image"
                      className="w-full h-full object-cover"
                      src={
                        loadingItems
                          ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                          : getDisplayImageUrl(selectedItem?.image_urls)
                      }
                    />
                  </div>
                  <div className="truncate">
                    <h6 className="truncate font-semibold">
                      {selectedItem.item_name}
                    </h6>
                    <h6 className="truncate text-xs">
                      {selectedItem.item_category}
                    </h6>
                    <h6 className="truncate text-sm">
                      {selectedItem.item_condition}
                    </h6>
                    <h6 className="truncate font-mono text-lg font-semibold mt-2">
                      PHP{selectedItem.item_price}
                    </h6>

                    <div className="flex gap-1">
                      <Avatar
                        src={selectedItem.seller_profile_picture}
                        className="w-4 h-4 text-xs"
                        disableAnimation
                      />
                      <h6 className="text-xs truncate">
                        {selectedItem.seller_first_name}{" "}
                        {selectedItem.seller_last_name}
                      </h6>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h6 className="font-semibold">Description:</h6>
                  <h6 className="text-justify text-sm">
                    {selectedItem.item_description}
                  </h6>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  className={`${
                    selectedItem.item_status !== "pending" && "hidden"
                  }`}
                  onClick={() =>
                    handleItemStatusUpdate(selectedItem.item_id, "rejected")
                  }
                >
                  Reject
                </Button>
                <Button
                  color="primary"
                  className={`${
                    selectedItem.item_status !== "pending" && "hidden"
                  }`}
                  onClick={() =>
                    handleItemStatusUpdate(selectedItem.item_id, "approved")
                  }
                >
                  Approve Item
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="w-full flex justify-start flex-col overflow-y-auto p-4 bg-gray-100">
        <div className="w-full flex justify-between items-center mb-4">
          <Pagination
            isCompact
            showControls
            showShadow
            color="default"
            page={page}
            total={totalPages}
            onChange={(newPage) => setPage(newPage)}
          />
          <Select
            label="Filter"
            disallowEmptySelection={true}
            size="sm"
            color="default"
            variant="underlined"
            className="max-w-40 mb-2"
            defaultSelectedKeys={["pending"]}
            value={productListingFilter}
            onChange={(e) => {
              setProductListingFilter(e.target.value);
            }}
          >
            <SelectItem key={"pending"}>Pending</SelectItem>
            <SelectItem key={"approved"}>Approved</SelectItem>
            <SelectItem key={"sold"}>Sold</SelectItem>
            <SelectItem key={"rejected"}>Rejected</SelectItem>
          </Select>
        </div>
        {pendingItems.length === 0 ? (
          <div className="w-full h-[75%] flex items-center justify-center bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No items available</p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingItems.map((item, index) => (
              <Card
                key={index}
                className="rounded-md shadow-md w-full bg-white"
              >
                <CardBody className="w-full">
                  <div className="p-0 w-full flex justify-between">
                    <div className="flex gap-2 overflow-hidden">
                      <div className="h-32 w-32">
                        <Image
                          alt="Card background"
                          className="w-full h-full object-cover"
                          src={getDisplayImageUrl(item.image_urls)}
                        />
                      </div>
                      <div className="truncate">
                        <h6 className="truncate font-semibold">
                          {item.item_name}
                        </h6>
                        <h6 className="truncate text-xs">
                          {item.item_category}
                        </h6>
                        <h6 className="truncate text-sm">
                          {item.item_condition}
                        </h6>
                        <h6 className="truncate font-mono text-lg font-semibold mt-2">
                          PHP{item.item_price}
                        </h6>

                        <div className="flex gap-1">
                          <Avatar
                            src={item.seller_profile_picture}
                            className="w-4 h-4 text-xs"
                            disableAnimation
                          />
                          <h6 className="text-xs truncate">
                            {item.seller_first_name} {item.seller_last_name}
                          </h6>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        color="success"
                        onPress={() => {
                          setSelectedItem(item);
                          setOpenSpecificItemModal(true);
                        }}
                      >
                        Open
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        className={`${
                          item.item_status !== "pending" && "hidden"
                        }`}
                        onClick={() =>
                          handleItemStatusUpdate(item.item_id, "approved")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        className={`${
                          item.item_status !== "pending" && "hidden"
                        }`}
                        onClick={() =>
                          handleItemStatusUpdate(item.item_id, "rejected")
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProductsComponent;
