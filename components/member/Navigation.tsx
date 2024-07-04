"use client";

import React, { ReactNode, useState } from "react";
import DefaultHeader from "../admin/headers/Header";
import BottomBarComponent from "./BotttomBar";
import ExploreHeader from "../admin/headers/ExploreHeader";

interface NavigationProps {
  children: ReactNode;
}

const Navigation = ({ children }: NavigationProps) => {
  return (
    <section className="box flex-col">
      {/* <DefaultHeader /> */}
      <ExploreHeader />
      <div className="h-full w-full px-2 py-4 mt-12 mb-16 md:flex md:flex-col md:justify-center md:items-center">
        {children}
        <BottomBarComponent />
      </div>
    </section>
  );
};
export default Navigation;
