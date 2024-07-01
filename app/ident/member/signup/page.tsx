// app/ident/member/signup/page.tsx:

import SignupComponent from "@/components/Signup";
import { signUp } from "@/utils/supabase/auth-functions";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function MemberSignup() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !user?.user_metadata?.role?.includes("member")) {
    return redirect("/ident/admin");
  } else if (user) {
    return redirect("/ident/member");
  }

  return <SignupComponent headers={headers()} signUp={signUp} role="member" />;
}
