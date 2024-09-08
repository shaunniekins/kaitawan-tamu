"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  MdOutlineAdd,
  MdOutlineShoppingCart,
  MdOutlineSearch,
  MdOutlineSell,
  MdOutlinePerson,
} from "react-icons/md";

import { GrTransaction } from "react-icons/gr";
import { Spinner } from "@nextui-org/react";
import { useState } from "react";

interface NavigationItem {
  path: string;
  name: string;
  Icon: React.ElementType;
}

const navigationItems: NavigationItem[] = [
  {
    path: "/ident/member/explore",
    name: "Explore",
    Icon: MdOutlineSearch,
  },
  {
    path: "/ident/member/transaction",
    name: "Transaction",
    Icon: GrTransaction,
  },
  {
    path: "/ident/member/sell",
    name: "Sell",
    Icon: MdOutlineAdd,
  },
  {
    path: "/ident/member/listing",
    name: "Listing",
    Icon: MdOutlineSell,
  },
  {
    path: "/ident/member/account",
    name: "Account",
    Icon: MdOutlinePerson,
  },
];

const BottomNavBarComponent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // Function to check if the current pathname matches any base path with an additional segment
  const shouldHideBottomBar = () => {
    // Directly return true if the current pathname is exactly "/ident/member/sell"
    if (pathname === "/ident/member/sell") {
      return true;
    }

    // Check if pathname matches "/basepath/anySegment"
    return navigationItems.some(({ path }) => {
      const regex = new RegExp(`^${path}/[^/]+$`);
      return regex.test(pathname);
    });
  };

  // Hide the component if the current route matches the specified pattern
  if (shouldHideBottomBar()) {
    return null;
  }

  return (
    <>
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner color="success" />
        </div>
      )}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {navigationItems.map(({ path, name, Icon }) => (
            <button
              key={name}
              className={`bottom-navtab-buttons ${
                pathname === path ? "border-[#008B47] bg-green-50" : ""
              }`}
              onClick={() => {
                if (pathname.includes(path)) return;
                setIsLoading(true);
                return router.push(path);
              }}
            >
              <Icon
                size={25}
                className={`${
                  name !== "Sell" && pathname === path ? "text-[#008B47]" : ""
                } ${name === "Sell" && "bg-[#008B47] text-white rounded-lg"}`}
              />
              <span className={`${pathname === path ? "text-[#008B47]" : ""}`}>
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default BottomNavBarComponent;
