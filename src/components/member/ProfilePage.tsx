"use client";

import { RootState } from "@/app/reduxUtils/store";
import { setUser } from "@/app/reduxUtils/userSlice";
import { useHandleLogout } from "@/utils/authUtils";
import { supabase, supabaseAdmin } from "@/utils/supabase";
import {
  Avatar,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import React, { useRef } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { EyeSlashFilledIcon } from "../../../public/icons/EyeSlashFilledIcon";
import { EyeFilledIcon } from "../../../public/icons/EyeFilledIcon";

const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const handleLogout = useHandleLogout();

  // password state
  const [passwordInfo, sePasswordInfo] = useState({ password: "" });
  const [isInputUserPasswordVisible, setIsInputUserPasswordVisible] =
    useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Image state
  const [displayImage, setDisplayImage] = useState({
    profile_picture: "",
  });
  const [displayImageOpen, setDisplayImageOpen] = useState(false);
  const BUCKET_NAME = "avatars";

  const [isLoading, setIsLoading] = useState(true);
  const [isTermsAndConditionsOpen, setIsTermsAndConditionsOpen] =
    useState(false);

  useEffect(() => {
    if (user && user.user_metadata) {
      const { profile_picture, password } = user.user_metadata;

      setDisplayImage({ profile_picture });
      sePasswordInfo({ password });
      // setTempPasswordInfo({ password });

      setIsLoading(false);
    }
  }, [user]);

  const onLogoutClick = () => {
    handleLogout();
  };

  const reloadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    dispatch(setUser(user));
  };

  const handleDeleteToggle = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (error) throw error;

      if (displayImage.profile_picture) {
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([`public/${user.id}`]);

        if (error) throw error;
      }

      setIsLoading(true);
      handleLogout();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handlePasswordSave = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          password: newPassword,
        },
      });
      if (error) throw error;

      reloadUser();
    } catch (error) {
      console.error("Error updating password information:", error);
    }
  };

  // Handlers for image
  const fileInputRef = useRef<any>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayImageOpen(false);

    const files = e.target.files;
    // console.log("files", files);

    if (files && files[0]) {
      setDisplayImage((prevState) => ({
        ...prevState,
        profile_picture: "",
      }));

      setDisplayImage((prevState) => ({
        ...prevState,
        profile_picture: "",
      }));

      if (displayImage.profile_picture) {
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([`public/${user.id}`]);

        if (error) {
          console.error("Error deleting image:", error.message);
          return;
        }
      }

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`public/${user.id}`, files[0]);

      if (data && !error) {
        const { publicUrl } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data.path).data;

        const { error } = await supabase.auth.updateUser({
          data: {
            profile_picture: publicUrl,
          },
        });

        setDisplayImage((prevState) => ({
          ...prevState,
          profile_picture: publicUrl,
        }));

        setDisplayImage((prevState) => ({
          ...prevState,
          profile_picture: publicUrl,
        }));

        reloadUser();

        if (error) throw error;
      }
    }
  };

  const handleImageDelete = async () => {
    setDisplayImageOpen(false);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([`public/${user.id}`]);

    if (error) {
      console.error("Error deleting image:", error.message);
      return;
    }

    await supabase.auth.updateUser({
      data: {
        profile_picture: "",
      },
    });

    setDisplayImage((prevState) => ({
      ...prevState,
      profile_picture: "",
    }));

    reloadUser();
  };

  return (
    <>
      <Modal
        backdrop="blur"
        placement="center"
        hideCloseButton={true}
        isOpen={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
        className="md:max-w-md h-full md:max-h-96 overflow-y-auto relative"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="sticky top-0 bg-white">
                <h1>Change Password</h1>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-5">
                <Input
                  type={isInputUserPasswordVisible ? "text" : "password"}
                  label="Old Password"
                  name="Old Password"
                  color="success"
                  variant="bordered"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() =>
                        setIsInputUserPasswordVisible(
                          !isInputUserPasswordVisible
                        )
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
                <Input
                  type={isInputUserPasswordVisible ? "text" : "password"}
                  label="New Password"
                  name="New Password"
                  color="success"
                  variant="bordered"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() =>
                        setIsInputUserPasswordVisible(
                          !isInputUserPasswordVisible
                        )
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
                <Input
                  type={isInputUserPasswordVisible ? "text" : "password"}
                  label="Confirm New Password"
                  name="Confirm New Password"
                  color="success"
                  variant="bordered"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() =>
                        setIsInputUserPasswordVisible(
                          !isInputUserPasswordVisible
                        )
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
              </ModalBody>
              <ModalFooter>
                <Button
                  color="success"
                  className="text-white"
                  isDisabled={
                    !oldPassword ||
                    !newPassword ||
                    !confirmNewPassword ||
                    newPassword !== confirmNewPassword
                  }
                  onClick={() => {
                    if (oldPassword !== passwordInfo.password)
                      return alert("Old password is incorrect");
                    if (newPassword !== confirmNewPassword)
                      return alert("Passwords do not match");
                    setIsLoading(true);
                    handlePasswordSave();
                  }}
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsPasswordOpen(false);
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        backdrop="blur"
        placement="center"
        hideCloseButton={true}
        isOpen={isTermsAndConditionsOpen}
        onOpenChange={setIsTermsAndConditionsOpen}
        className="md:max-w-md h-full md:max-h-96 overflow-y-auto relative"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="sticky top-0 bg-white">
                <h1>Terms and Conditions</h1>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-5">
                <h5>
                  Welcome to Kaitawan Tamu, the ASSCAT campus e-commerce web-app
                  designed to help students buy and sell preloved or unused
                  items. By using this platform, you agree to the following
                  terms and conditions:
                </h5>
                <ul className="list-disc list-inside">
                  <li>
                    <strong>Direct Sell or Auction:</strong> You can list items
                    for direct sale or auction. Ensure that all items listed are
                    in good condition and accurately described.
                  </li>
                  <li>
                    <strong>Meet-Up Arrangements:</strong> Users can chat to
                    arrange meet-ups for exchanging items. Always choose safe
                    and public locations for meet-ups.
                  </li>
                  <li>
                    <strong>AI Assistance:</strong> Our AI is available to help
                    you with quick questions about items. Use this feature
                    responsibly and avoid misuse.
                  </li>
                  <li>
                    <strong>Respectful Communication:</strong> Maintain
                    respectful and courteous communication with other users. Any
                    form of harassment or abuse will not be tolerated.
                  </li>
                  <li>
                    <strong>Compliance with Laws:</strong> Ensure that all
                    transactions comply with local laws and regulations. Illegal
                    items are strictly prohibited.
                  </li>
                </ul>
                <p>
                  By using Kaitawan Tamu, you agree to adhere to these terms and
                  conditions. Happy buying and selling!
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  onClick={() => {
                    setIsTermsAndConditionsOpen(false);
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="w-full h-full flex flex-col items-center">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Spinner color="success" />
          </div>
        )}
        {!isLoading && (
          <>
            <header className="bg-[#008B47] py-2 px-2 w-full flex items-center justify-center shadow-md">
              <div className="w-full max-w-6xl flex justify-start items-center gap-3 h-24 pt-7 pb-1">
                <Avatar
                  src={displayImage.profile_picture}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover cursor-pointer"
                />
                <div className="flex flex-col text-white truncate">
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
            <div className="w-full flex flex-col flex-grow px-2 mt-3">
              <ul className="list-none p-0 flex flex-col gap-5">
                <li
                  className="flex items-center justify-between gap-2 py-2"
                  onClick={handleClick}
                >
                  <div className="flex items-center gap-2">
                    <FaCamera />
                    <span>
                      {!displayImage ? "Upload an Image" : "Change Photo"}
                    </span>
                  </div>
                  <MdOutlineChevronRight />
                  <input
                    ref={fileInputRef}
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </li>
                <li
                  className="flex items-center justify-between gap-2 py-2"
                  onClick={() => setIsPasswordOpen(true)}
                >
                  <div className="flex items-center gap-2">
                    <FaLock />
                    <span>Change Password</span>
                  </div>
                  <MdOutlineChevronRight />
                </li>
                <li
                  className="flex items-center justify-between gap-2 py-2"
                  onClick={() => setIsTermsAndConditionsOpen(true)}
                >
                  <div className="flex items-center gap-2">
                    <FaFileAlt />
                    <span>Terms and Conditions</span>
                  </div>
                  <MdOutlineChevronRight />
                </li>

                <hr className="my-2 border-t border-gray-300" />
                <li
                  className="flex items-center justify-between gap-2 py-2"
                  onClick={handleDeleteToggle}
                >
                  <div className="flex items-center gap-2">
                    <FaTrash />
                    <span>Delete Account</span>
                  </div>
                  <MdOutlineChevronRight />
                </li>
                <li
                  className="flex items-center justify-between gap-2 py-2"
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Are you sure you want to log out?"
                    );
                    if (confirmed) {
                      setIsLoading(true);
                      onLogoutClick();
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </div>
                  <MdOutlineChevronRight />
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
