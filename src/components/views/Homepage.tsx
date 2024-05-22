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

  const joinLobby = async () => {
    try {
      const requestBody = JSON.stringify(id);
      await api.put(`/lobby/players/${lobbyId}`, requestBody);
      localStorage.setItem("lobbyId", lobbyId);
      const isFree = await api.get(`/lobby/availability/${lobbyId}`);
      if (!isFree.data) {
        alert("Sorry, a game is already in progress in this lobby. Please try again later.");

        return;
      }
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
      const lobby = new Lobby(response.data);
      localStorage.setItem("lobbyId", lobby.id);
      navigate(`/lobby/${lobby.id}`);
    } catch (error) {
      alert(
        `Something went wrong while creating a lobby: \n${handleError(error)}`
      );
    }
  };

  const goToProfile = () => {
    navigate(`/profile/${id}`);
  };
  const userList = async ()  => {
    try {
      const response = await api.get("/users");
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
      await api.put("/logout", requestBody);
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      localStorage.removeItem("currentPlayerId");
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
        <div className="join-lobby-container">
          <input
            className="registration input" style={{ marginTop: "10px" }}
            type="text"
            placeholder="Enter lobby ID"
            value={lobbyId}
            onChange={(e) => setLobbyId(e.target.value)}
          />
          <Button onClick={joinLobby} disabled={!lobbyId}>
            Join Lobby
          </Button>
        </div>
        <div className="button-container">
          <Button onClick={createLobby}>
            Create Lobby
          </Button>
          <Button width="100%" onClick={userList}>
            Search Users
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
