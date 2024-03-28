import React from "react";
import {Navigate, Outlet} from "react-router-dom";
import PropTypes from "prop-types";

export const ProfileGuard = () => {
  if (localStorage.getItem("token")) {
    
    return <Outlet />;
  }
  
  return <Navigate to="/homepage" replace />;
};

ProfileGuard.propTypes = {
  children: PropTypes.node
};