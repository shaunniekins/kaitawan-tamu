// app/ident/admin/page.tsx:

import AdminDashboardComponent from "@/components/admin/AdminDashboard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminSignin() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/ident/admin/signin");
  }

  if (user && user?.user_metadata?.role?.includes("member")) {
    return redirect("/ident/member");
  }

  return <AdminDashboardComponent />;
}
