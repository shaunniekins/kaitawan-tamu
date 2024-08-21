// components/admin/headers/ExploreItemHeader.tsx

"use client";

import { SearchIcon } from "@/public/icons/SearchIcon";
import { Button, Input } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import {
  IoCartOutline,
  IoChatboxOutline,
  IoChevronBack,
} from "react-icons/io5";
import { useRouter } from "next/navigation";

const ExploreItemHeader = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const router = useRouter();

  return (
    <>
      <header className="bg-white py-2 px-2 md:px-0 w-full flex items-center justify-center shadow-md fixed inset-x-0 top-0 z-50">
        <div className="w-full max-w-4xl flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="p-0 ml-1 mr-2 text-2xl text-gray-600"
            // variant="light"
            //  size="lg"
          >
            <IoChevronBack />
          </button>
          <Input
            isClearable
            onClear={() => setSearchValue("")}
            radius="lg"
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            placeholder="Search"
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setCurrentPage(1);
              setSearchValue(e.target.value);
            }}
            startContent={
              <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
            }
          />

          <div className="flex flex-col justify-end items-end">
            <div className="flex items-center gap-1">
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
                <IoCartOutline size={30} />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default ExploreItemHeader;
