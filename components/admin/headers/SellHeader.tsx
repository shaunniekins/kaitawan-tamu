// components/admin/headers/SellHeader.tsx

"use client";

import { SearchIcon } from "@/public/icons/SearchIcon";
import { Button, Input } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IoIosClose, IoIosNotificationsOutline } from "react-icons/io";
import {
  IoCartOutline,
  IoChatboxOutline,
  IoChevronBack,
} from "react-icons/io5";
import { useRouter } from "next/navigation";

const SellHeader = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const router = useRouter();

  return (
    <>
      <header className="bg-white py-2 px-2 md:px-0 w-full flex items-center justify-center shadow-md fixed inset-x-0 top-0 z-50">
        <div className="w-full max-w-4xl flex justify-between items-center">
          <button
            onClick={() => {
              return router.push("/ident/member/explore");
            }}
            className="p-0 ml-1 text-4xl text-gray-600"
            // variant="light"
            //  size="lg"
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
                onClick={() => router.push("/ident/member/cart")}
              >
                <IoCartOutline size={30} />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default SellHeader;
