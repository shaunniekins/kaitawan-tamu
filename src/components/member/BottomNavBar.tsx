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
import { useEffect, useState } from "react";
import { FaComments } from "react-icons/fa";

interface NavigationItem {
  path: string;
  name: string;
  Icon: React.ElementType;
}

const navigationItems: NavigationItem[] = [
  {
    path: "/member/explore",
    name: "Explore",
    Icon: MdOutlineSearch,
  },
  {
    path: "/member/transaction",
    name: "Transaction",
    Icon: GrTransaction,
  },
  {
    path: "/member/chat",
    name: "Chat",
    Icon: FaComments,
  },
  {
    path: "/member/sell",
    name: "Sell",
    Icon: MdOutlineAdd,
  },
  {
    path: "/member/listing",
    name: "Listing",
    Icon: MdOutlineSell,
  },
  {
    path: "/member/account",
    name: "Account",
    Icon: MdOutlinePerson,
  },
];

// Function to check if the current pathname matches any base path with an additional segment
const shouldHideBottomBar = (pathname: string, isLargeScreen: boolean) => {
  // Directly return true if the current pathname is exactly "/member/sell" and screen size is less than lg
  if (pathname === "/member/sell" && !isLargeScreen) {
    return true;
  }

  if (pathname === "/member/chat" && !isLargeScreen) {
    return true;
  }

  // Check if pathname matches "/basepath/anySegment"
  return navigationItems.some(({ path }) => {
    const regex = new RegExp(`^${path}/[^/]+$`);
    return regex.test(pathname);
  });
};

const BottomNavBarComponent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // Tailwind's lg breakpoint is 1024px
    };

    handleResize(); // Check initial screen size
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Hide the component if the current route matches the specified pattern and screen size is less than lg
  if (shouldHideBottomBar(pathname, isLargeScreen)) {
    return null;
  }

  return (
    <>
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner color="success" />
        </div>
      )}
      {/* web */}
      <div className="hidden h-10 lg:block fixed inset-x-0 top-0 z-50 bg-white shadow-lg lg:shadow-none">
        <div className="max-w-6xl mx-auto w-full flex justify-center items-center">
          <div className="w-full max-w-md ml-auto flex justify-center items-center">
            {navigationItems.map(({ path, name }) => (
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
                <span
                  className={`${pathname === path ? "text-[#008B47]" : ""}`}
                >
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* mobile */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {navigationItems
            .filter(({ name }) => name !== "Chat") // Exclude Chat
            .map(({ path, name, Icon }) => (
              <button
                key={name}
                className={`bottom-navtab-buttons ${
                  pathname === path ? "border-[#008B47] bg-green-50" : ""
                } ${path === "/member/sell" ? "hidden lg:flex" : ""}`}
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
                <span
                  className={`${pathname === path ? "text-[#008B47]" : ""}`}
                >
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
