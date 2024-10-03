"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  MdOutlineAdd,
  MdOutlineSearch,
  MdOutlineSell,
  MdOutlinePerson,
} from "react-icons/md";

import { GrTransaction } from "react-icons/gr";
import { useEffect, useState } from "react";
import { FaComments } from "react-icons/fa";
import ExploreHeader from "@/components/member/headers/ExploreHeader";
import { Button } from "@nextui-org/react";
import { RiRobot2Line } from "react-icons/ri";

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

// // Function to check if the current pathname matches any base path with an additional segment
// const shouldHideBottomBar = (pathname: string, isLargeScreen: boolean) => {
//   // Directly return true if the current pathname is exactly "/member/sell" and screen size is less than lg
//   if (pathname === "/member/sell" && !isLargeScreen) {
//     return true;
//   }

//   if (pathname === "/member/chat" && !isLargeScreen) {
//     return true;
//   }

//   // Check if pathname matches "/basepath/anySegment"
//   return navigationItems.some(({ path }) => {
//     const regex = new RegExp(`^${path}/[^/]+$`);
//     return regex.test(pathname);
//   });
// };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  // if (shouldHideBottomBar(pathname, isLargeScreen)) {
  //   return null;
  // }

  return (
    <section className="h-[100svh] w-screen overflow-hidden">
      <div
        //   ${pathname === "/member/chat" ? "mb-0" : "mb-16"}
        className={`h-full w-full flex flex-col justify-center items-center`}
      >
        {isLargeScreen && (
          <div className="h-10 w-full z-50">
            {WebNavBar(navigationItems, pathname, setIsLoading, router)}
          </div>
        )}
        <div
          className={`${
            isLargeScreen && "max-w-4xl mx-auto"
          } flex-grow h-full w-full`}
        >
          <div
            className={`${
              (isLargeScreen ||
                pathname === "/member/account" ||
                pathname === "/member/sell" ||
                pathname === "/member/chat") &&
              // && pathname !== "/member/explore"
              "hidden"
            }`}
          >
            <ExploreHeader />
          </div>
          <div className="flex-grow h-full w-full overflow-auto">
            {children}
          </div>
        </div>
        {!isLargeScreen && (
          <div
            className={`${
              (pathname === "/member/sell" ||
                pathname.startsWith("/member/explore/")) &&
              "hidden"
            } h-16 w-full z-50 shadow-lg`}
          >
            {MobileNavBar(navigationItems, pathname, setIsLoading, router)}
          </div>
        )}
        <footer
          className={`${
            pathname === "/member/chat" ? "hidden" : "hidden lg:block"
          } w-full text-center text-xs py-2 bg-[#008B47] text-white`}
        >
          All rights reserved to Kaitawan Tamu ({new Date().getFullYear()})
        </footer>
      </div>
    </section>
  );
}

const WebNavBar = (
  navigationItems: NavigationItem[],
  pathname: string,
  setIsLoading: (value: boolean) => void,
  router: any
) => {
  return (
    <div className="max-w-3xl mx-auto w-full flex">
      <div className="w-full max-w-md ml-auto flex">
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
            <span className={`${pathname === path ? "text-[#008B47]" : ""}`}>
              {name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const MobileNavBar = (
  navigationItems: NavigationItem[],
  pathname: string,
  setIsLoading: (value: boolean) => void,
  router: any
) => {
  return (
    <div className="max-w-6xl mx-auto flex justify-between items-center bg-white">
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
            <span className={`${pathname === path ? "text-[#008B47]" : ""}`}>
              {name}
            </span>
          </button>
        ))}
    </div>
  );
};
