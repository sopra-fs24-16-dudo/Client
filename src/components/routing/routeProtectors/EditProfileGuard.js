import React from "react";
import {Navigate, Outlet} from "react-router-dom";
import PropTypes from "prop-types";

export const EditProfileGuard = () => {
  if (localStorage.getItem("token")) {
    
    return <Outlet />;
  }
  
  return <Navigate to="/game" replace />;
};

EditProfileGuard.propTypes = {
  children: PropTypes.node
};