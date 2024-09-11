// components/Signup.tsx

"use client";

import { insertNewUser } from "@/app/api/usersData";
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
  const [signUpPending, setSignUpPending] = useState(false);

  const { pending } = useFormStatus();

  const router = useRouter();

  const validateEmail = (email: string) => {
    return email.endsWith("@asscat.edu.ph");
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!validateEmail(email)) {
      alert("Email must end with '@asscat.edu.ph'");
      return;
    }

    if (!validatePassword(password)) {
      alert("Password must be at least 8 characters long");
      return;
    }

    const yearLevelStr = formData.get("year_level") as string;
    const yearLevel = parseInt(yearLevelStr, 10);

    if (isNaN(yearLevel)) {
      alert("Year Level must be a valid number");
      return;
    }

    setSignUpPending(true);
    // await signUp(headers, role, formData);
    const newUserData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      role: role,
      school_id_number: formData.get("id_number") as string,
      year_level: yearLevel,
      email: email,
      password: password,
    };

    const response = await insertNewUser(newUserData);

    if (!response) {
      alert("Failed to sign up. Please try again.");
      setSignUpPending(false);
      return;
    }
    if (event.currentTarget) {
      event.currentTarget.reset();
    }

    formData.delete("first_name");
    formData.delete("last_name");
    formData.delete("id_number");
    formData.delete("year_level");
    formData.delete("email");
    formData.delete("password");

    setSignUpPending(false);
    router.push("/ident/member/confirmation");
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
          className="animate-in flex-1 flex flex-col w-full justify-center gap-2 overflow-hidden"
          onSubmit={handleSubmit}
        >
          {/* mb-8  */}
          <div className="flex flex-col rounded-md shadow-sm gap-3 overflow-y-auto">
            <Input
              type="text"
              label="First Name"
              name="first_name"
              variant="bordered"
              color="success"
              isRequired
            />
            <Input
              type="text"
              label="Last Name"
              name="last_name"
              variant="bordered"
              color="success"
              isRequired
            />
            <Input
              type="text"
              label="ID Number"
              name="id_number"
              variant="bordered"
              color="success"
              isRequired
            />
            <Input
              type="text"
              label="Year Level"
              name="year_level"
              variant="bordered"
              color="success"
              placeholder="eg. 1, 2, 3, 4, or 5"
              isRequired
            />
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
          </div>
          <Button
            type="submit"
            color="success"
            disabled={pending}
            size="lg"
            className="text-white my-3 py-5"
          >
            {signUpPending ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
        <Button
          type="submit"
          variant="ghost"
          color="success"
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
