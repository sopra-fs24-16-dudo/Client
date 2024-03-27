import React from "react";
import {Navigate, Outlet} from "react-router-dom";
import PropTypes from "prop-types";

export const LobbyGuard = () => {
  if (localStorage.getItem("token")) {

    return <Outlet />;
  }

  return <Navigate to="/game" replace />;
};

LobbyGuard.propTypes = {
  children: PropTypes.node
};