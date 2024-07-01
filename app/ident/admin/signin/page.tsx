// app/ident/admin/signin/page.tsx:

import SigninComponent from "@/components/Signin";
import { signIn } from "@/utils/supabase/auth-functions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminSignin() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && user?.user_metadata?.role?.includes("member")) {
    return redirect("/ident/member");
  } else if (user) {
    return redirect("/ident/admin");
  }

  return <SigninComponent signIn={signIn} role="admin" />;
}
