import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";

export const UsersListGuard = () => {
  if (localStorage.getItem("token")) {
    return <Outlet />;
  }

  return <Navigate to="/homepage" replace />;
};

UsersListGuard.propTypes = {
  children: PropTypes.node
};