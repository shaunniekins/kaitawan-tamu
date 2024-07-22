"use client";

import React, { ReactNode, useState } from "react";
import DefaultHeader from "../admin/headers/Header";
import ExploreHeader from "../admin/headers/ExploreHeader";
import BottomNavBarComponent from "./BottomNavBar";

interface NavigationProps {
  children: ReactNode;
}

const Navigation = ({ children }: NavigationProps) => {
  return (
    <section className="box flex-col">
      {/* <DefaultHeader /> */}
      {/* <ExploreHeader /> */}
      <div className="h-full w-full mt-12 mb-16 md:flex md:flex-col md:justify-center md:items-center">
        {children}
        <BottomNavBarComponent />
      </div>
    </section>
  );
};
export default Navigation;
