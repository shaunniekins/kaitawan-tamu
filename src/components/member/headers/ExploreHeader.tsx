"use client";

import { SearchIcon } from "../../../../public/icons/SearchIcon";
import { Button, Input } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { IoIosHeartEmpty, IoIosNotificationsOutline } from "react-icons/io";
import { IoChatboxOutline, IoChevronBack } from "react-icons/io5";

const ExploreHeader = () => {
  const router = useRouter();
  const path = usePathname();

  return (
    <header className="sticky top-0 py-2 px-2 w-full flex items-center justify-center shadow-md lg:shadow-none z-50">
      <div className="w-full max-w-6xl h-12 flex justify-between items-center">
        {/* original [logo, heart, chat] */}
        <Link
          href="/member/explore"
          className={`${
            path !== "/member/explore" && "hidden"
          } flex items-center text-2xl font-bold mr-2 lg:mr-3`}
        >
          <Image
            src="/images/asscat-logo.jpeg"
            alt="Kaitawan Tamu Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
        </Link>

        <button
          onClick={() => {
            router.back();
          }}
          className={`${
            !path.startsWith("/member/explore/") &&
            !path.startsWith("/member/profile/") &&
            !path.startsWith("/member/likes") &&
            "hidden"
          } p-0 ml-1 text-2xl text-gray-600`}
        >
          <IoChevronBack />
        </button>

        <h1
          className={`
          ${path !== "/member/likes" && "hidden"}
          font-bold text-lg pl-2`}
        >
          My Likes
        </h1>

        <h1
          className={`
          ${path !== "/member/transaction" && "hidden"}
          font-bold text-lg pl-2`}
        >
          Transaction
        </h1>

        <h1
          className={`
          ${path !== "/member/listing" && "hidden"}
          font-bold text-lg pl-2`}
        >
          My Listing
        </h1>

        <div className="flex flex-col justify-end items-end">
          <div className="flex items-center gap-1">
            {/* <Button
              isIconOnly
              variant="light"
              disableAnimation
              radius="sm"
              className="p-0 m-0"
              onClick={() => {}}
            >
              <IoIosNotificationsOutline size={30} />
            </Button> */}
            <Button
              isIconOnly
              variant="light"
              disableAnimation
              radius="sm"
              className="p-0 m-0 lg:hidden"
              onClick={() => {
                router.push("/member/likes");
              }}
            >
              <IoIosHeartEmpty size={25} />
            </Button>
            <Button
              isIconOnly
              variant="light"
              disableAnimation
              radius="sm"
              className="p-0 m-0 lg:hidden"
              onClick={() => {
                router.push("/member/chat");
              }}
            >
              <IoChatboxOutline size={25} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExploreHeader;
