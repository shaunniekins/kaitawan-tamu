"use client";

import React, { ReactNode, useState } from "react";
import DefaultHeader from "./headers/Header";
import ExploreHeader from "./headers/ExploreHeader";
import BottomNavBarComponent from "./BottomNavBar";
import { usePathname } from "next/navigation";

interface NavigationProps {
  children: ReactNode;
}

const Navigation = ({ children }: NavigationProps) => {
  const pathname = usePathname();

  return (
    <section className="box flex-col relative">
      {/* <DefaultHeader /> */}
      {/* <ExploreHeader /> */}
      <div
        className={`${
          pathname === "/ident/member/chat" ? "mb-0" : "mb-16"
        } h-full w-full mt-12 md:flex md:flex-col md:justify-center md:items-center`}
      >
        {children}
        <BottomNavBarComponent />
      </div>
      <footer className="hidden lg:block absolute bottom-0 w-full text-center text-xs py-2 bg-green-800 text-white">
        All rights reserved to Kaitawan Tamu ({new Date().getFullYear()})
      </footer>
    </section>
  );
};
export default Navigation;
