import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * UserListGuard
 * This guard ensures that only authenticated users can access the UserList page.
 * If the user is not authenticated, they are redirected to the login page.
 */
export const UserListGuard = () => {
  // Check if the user is authenticated by verifying if a token exists in local storage
  if (localStorage.getItem("token")) {
    // Token exists, meaning the user is likely authenticated
    return <Outlet />;
  }

  // No token found, redirect the user to the login page
  return <Navigate to="/login" replace />;
};
