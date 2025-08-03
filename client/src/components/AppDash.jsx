import React from "react";
import { Outlet } from "react-router-dom";
import NavbarDB from "./Dashborad/NavbarDB";

const AppDash = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <NavbarDB />
      <Outlet />
    </div>
  );
};

export default AppDash;
