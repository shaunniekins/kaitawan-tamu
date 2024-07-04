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
import ExploreHeader from "../admin/headers/ExploreHeader";
import DefaultHeader from "../admin/headers/Header";
import ListingPage from "../admin/pages/ListingPage";

const navigationItems = [
  { name: "Explore", icon: MdOutlineSearch, component: ExplorePage },
  { name: "Cart", icon: MdOutlineShoppingCart, component: CartPage },
  { name: "Sell", icon: MdOutlineAdd, component: SellPage },
  { name: "Listing", icon: MdOutlineSell, component: ListingPage },
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
      {isSigningOut && (
        <div className="box flex-col justify-center">
          <div>Signing out...</div>
        </div>
      )}
    </>
  );
};
export default MemberComponent;
