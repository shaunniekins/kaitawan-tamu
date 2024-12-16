"use client";

import { Button, Image, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeSlashFilledIcon } from "../../../../public/icons/EyeSlashFilledIcon";
import { EyeFilledIcon } from "../../../../public/icons/EyeFilledIcon";

export default function ResetPassword() {
  const router = useRouter();

  const [isInputUserPasswordVisible, setIsInputUserPasswordVisible] =
    useState(false);

  const [password, setPassword] = useState("");

  return (
    <div className="w-full bg-white relative">
      <div className="absolute top-3 right-3">
        <Button
          color="success"
          variant="light"
          size="sm"
          className="invisible"
          onClick={() => {
            return router.push("/ident/signin?usertype=administrator");
          }}
        />
      </div>
      <div className="mx-5 lg:container lg:mx-auto 2xl:px-[35rem] min-h-[100svh] h-[100svh] flex flex-col justify-around items-center">
        <div className="flex flex-col gap-3 text-[#008B47] font-semibold text-lg">
          <Image
            src="/images/asscat-logo.jpeg"
            alt="logo"
            width={130}
            height={130}
            className="mt-12"
          />
          <div className="flex flex-col justify-center items-center">
            <h6>Kaitawan Tamu</h6>
            <h6 className="text-xs capitalize font-normal">Reset Password</h6>
          </div>
        </div>
        <div className="animate-in flex-1 flex flex-col w-full justify-center gap-2">
          <div className="flex flex-col rounded-md shadow-sm gap-3 mb-16 px-2">
            <Input
              type={isInputUserPasswordVisible ? "text" : "password"}
              label="Password"
              name="password"
              variant="bordered"
              color="success"
              isRequired
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() =>
                    setIsInputUserPasswordVisible(!isInputUserPasswordVisible)
                  }
                >
                  {isInputUserPasswordVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />
            <div className="flex flex-col gap-4 pb-5">
              <Button
                color="success"
                disabled={password.length < 8}
                size="lg"
                className="text-white"
                onClick={() => {}}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          color="success"
          className="mb-10"
          onClick={() => {
            return router.push("/ident/signin?usertype=member");
          }}
        >
          Go to signin page
        </Button>
      </div>
    </div>
  );
}
