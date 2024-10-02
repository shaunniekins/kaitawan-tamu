import ExploreItem from "@/components/member/ExploreItem";
import SellerProfile from "@/components/member/SellerProfile";

interface Params {
  tab: string;
  id: number;
}

export default function TabList({ params }: { params: Params }) {
  const { tab, id } = params;

  if (tab === "explore") {
    const itemId = typeof id === "string" ? parseInt(id, 10) : id;

    if (itemId) {
      return <ExploreItem item_id={itemId} />;
    } else {
      return <div>Item not found</div>;
    }
  } else if (tab === "profile") {
    const userId = typeof id === "number" ? id.toString() : id;

    if (userId) {
      return <SellerProfile user_id={userId} />;
    } else {
      return <div>User not found</div>;
    }
  }

  return <div>Invalid tab</div>;
}
