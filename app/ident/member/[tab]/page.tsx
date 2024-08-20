// app/ident/member/[tab]/page.tsx

import TabContent from "./TabContent";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Tabs() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !user?.user_metadata?.role?.includes("member")) {
    return redirect("/ident/admin");
  } else if (user && user?.user_metadata?.role?.includes("member")) {
    return <TabContent />;
  } else {
    return redirect("/ident/member/signin");
  }
}
