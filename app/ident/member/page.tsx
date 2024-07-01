// app/ident/member/page.tsx:

import MemberComponent from "@/components/member/Dashboard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminSignin() {
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

  return <MemberComponent />;
}
