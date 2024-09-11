// app/ident/member/confirmation/page.tsx:

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Link,
} from "@nextui-org/react";

export default async function MemberConfirmation() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !user?.user_metadata?.role?.includes("member")) {
    return redirect("/ident/admin");
  } else if (user) {
    return redirect("/ident/member/explore");
  }

  return (
    <div className="h-[100svh] w-screen flex justify-center items-center">
      <Card className="max-w-[400px] mx-6">
        <CardHeader className="flex gap-3 w-full justify-center items-center">
          <div className="flex flex-col">
            <p className="text-lg md:text-xl text-center font-semibold">
              Awaiting Administrator Approval
            </p>
            <p className="text-small text-center text-default-500">
              Your account creation is currently under review.
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-center">
            You will receive an email notification once your registration has
            been approved by the administrator.
          </p>
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-center">
          <Link
            showAnchorIcon
            color="success"
            href="/ident/member/signin"
            className="text-center self-center"
          >
            Sign in to your account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
