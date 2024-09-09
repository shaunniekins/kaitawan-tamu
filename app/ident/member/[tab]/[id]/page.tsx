// app/ident/member/[tab]/[id]/page.tsx

import { sellMockupData } from "@/app/api/sell";
import ExploreItem from "@/components/member/pages/ExploreItem";

interface Params {
  tab: string;
  id: number;
}

export default function TabList({ params }: { params: Params }) {
  const { tab, id } = params;

  if (tab === "explore") {
    const itemId = typeof id === "string" ? parseInt(id, 10) : id;
    // const item = sellMockupData.find((item) => item.id === itemId);

    if (itemId) {
      return <ExploreItem item_id={itemId} />;
    } else {
      return <div>Item not found</div>;
    }
  }

  return <div>Invalid tab</div>;
}

// export default function TabList({ params }: { params: Params }) {
//   const { tab, id } = params;

//   if (tab === "explore") {
//     if (id) {
//       console.log("id", id);
//       console.log("id type", typeof id);
//       return <ExploreItem item_id={id} />;
//     } else {
//       return <div>Item not found</div>;
//     }
//   }

//   return <div>Invalid tab</div>;
// }