// page1.tsx
import TabContentClient from "@/components/member/TabContentClient";

// Generate static params for all possible tab routes
export async function generateStaticParams() {
  return [
    { tab: "explore" },
    { tab: "transaction" },
    { tab: "chat" },
    { tab: "sell" },
    { tab: "listing" },
    { tab: "account" },
    { tab: "likes" },
  ];
}

// Server component
export default function TabContent() {
  return <TabContentClient />;
}
