"use client";
import CartPage from "@/components/member/CartPage";
import ChatPage from "@/components/member/ChatPage";
import ExplorePage from "@/components/member/ExplorePage";
import ListingPage from "@/components/member/ListingPage";
import ProfilePage from "@/components/member/ProfilePage";
import SellPage from "@/components/member/SellPage";
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
      //   activeComponent = <div>CartPage</div>;
      break;
    case "/member/chat":
      activeComponent = <ChatPage />;
      //   activeComponent = <div>ChatPage</div>;
      break;
    case "/member/sell":
      activeComponent = <SellPage />;
      //   activeComponent = <div>SellPage</div>;
      break;
    case "/member/listing":
      activeComponent = <ListingPage />;
      //   activeComponent = <div>ListingPage</div>;
      break;
    case "/member/account":
      activeComponent = <ProfilePage />;
      //   activeComponent = <div>ProfilePage</div>;
      break;
    default:
      activeComponent = 'hey';
  }

  return <>{activeComponent}</>;
}
