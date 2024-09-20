// components/admin/pages/ProfilePage.tsx

"use client";

import { RootState } from "@/app/reduxUtils/store";
import { useHandleLogout } from "@/utils/authUtils";
import { Avatar, Badge, Spinner, Switch } from "@nextui-org/react";
import { useEffect, useState } from "react";
import {
  FaCamera,
  FaChevronRight,
  FaFileAlt,
  FaList,
  FaLock,
  FaSignOutAlt,
  FaTrash,
} from "react-icons/fa";
import { IoCamera } from "react-icons/io5";
import { MdOutlineChevronRight } from "react-icons/md";
import { useSelector } from "react-redux";

const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  const handleLogout = useHandleLogout();

  const onLogoutClick = () => {
    handleLogout();
  };

  return (
    <>
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner color="success" />
        </div>
      )}
      {!isLoading && (
        <>
          {/* bg-gradient-to-b from-green-500 to-[#008B47]  */}
          <header className="bg-[#008B47] py-2 px-2 md:px-0 w-full flex items-center justify-center shadow-md fixed inset-x-0 top-0 lg:top-10 z-50">
            <div className="w-full max-w-6xl flex justify-start items-center gap-3 h-24 pt-7 pb-1">
              <Avatar
                src="https://nextui.org/images/hero-card-complete.jpeg"
                className="w-16 h-16"
              />
              <div className="flex flex-col text-white">
                <h1 className="text-3xl font-semibold font-sans truncate">
                  {`${user?.user_metadata?.first_name || ""} ${
                    user?.user_metadata?.last_name || ""
                  }`.trim() || "Loading..."}
                </h1>
                <h2 className="text-xs truncate">
                  {user?.email || "Loading..."}
                </h2>
              </div>
            </div>
          </header>
          <div className="main-container justify-start items-start">
            <div className="product-details-container overflow-x-hidden">
              <div className="w-full flex-col px-2">
                <div className="w-full flex flex-col gap-4 mt-20 lg:mt-32">
                  <ul className="list-none p-0 flex flex-col gap-5">
                    <li className="flex items-center justify-between gap-2 py-2">
                      <div className="flex items-center gap-2">
                        <FaCamera />
                        <span>Change Photo</span>
                      </div>
                      <MdOutlineChevronRight />
                    </li>
                    <li className="flex items-center justify-between gap-2 py-2">
                      <div className="flex items-center gap-2">
                        <FaLock />
                        <span>Change Password</span>
                      </div>
                      <MdOutlineChevronRight />
                    </li>
                    <li className="flex items-center justify-between gap-2 py-2">
                      <div className="flex items-center gap-2">
                        <FaFileAlt />
                        <span>Terms and Conditions</span>
                      </div>
                      <MdOutlineChevronRight />
                    </li>
                    <li className="flex items-center justify-between gap-2 py-2">
                      <div className="flex items-center gap-2">
                        <FaList />
                        <span>My Listing</span>
                      </div>
                      <MdOutlineChevronRight />
                    </li>
                    <hr className="my-2 border-t border-gray-300" />
                    <li className="flex items-center justify-between gap-2 py-2">
                      <div className="flex items-center gap-2">
                        <FaTrash />
                        <span>Delete Account</span>
                      </div>
                      <MdOutlineChevronRight />
                    </li>
                    <li className="flex items-center justify-between gap-2 py-2">
                      <div className="flex items-center gap-2">
                        <FaSignOutAlt />
                        <button
                          onClick={() => {
                            setIsLoading(true);
                            onLogoutClick();
                          }}
                        >
                          Logout
                        </button>
                      </div>
                      <MdOutlineChevronRight />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProfilePage;
