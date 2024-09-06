"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  MdOutlineAdd,
  MdOutlineShoppingCart,
  MdOutlineSearch,
  MdOutlineSell,
  MdOutlinePerson,
} from "react-icons/md";

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
    path: "/ident/member/cart",
    name: "Cart",
    Icon: MdOutlineShoppingCart,
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
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {navigationItems.map(({ path, name, Icon }) => (
            <button
              key={name}
              className={`bottom-navtab-buttons ${
                pathname === path ? "border-[#008B47] bg-green-50" : ""
              }`}
              onClick={() => {
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
