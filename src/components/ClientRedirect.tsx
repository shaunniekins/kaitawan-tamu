"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useSelector } from "react-redux";
import { RootState } from "@/app/reduxUtils/store";

export default function ClientRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    const handleRedirect = async () => {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;

      // Get user from Supabase if not in Redux
      let currentUser = user;
      if (!currentUser) {
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();
        currentUser = supabaseUser;
      }

      // Root redirect
      if (currentPath === "/") {
        router.replace("/ident/signin?usertype=member");
        return;
      }

      // Admin redirects
      if (currentPath === "/admin" || currentPath === "/administrator") {
        router.replace("/admin/dashboard");
        return;
      }

      // Member redirect
      if (currentPath === "/member") {
        router.replace("/member/explore");
        return;
      }

      // Auth redirects
      if (currentPath === "/signin") {
        router.replace("/ident/signin?usertype=member");
        return;
      }

      if (currentPath === "/ident") {
        router.replace("/ident/signin?usertype=member");
        return;
      }

      if (currentPath === "/ident/signin" && !searchParams.has("usertype")) {
        router.replace("/ident/signin?usertype=member");
        return;
      }

      if (currentPath === "/signup") {
        router.replace("/ident/signup?usertype=member");
        return;
      }

      if (currentPath === "/ident/signup" && !searchParams.has("usertype")) {
        router.replace("/ident/signup?usertype=member");
        return;
      }

      // User-based redirects
      if (currentUser) {
        const user_type = currentUser.user_metadata?.role;
        const account_status = currentUser.user_metadata?.account_status;

        // Check member account status
        if (user_type === "member" && account_status !== "active") {
          await supabase.auth.signOut();
          router.replace("/ident/confirmation");
          return;
        }

        // Redirect from auth pages if already logged in
        if (currentPath.startsWith("/ident")) {
          if (user_type === "member") {
            router.replace("/member/explore");
          } else {
            router.replace("/admin/dashboard");
          }
          return;
        }

        // Protect admin routes
        if (currentPath.startsWith("/admin") && user_type === "member") {
          router.replace("/member/explore");
          return;
        }

        // Protect member routes
        if (currentPath.startsWith("/member") && user_type !== "member") {
          router.replace("/admin/dashboard");
          return;
        }
      } else {
        // Redirect to signin if accessing protected routes without auth
        if (
          currentPath.startsWith("/admin") ||
          currentPath.startsWith("/member")
        ) {
          router.replace("/ident/signin?usertype=member");
          return;
        }
      }
    };

    handleRedirect();
  }, [user, router, searchParams]);

  return null; // This component doesn't render anything
}
