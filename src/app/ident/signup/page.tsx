"use client";

import SignupComponent from "@/components/Signup";
import { useSearchParams } from "next/navigation";

export default function SigninPage() {
  const searchParams = useSearchParams();
  const userType = searchParams.get("usertype");

  if (!userType) {
    return;
  }

  return <SignupComponent userType={userType} />;
}
