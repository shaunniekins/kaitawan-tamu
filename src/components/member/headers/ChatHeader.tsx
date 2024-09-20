// components/admin/headers/ChatHeader.tsx

"use client";

import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { IoIosClose } from "react-icons/io";

const ChatHeader = () => {
  const router = useRouter();

  return (
    <>
      <header className="bg-white py-2 px-2 md:px-0 w-full flex items-center justify-center shadow-md fixed inset-x-0 top-0 lg:top-10 z-50">
        {/* <div className="w-full max-w-6xl flex justify-center items-center py-[0.36rem]">
          <h1 className="font-bold text-lg">Messages</h1>
        </div> */}
        <div className="w-full max-w-6xl flex justify-between items-center">
          <button
            onClick={() => {
              return router.back();
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
              <Button />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default ChatHeader;
