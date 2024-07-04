// app/ident/member/[tab]/TabSection.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TabContent from "./TabContent";

export default async function TabSection() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/ident/member/signin");
  }

  if (user && !user?.user_metadata?.role?.includes("member")) {
    return redirect("/ident/admin/dashboard");
  }

  return <TabContent />;
}
