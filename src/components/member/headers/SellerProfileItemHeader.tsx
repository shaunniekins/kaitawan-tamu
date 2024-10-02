"use client";

import { SearchIcon } from "../../../../public/icons/SearchIcon";
import { Button, Input } from "@nextui-org/react";
import { FC, useState } from "react";
import { IoIosHeartEmpty } from "react-icons/io";
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from "next/navigation";

const SellerProfileItemHeader = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const router = useRouter();

  return (
    <header className="sticky lg:hidden top-0 bg-white py-2 px-2 md:px-0 w-full flex items-center justify-center shadow-md lg:shadow-none z-50">
      <div className="w-full max-w-6xl flex justify-between items-center">
        <button
          onClick={() => {
            router.back();
          }}
          className="p-0 ml-1 text-2xl text-gray-600"
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
                return router.push("/member/cart");
              }}
            >
              <IoIosHeartEmpty size={30} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SellerProfileItemHeader;
