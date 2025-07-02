import ExploreItem from "@/components/member/ExploreItem";
import SellerProfile from "@/components/member/SellerProfile";

interface Params {
  tab: string;
  id: string;
}

// Generate static params for known routes
export async function generateStaticParams() {
  // You can expand this list based on your actual data
  const paths = [];

  // Add some common explore item IDs (you'd get these from your database)
  for (let i = 1; i <= 10; i++) {
    paths.push({ tab: "explore", id: i.toString() });
  }

  // Add some common profile IDs
  for (let i = 1; i <= 5; i++) {
    paths.push({ tab: "profile", id: i.toString() });
  }

  return paths;
}

export default function TabList({ params }: { params: Params }) {
  const { tab, id } = params;

  if (tab === "explore") {
    const itemId = parseInt(id, 10);

    if (!isNaN(itemId)) {
      return <ExploreItem item_id={itemId} />;
    } else {
      return <div>Item not found</div>;
    }
  } else if (tab === "profile") {
    const userId = id;

    if (userId) {
      return <SellerProfile user_id={userId} />;
    } else {
      return <div>User not found</div>;
    }
  }

  return <div>Invalid tab</div>;
}
