"use client";

import SigninComponent from "@/components/Signin";
import { useSearchParams } from "next/navigation";

export default function SigninPage() {
  const searchParams = useSearchParams();
  const userType = searchParams.get("usertype");

  if (!userType) {
    return;
  }

  return <SigninComponent userType={userType} />;
}
