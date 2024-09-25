"use client";

import { Button } from "@nextui-org/react";
import { IoIosClose } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

const SellHeader = () => {
  const router = useRouter();

  return (
    <header className="sticky lg:hidden top-0 bg-white py-2 px-2 md:px-0 w-full flex items-center justify-center shadow-md lg:shadow-none z-50">
      <div className="w-full max-w-6xl flex justify-between items-center">
        <button
          onClick={() => {
            return router.push("/member/explore");
          }}
          className="p-0 ml-1 text-4xl text-gray-600"
        >
          <IoIosClose />
        </button>
        <h1 className="font-bold text-lg">List item</h1>

        <div className="flex flex-col justify-end items-end invisible">
          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              variant="light"
              disableAnimation
              radius="sm"
              className="p-0 m-0"
              onClick={() => router.push("/member/cart")}
            >
              <IoCartOutline size={30} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SellHeader;
