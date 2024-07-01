// utils/supabase/auth-functions.ts

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  signOutAdminNoRedirect,
  signOutMember,
} from "../supabase-functions/signOut";

export const signIn = async (role: string, formData: FormData) => {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  

  if (error) {
    return redirect("/ident/member/signin?message=Could not authenticate user");
  }

  if (data.user?.user_metadata?.role?.includes("member")) {
    if (role !== "member") {
      await signOutAdminNoRedirect();
      return redirect(`/ident/member/signin?message=You are not a ${role}`);
    }
    return redirect("/ident/member");
  }
  else {
    return redirect("/ident/admin");

  }
};

// exclusive for member sign up
export const signUp = async (headers: any, role: string, formData: FormData) => {
    "use server";

    const origin = headers.origin;
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          first_name: first_name,
          last_name: last_name,
          role: role,
          password: password,
        },
      },
    });

    if (error) {
      console.error(error.message)
      return redirect("/ident/member/signup?message=Could not authenticate user");
    }

    formData.delete("first_name");
    formData.delete("last_name");
    formData.delete("email");
    formData.delete("password");

    return redirect("/ident/member/signin?message=Check email to continue sign in process");
  };