// app/ident/member/[tab]/[id]/page.tsx

import { sellMockupData } from "@/app/api/sell";
import ExploreItem from "@/components/admin/pages/ExploreItem";

interface Params {
  tab: string;
  id: string | number;
}

export default function TabList({ params }: { params: Params }) {
  const { tab, id } = params;

  if (tab === "explore") {
    const itemId = typeof id === "string" ? parseInt(id, 10) : id;
    const item = sellMockupData.find((item) => item.id === itemId);

    if (item) {
      return <ExploreItem {...item} />;
    } else {
      return <div>Item not found</div>;
    }
  }

  return <div>Invalid tab</div>;
}
