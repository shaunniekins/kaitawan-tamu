// components/admin/headers/CartHeader.tsx

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
import { AiOutlineDelete } from "react-icons/ai";
import { useRouter } from "next/navigation";

const CartHeader = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const router = useRouter();

  return (
    <>
      <header className="bg-white py-2 px-2 md:px-0 w-full flex items-center justify-center shadow-md fixed inset-x-0 top-0 z-50">
        <div className="w-full max-w-4xl flex justify-between items-center">
          <h1 className="font-bold text-xl ml-1">My Cart</h1>
          <Button
            isIconOnly
            variant="light"
            disableAnimation
            radius="sm"
            className="p-0 m-0"
            onClick={() => {
              return router.push("/ident/member/cart");
            }}
          >
            <AiOutlineDelete size={30} />
          </Button>
        </div>
      </header>
    </>
  );
};

export default CartHeader;
