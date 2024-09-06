// components/Signin.tsx

"use client";

import { EyeFilledIcon } from "@/public/icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/public/icons/EyeSlashFilledIcon";
import { Button, Image, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";

type SigninComponentProps = {
  signIn: (role: string, formData: FormData) => Promise<void>;
  role: string;
};

const SigninComponent: React.FC<SigninComponentProps> = ({ signIn, role }) => {
  const [isInputUserPasswordVisible, setIsInputUserPasswordVisible] =
    useState(false);
  const [signInPending, setSignInPending] = useState(false);

  const { pending } = useFormStatus();

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInPending(true);
    const formData = new FormData(event.currentTarget);
    await signIn(role, formData);
    setSignInPending(false);
  };

  return (
    <div className="w-full bg-white">
      <div className="mx-5 lg:container lg:mx-auto 2xl:px-[35rem] min-h-[100svh] h-[100svh] flex flex-col justify-around items-center">
        <div className="flex flex-col gap-3 text-[#008B47] font-semibold text-lg">
          <Image
            src="/images/asscat-logo.jpeg"
            alt="logo"
            width={130}
            height={130}
            className="mt-12"
          />
          <h6>Kaitawan Tamu</h6>
        </div>
        <form
          className="animate-in flex-1 flex flex-col w-full justify-center gap-2"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col rounded-md shadow-sm gap-3 mb-16">
            <Input
              type="email"
              label="Email"
              name="email"
              variant="bordered"
              color="success"
              isRequired
            />
            <Input
              type={isInputUserPasswordVisible ? "text" : "password"}
              label="Password"
              name="password"
              variant="bordered"
              color="success"
              isRequired
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

            <Button
              type="submit"
              color="success"
              disabled={pending}
              size="lg"
              className="text-white"
            >
              {signInPending ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </form>
        <Button
          type="submit"
          variant="ghost"
          isDisabled={role === "admin"}
          color="success"
          onClick={() => {
            return router.push(`/ident/${role}/signup`);
          }}
          className="mb-10"
        >
          {role !== "admin" ? "Create New Account" : "Administrator"}
        </Button>
      </div>
    </div>
  );
};

export default SigninComponent;
