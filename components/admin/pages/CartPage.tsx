// components/admin/pages/CartPage.tsx

"use client";

import CartHeader from "../headers/CartHeader";
import { sellMockupData } from "@/app/api/sell";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardFooter,
  Avatar,
  Checkbox,
  Button,
} from "@nextui-org/react";

const CartPage = () => {
  const router = useRouter();

  return (
    <>
      <CartHeader />
      <div className="main-container justify-start">
        <div className="product-details-container overflow-x-hidden">
          <div className="w-full flex flex-col gap-4 pt-3 pb-24 mt-3">
            {sellMockupData.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`explore/${item.id}`)}
              >
                <Card className="rounded-none shadow-none">
                  <CardBody className="w-full bg-gray-100 flex flex-row gap-2 border-y">
                    <Checkbox />
                    <img
                      alt="Card background"
                      className="object-cover rounded w-24 h-24"
                      src={item.imageUrl}
                    />
                    <div className="w-full h-24 flex flex-col justify-around items-stretch">
                      <p className="font-semibold text-sm truncate">
                        {item.productName}
                      </p>
                      <h4 className="font-semibold text-medium">
                        {item.productPrice}
                      </h4>
                      <div className="flex gap-1">
                        <Avatar
                          src={item.sellerAvatar}
                          className="w-4 h-4 text-xs"
                        />
                        <h6 className="text-xs truncate">{item.sellerName}</h6>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* footer */}
      <div className="fixed inset-x-0 bottom-16 z-50 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-around items-center gap-5 px-2 border-t py-3">
          <div className="w-full flex gap-2">
            <div className="w-full flex justify-between items-center">
              <p className="text-small">Total</p>
              <h1 className="text-red-600">₱0.00</h1>
            </div>
            <Button
              variant="solid"
              radius="sm"
              color="danger"
              onClick={() => {}}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
