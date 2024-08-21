// components/admin/pages/ProfilePage.tsx

"use client";

import { signOutMember } from "@/utils/supabase-functions/signOut";
import { Avatar, Badge, Switch } from "@nextui-org/react";
import { IoCamera } from "react-icons/io5";

const ProfilePage = () => {
  return (
    <>
      <header className="bg-gradient-to-b from-blue-500 to-purple-500 py-2 px-2 md:px-0 w-full flex items-center justify-center shadow-md fixed inset-x-0 top-0 z-50">
        <div className="w-full max-w-4xl flex justify-start items-center gap-3 h-24 pt-7 pb-1">
          <Badge
            showOutline={false}
            content={<IoCamera />}
            color="default"
            placement="bottom-right"
            className="mr-2 mb-1"
          >
            <Avatar
              src="https://nextui.org/images/hero-card-complete.jpeg"
              className="w-16 h-16"
            />
          </Badge>
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold font-sans truncate">
              Bruce Wayne
            </h1>
            <h2 className="text-xs truncate">bruce.wayne@example.com</h2>
          </div>
        </div>
      </header>
      <div className="main-container justify-start">
        <div className="product-details-container overflow-x-hidden">
          <div className="w-full flex-col px-2">
            <div className="w-full flex flex-col gap-4 mt-20">
              {/* <h1 className="text-lg">Settings</h1>
              <div className="flex justify-between">
                <h2>Dark Mode</h2>
                <Switch defaultSelected size="sm">
                  <span className="text-xs">System Default</span>
                </Switch>
              </div> */}
              <button onClick={() => signOutMember()}>Signout</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
