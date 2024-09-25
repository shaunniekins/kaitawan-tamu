"use client";

import { RootState } from "@/app/reduxUtils/store";
import { useHandleLogout } from "@/utils/authUtils";
import { Avatar, Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
import {
  FaCamera,
  FaFileAlt,
  FaList,
  FaLock,
  FaSignOutAlt,
  FaTrash,
} from "react-icons/fa";
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
    <div className="w-full h-full flex flex-col items-center">
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner color="success" />
        </div>
      )}
      {!isLoading && (
        <>
          <header className="bg-[#008B47] py-2 px-2 md:px-0 w-full flex items-center justify-center shadow-md">
            <div className="w-full max-w-6xl flex justify-start items-center gap-3 h-24 pt-7 pb-1">
              <Avatar
                src="https://fakeimg.pl/500x500?text=img&font=bebas"
                className="w-16 h-16"
                disableAnimation
              />
              <div className="w-full flex flex-col text-white truncate">
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
          <div className="w-full flex flex-col flex-grow">
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
        </>
      )}
    </div>
  );
};

export default ProfilePage;
