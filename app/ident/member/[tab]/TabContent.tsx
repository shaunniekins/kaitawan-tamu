// app/ident/member/[tab]/TabContent.tsx
"use client";

import CartPage from "@/components/member/pages/CartPage";
import ExplorePage from "@/components/member/pages/ExplorePage";
import ListingPage from "@/components/member/pages/ListingPage";
import ProfilePage from "@/components/member/pages/ProfilePage";
import SellPage from "@/components/member/pages/SellPage";
import { usePathname } from "next/navigation";

export default function TabContent() {
  const path = usePathname();

  let activeComponent;

  switch (path) {
    case "/ident/member/explore":
      activeComponent = <ExplorePage />;
      break;
    case "/ident/member/transaction":
      activeComponent = <CartPage />;
      break;
    case "/ident/member/sell":
      activeComponent = <SellPage />;
      break;
    case "/ident/member/listing":
      activeComponent = <ListingPage />;
      break;
    case "/ident/member/account":
      activeComponent = <ProfilePage />;
      break;
    default:
      activeComponent = null;
  }

  return <div>{activeComponent}</div>;
}
