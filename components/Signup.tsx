// components/Signup.tsx

"use client";

import { EyeFilledIcon } from "@/public/icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/public/icons/EyeSlashFilledIcon";
import { Button, Image, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";

type SignupComponentProps = {
  headers: any;
  signUp: (headers: Headers, role: string, formData: FormData) => Promise<void>;
  role: string;
};

const SignupComponent: React.FC<SignupComponentProps> = ({
  headers,
  signUp,
  role,
}) => {
  const [isInputUserPasswordVisible, setIsInputUserPasswordVisible] =
    useState(false);
  const [siignUpPending, setSignUpPending] = useState(false);

  const { pending } = useFormStatus();

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignUpPending(true);
    const formData = new FormData(event.currentTarget);
    await signUp(headers, role, formData);
    setSignUpPending(false);
  };

  return (
    <div className="w-full bg-white">
      <div className="mx-5 md:container md:mx-auto md:px-[35rem] min-h-[100svh] h-[100svh] flex flex-col justify-around items-center">
        <Image
          src="/images/logo.svg"
          alt="logo"
          width={100}
          height={100}
          className="mt-16"
        />
        <form
          className="animate-in flex-1 flex flex-col w-full justify-center gap-2"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col rounded-md shadow-sm gap-3 mb-8">
            <Input
              type="text"
              label="First Name"
              name="first_name"
              variant="bordered"
              color="primary"
              isRequired
            />
            <Input
              type="text"
              label="Last Name"
              name="last_name"
              variant="bordered"
              color="primary"
              isRequired
            />
            <Input
              type="email"
              label="Email"
              name="email"
              variant="bordered"
              color="primary"
              isRequired
            />
            <Input
              type={isInputUserPasswordVisible ? "text" : "password"}
              label="Password"
              name="password"
              variant="bordered"
              color="primary"
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

            <Button type="submit" color="primary" disabled={pending} size="lg">
              {siignUpPending ? "Signing Up..." : "Sign Up"}
            </Button>
          </div>
        </form>
        <Button
          type="submit"
          variant="ghost"
          color="primary"
          onClick={() => {
            return router.push(`/ident/${role}/signin`);
          }}
          className="mb-10"
        >
          Already Logged in
        </Button>
      </div>
    </div>
  );
};

export default SignupComponent;
