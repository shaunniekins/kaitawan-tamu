// app/ident/member/[tab]/TabContent.tsx
"use client";

import CartPage from "@/components/admin/pages/CartPage";
import ExplorePage from "@/components/admin/pages/ExplorePage";
import ListingPage from "@/components/admin/pages/ListingPage";
import ProfilePage from "@/components/admin/pages/ProfilePage";
import SellPage from "@/components/admin/pages/SellPage";
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
