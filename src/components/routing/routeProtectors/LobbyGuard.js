import React from "react";
import {Navigate, Outlet} from "react-router-dom";
import PropTypes from "prop-types";

export const GameGuard = () => {
  if (localStorage.getItem("token")) {

    return <Outlet />;
  }

  return <Navigate to="/game" replace />;
};

GameGuard.propTypes = {
  children: PropTypes.node
};