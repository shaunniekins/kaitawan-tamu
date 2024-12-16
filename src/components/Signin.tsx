"use client";

import { supabase } from "@/utils/supabase";
import { EyeFilledIcon } from "../../public/icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../../public/icons/EyeSlashFilledIcon";
import { Button, Image, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/reduxUtils/userSlice";

interface SigninComponentProps {
  userType: string;
}

const SigninComponent = ({ userType }: SigninComponentProps) => {
  const [isInputUserPasswordVisible, setIsInputUserPasswordVisible] =
    useState(false);
  const [signInPending, setSignInPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { pending } = useFormStatus();

  const router = useRouter();
  const dispatch = useDispatch();

  const handleSignInClick = async () => {
    setSignInPending(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Error signing in:", error.message);
      alert(error.message);
      setSignInPending(false);
    } else {
      const user = data.user;
      if (user) {
        dispatch(setUser(user));
      }
      router.push(`/${userType}`);
    }
  };

  const [isPassForgot, setIsPassForgot] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // redirectTo: "https://kaitawan-tamu-te.vercel.app/ident/reset-password",
      // redirectTo: "http://localhost:3000/ident/reset-password",
      redirectTo: `${window.location.origin}/ident/reset-password`,
    });

    if (error) {
      console.error("Error resetting password:", error.message);
      alert("Error sending recovery email. Please try again later.");
    } else {
      setEmail("");
      setSuccess(true);
    }
  };

  return (
    <div className="w-full bg-white relative">
      <div className="absolute top-3 right-3">
        <Button
          color="success"
          variant="light"
          size="sm"
          onClick={() => {
            router.push(
              userType === "administrator"
                ? "/ident/signin?usertype=member"
                : "/ident/signin?usertype=administrator"
            );
          }}
        >
          {userType === "administrator" ? "Not an Admin?" : "Admin?"}
        </Button>
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
            <h6 className="text-xs capitalize font-normal">{userType}</h6>
          </div>
        </div>
        <div className="animate-in flex-1 flex flex-col w-full justify-center gap-2">
          <div className="flex flex-col rounded-md shadow-sm gap-3 mb-16 px-2">
            <Input
              type="email"
              label="Email"
              name="email"
              variant="bordered"
              color="success"
              isRequired
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);

                if (isPassForgot) {
                  setSuccess(false);
                }
              }}
            />
            <Input
              type={isInputUserPasswordVisible ? "text" : "password"}
              label="Password"
              name="password"
              variant="bordered"
              color="success"
              isRequired
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${isPassForgot ? "hidden" : ""}`}
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
                disabled={pending}
                size="lg"
                className="text-white"
                onClick={() => {
                  if (isPassForgot) {
                    handleForgotPassword();
                  } else {
                    handleSignInClick();
                  }
                }}
              >
                {!isPassForgot
                  ? signInPending
                    ? "Signing In..."
                    : "Sign In"
                  : "Reset Password"}
              </Button>
              {isPassForgot && success && (
                <div className="text-green-500 text-xs">
                  Password reset email sent successfully.
                </div>
              )}
              <button
                className="text-green-500 text-xs cursor-pointer"
                onClick={() => {
                  if (isPassForgot) {
                    setIsPassForgot(false);
                  } else {
                    setIsPassForgot(true);
                  }
                }}
              >
                {isPassForgot ? "< Go back" : "Forgot Password?"}
              </button>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          isDisabled={userType === "administrator"}
          color="success"
          onClick={() => {
            return router.push(`/ident/signup?usertype=${userType}`);
          }}
          className="mb-10"
        >
          {userType !== "administrator"
            ? "Create New Account"
            : "Administrator"}
        </Button>
      </div>
    </div>
  );
};

export default SigninComponent;
