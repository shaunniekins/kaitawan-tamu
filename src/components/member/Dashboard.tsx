// components/member/Dashboard.tsx:

"use client";

import { Button, Spinner } from "@nextui-org/react";
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
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import SellPage from "./pages/SellPage";
import ExploreHeader from "./headers/ExploreHeader";
import DefaultHeader from "./headers/Header";
import ListingPage from "./pages/ListingPage";

const navigationItems = [
  { name: "Explore", icon: MdOutlineSearch, component: ExplorePage },
  { name: "Cart", icon: MdOutlineShoppingCart, component: CartPage },
  { name: "Sell", icon: MdOutlineAdd, component: SellPage },
  { name: "Listing", icon: MdOutlineSell, component: ListingPage },
  { name: "Account", icon: MdOutlinePerson, component: ProfilePage },
];

const MemberComponent = () => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [currentViewPage, setCurrentViewPage] = useState<string>("Explore");

  const CurrentViewComponent =
    navigationItems.find((item) => item.name === currentViewPage)?.component ||
    ExplorePage;

  return (
    <>
      {isSigningOut && (
        <div className="box flex-col justify-center">
          <Spinner color="success" />
        </div>
      )}
    </>
  );
};
export default MemberComponent;
