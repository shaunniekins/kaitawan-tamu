// app/ident/member/signup/page.tsx:

import SignupComponent from "@/components/Signup";
import { signUp } from "@/utils/supabase/auth-functions";
import { headers } from "next/headers";

export default function MemberSignup() {
  return <SignupComponent headers={headers()} signUp={signUp} role="member" />;
}
