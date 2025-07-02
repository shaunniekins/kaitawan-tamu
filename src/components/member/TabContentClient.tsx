"use client";
import CartPage from "@/components/member/CartPage";
import ChatPage from "@/components/member/ChatPage";
import ExplorePage from "@/components/member/ExplorePage";
import LikesPage from "@/components/member/LikesPage";
import ListingPage from "@/components/member/ListingPage";
import ProfilePage from "@/components/member/ProfilePage";
import SellPage from "@/components/member/SellPage";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

export default function TabContentClient() {
  const path = usePathname();
  const searchParams = useSearchParams();
  const tag = searchParams.get("tags");

  let activeComponent;

  switch (path) {
    case "/member/explore":
      activeComponent = <ExplorePage tagParam={tag} />;
      break;
    case "/member/transaction":
      activeComponent = <CartPage />;
      break;
    case "/member/chat":
      activeComponent = <ChatPage />;
      break;
    case "/member/sell":
      activeComponent = <SellPage />;
      break;
    case "/member/listing":
      activeComponent = <ListingPage />;
      break;
    case "/member/account":
      activeComponent = <ProfilePage />;
      break;
    case "/member/likes":
      activeComponent = <LikesPage />;
      break;
    default:
      activeComponent = "hey";
  }

  return <>{activeComponent}</>;
}
