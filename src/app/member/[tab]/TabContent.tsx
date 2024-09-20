"use client";

import CartPage from "@/components/member/pages/CartPage";
import ChatPage from "@/components/member/pages/ChatPage";
import ExplorePage from "@/components/member/pages/ExplorePage";
import ListingPage from "@/components/member/pages/ListingPage";
import ProfilePage from "@/components/member/pages/ProfilePage";
import SellPage from "@/components/member/pages/SellPage";
import { usePathname } from "next/navigation";

export default function TabContent() {
  const path = usePathname();

  let activeComponent;

  switch (path) {
    case "/member/explore":
      activeComponent = <ExplorePage />;
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
    default:
      activeComponent = null;
  }

  return <div>{activeComponent}</div>;
}
