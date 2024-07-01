// components/member/Dashboard.tsx:

"use client";

import { Button } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineLogout } from "react-icons/md";
import { useEffect, useState } from "react";
import { signOutMember } from "@/utils/supabase-functions/signOut";

const MemberComponent = () => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  return (
    <>
      {isSigningOut ? (
        <div className="box flex-col">
          <div>Signing out...</div>
        </div>
      ) : (
        <div className="box flex-col">
          <header className="bg-white p-4 w-full flex items-center justify-center shadow-sm">
            <div className="w-full max-w-4xl flex justify-between items-center">
              <Link
                href="/ident/member"
                className="flex items-center text-2xl font-bold">
                <Image
                  src="/images/logo.svg"
                  alt="Kaitawan Tamu Logo"
                  width={45}
                  height={45}
                  className="rounded-full"
                />
                <span className="ml-2">Kaitawan Tamu</span>
              </Link>

              <div className="flex flex-col justify-end items-end">
                <div className="flex items-center gap-4">
                  <Button
                    isIconOnly
                    radius="sm"
                    onClick={() => {
                      setIsSigningOut(true);
                      signOutMember();
                    }}>
                    <MdOutlineLogout />
                  </Button>
                </div>
              </div>
            </div>
          </header>
          <div className="h-full w-full p-4 flex ">
            <div className="flex justify-center items-start w-full">
              <div className="max-w-4xl w-full flex justify-center items-center">
                <div>hello</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default MemberComponent;
