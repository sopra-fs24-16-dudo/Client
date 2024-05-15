import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/Homepage.scss";
import Lobby from "models/Lobby";

const Homepage = () => {
  const navigate = useNavigate();
  const [lobbyId, setLobbyId] = useState<string>("");
  const [id, setUserId] = useState<number>(null);
  const [users, setUsers] = useState([]);

  const joinLobby = async () => {
    try {
      const requestBody = JSON.stringify(id);

      await api.put(`/lobby/players/${lobbyId}`, requestBody);

      localStorage.setItem("lobbyId", lobbyId);

      //subscribeToLobbyChannel(lobbyId);

      navigate(`/lobby/${lobbyId}`);
    } catch (error) {
      alert(
        `Something went wrong while trying to join a lobby: \n${handleError(error)}`
      );
    }
  };

  const createLobby = async () => {
    try {
      const requestBody = JSON.stringify(id);

      const response = await api.post("/lobbies", requestBody);
      console.log("Response Data:", response.data); // Log response data
      const lobby = new Lobby(response.data);

      localStorage.setItem("lobbyId", lobby.id);

      // Subscribe to the lobby channel immediately after creating the lobby
      //subscribeToLobbyChannel(lobbyId);


      // Login successfully worked --> navigate to the route /game in the GameRouter
      navigate(`/lobby/${lobby.id}`);
    } catch (error) {
      alert(
        `Something went wrong while creating a lobby: \n${handleError(error)}`
      );
    }
  };

  const goToProfile = () => {
    navigate("/profile");
  };
  const userList = async ()  => {

    try {
      const response = await api.get("/users");
      console.log("Response Data:", response.data); // Log response data
      navigate("/userList");
    } catch (error) {
      alert(
        "Something went wrong while creating a lobby: \n${handleError(error)}"
      );
    }
  };

  const logout = async () => {
    try {
      // Call the backend API to update the user's status to "offline"
      const requestBody = JSON.stringify({id});
      console.log(requestBody);

      await api.put("/logout", requestBody);

      localStorage.removeItem("token");
      localStorage.removeItem("id");
      localStorage.removeItem("currentPlayerId");

      // Navigate to the login page
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout. Please try again.");
    }
  }

  useEffect(() => {
    const storedUserId = localStorage.getItem("id");
    setUserId(storedUserId);
  }, []);

  return (
    <BaseContainer className="homepage container">
      <h2>Join or create lobby</h2>
      <div className="lobby-form">
        <input
          className="registration input"
          type="text"
          placeholder="Enter lobby ID"
          value={lobbyId}
          onChange={(e) => setLobbyId(e.target.value)}
        />
        <div className="button-container">
          <Button onClick={joinLobby}>
            Join Lobby
          </Button>
          <Button onClick={createLobby}>
            Create Lobby
          </Button>
          <Button width="100%" onClick={userList}>
            Search Users
          </Button>
          <Button onClick={goToProfile}>
            Go to Profile
          </Button>
          <Button onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default Homepage;
