// components/member/Dashboard.tsx:

"use client";

import { Button } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import {
  MdOutlineAdd,
  MdOutlineLogout,
  MdOutlinePerson,
  MdOutlinePersonOff,
  MdOutlineSearch,
  MdOutlineSell,
  MdOutlineShoppingCart,
  MdOutlineVerifiedUser,
} from "react-icons/md";
import { useEffect, useState } from "react";
import { signOutMember } from "@/utils/supabase-functions/signOut";
import ExplorePage from "../admin/pages/ExplorePage";
import ProfilePage from "../admin/pages/ProfilePage";
import CartPage from "../admin/pages/CartPage";
import SellPage from "../admin/pages/SellPage";

const navigationItems = [
  { name: "Explore", icon: MdOutlineSearch, component: ExplorePage },
  { name: "Cart", icon: MdOutlineShoppingCart, component: CartPage },
  { name: "Sell", icon: MdOutlineAdd, component: SellPage },
  { name: "Listing", icon: MdOutlineSell, component: SellPage },
  { name: "Profile", icon: MdOutlinePerson, component: ProfilePage },
];

const MemberComponent = () => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [currentViewPage, setCurrentViewPage] = useState<string>("Explore");

  const CurrentViewComponent =
    navigationItems.find((item) => item.name === currentViewPage)?.component ||
    ExplorePage;

  return (
    <>
      {isSigningOut ? (
        <div className="box flex-col justify-center">
          <div>Signing out...</div>
        </div>
      ) : (
        <div className="box flex-col overflow-x-hidden">
          <header className="bg-white p-4 w-full flex items-center justify-center shadow-md fixed inset-x-0 top-0 z-50">
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
          <div className="h-full w-full p-4 overflow-x-hidden my-20">
            <div className="flex justify-center items-start w-full h-full overflow-x-hidden">
              <CurrentViewComponent />
            </div>
          </div>
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              {navigationItems.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  className={`bottom-tab-buttons ${
                    currentViewPage === name ? "border-blue-700 bg-blue-50" : ""
                  }`}
                  onClick={() => setCurrentViewPage(name)}>
                  <Icon
                    size={25}
                    className={`${
                      name !== "Sell" && currentViewPage === name
                        ? "text-blue-700"
                        : ""
                    } ${
                      name === "Sell" && "bg-blue-500 text-white rounded-lg"
                    }`}
                  />
                  <span
                    className={`${
                      currentViewPage === name ? "text-blue-700" : ""
                    }`}>
                    {name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default MemberComponent;
