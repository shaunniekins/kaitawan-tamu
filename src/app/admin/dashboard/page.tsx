"use client";

import { Button, Image, Spinner, Tab, Tabs } from "@nextui-org/react";
import React, { Key, useState } from "react";
import Link from "next/link";
import { MdOutlineLogout } from "react-icons/md";
import { RxBox, RxDashboard, RxGear, RxPerson } from "react-icons/rx";
import { useHandleLogout } from "@/utils/authUtils";
import { useSelector } from "react-redux";
import { RootState } from "@/app/reduxUtils/store";
import AdminUserComponent from "@/components/admin/AdminUsers";
import AdminProductsComponent from "@/components/admin/AdminProducts";
import AdminDashboardComponent from "@/components/admin/AdminDashboard";

export default function AdminDashboard() {
  const user = useSelector((state: RootState) => state.user.user);

  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState("dashboard");

  const handleSelectionChange = (key: Key) => {
    const keyString = key.toString();
    if (keyString !== currentTab) {
      setCurrentTab(keyString);
    }
  };

  const handleLogout = useHandleLogout();

  const onLogoutClick = () => {
    handleLogout();
  };

  return (
    <>
      {isSigningOut ? (
        <div className="box justify-center">
          <Spinner color="success" />
        </div>
      ) : (
        <div className="h-[100svh] w-screen flex flex-col relative">
          <header className="p-4 w-full flex items-center justify-center shadow-sm">
            <div className="w-full max-w-6xl flex justify-between items-center">
              <Link
                className="flex items-center text-2xl font-bold"
                href="/admin"
              >
                <Image
                  src="/images/asscat-logo.jpeg"
                  alt="Kaitawan Tamu Logo"
                  width={45}
                  height={45}
                  className="rounded-full"
                />
                <span className="ml-2">Kaitawan Tamu</span>
              </Link>

              <div className="flex flex-col justify-end items-end">
                <div className="flex items-center gap-4">
                  <Button
                    radius="sm"
                    color="danger"
                    startContent={<MdOutlineLogout />}
                    onClick={() => {
                      setIsSigningOut(true);
                      onLogoutClick();
                    }}
                  >
                    Signout
                  </Button>
                </div>
              </div>
            </div>
          </header>
          <header className="bg-white p-4 w-full flex items-center justify-center shadow-sm">
            <div className="w-full max-w-6xl flex justify-start">
              <div className="w-full md:w-auto">
                <Tabs
                  aria-label="Tab Options"
                  selectedKey={currentTab}
                  color="success"
                  size="lg"
                  fullWidth={true}
                  variant="underlined"
                  // disabledKeys={["settings", "users"]}
                  onSelectionChange={handleSelectionChange}
                >
                  <Tab
                    key="dashboard"
                    title={
                      <div className="flex items-center space-x-2">
                        <RxDashboard />
                        <span>Dashboard</span>
                        {/* <Chip size="sm" variant="faded">
                          1
                        </Chip> */}
                      </div>
                    }
                  />
                  <Tab
                    key="products"
                    title={
                      <div className="flex items-center space-x-2">
                        <RxBox />
                        <span>Product Listings</span>
                      </div>
                    }
                  />
                  <Tab
                    key="users"
                    title={
                      <div className="flex items-center space-x-2">
                        <RxPerson />
                        <span>Users</span>
                      </div>
                    }
                  />
                  {/* <Tab
                    key="settings"
                    title={
                      <div className="flex items-center space-x-2">
                        <RxGear />
                        <span>Settings</span>
                      </div>
                    }
                  /> */}
                </Tabs>
              </div>
            </div>
          </header>
          <div className="h-full w-full p-4 flex mb-8 overflow-hidden">
            <div className="flex justify-center items-start w-full h-full">
              <div className="max-w-6xl w-full h-full flex justify-center">
                {currentTab === "dashboard" && <AdminDashboardComponent />}
                {currentTab === "products" && <AdminProductsComponent />}
                {currentTab === "users" && <AdminUserComponent />}
                {/* {currentTab === "settings" && <div>Settings</div>} */}
              </div>
            </div>
          </div>
          <footer className="sticky bottom-0 w-full text-center text-xs py-2 bg-green-800 text-white">
            All rights reserved to Kaitawan Tamu ({new Date().getFullYear()})
          </footer>
        </div>
      )}
    </>
  );
}
