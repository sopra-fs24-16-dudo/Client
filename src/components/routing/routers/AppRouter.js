import React from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {HomepageGuard} from "../routeProtectors/HomepageGuard";
import HomepageRouter from "./HomepageRouter";
import Login from "../../views/Login";
import Registration from "../../views/Registration";
import Profile from "../../views/Profile";
import {ProfileGuard} from "../routeProtectors/ProfileGuard";
import Lobby from "../../views/Lobby";
import {LobbyGuard} from "../routeProtectors/LobbyGuard";
import Game from "../../views/Game";
import {GameGuard} from "../routeProtectors/GameGuard";
import UserList from "../../views/UserList";
import {UserListGuard} from "../routeProtectors/UserListGuard";


/**
 * Main router of your application.
 * In the following class, different routes are rendered. In our case, there is a Login Route with matches the path "/login"
 * and another Router that matches the route "/game".
 * The main difference between these two routes is the following:
 * /login renders another component without any sub-route
 * /game renders a Router that contains other sub-routes that render in turn other react components
 * Documentation about routing in React: https://reactrouter.com/en/main/start/tutorial 
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/homepage/*" element={<HomepageGuard />}>
          <Route path="/homepage/*" element={<HomepageRouter base="/homepage"/>} />
        </Route>

        <Route path="/profile/:userId" element={<ProfileGuard/>}>
          <Route path="/profile/:userId" element={<Profile/>} />
        </Route>

        <Route path="/game/:gameId" element={<GameGuard/>}>
          <Route path="/game/:gameId" element={<Game/>} />
        </Route>

        <Route path="/Profile" element={<ProfileGuard/>}>
          <Route path="/Profile" element={<Profile/>} />
        </Route>

        <Route path="/login" element={<Login/>} />
        
        <Route path="/registration" element={<Registration/>} />

        <Route path="/lobby/:lobbyid" element={<LobbyGuard />}>
          <Route path="/lobby/:lobbyid" element={<Lobby/>} />
        </Route>

        <Route path="/userList" element={<UserListGuard/>}>
          <Route path="/userList" element={<UserList/>} />
        </Route>

        <Route path="/" element={
          <Navigate to="/homepage" replace />
        }/>

      </Routes>
    </BrowserRouter>
  );
};

/*
* Don't forget to export your component!
 */
export default AppRouter;
