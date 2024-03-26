import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/Game.scss";
import Lobby from "models/Lobby";

const Game = () => {
  const navigate = useNavigate();
  const [lobbyId, setLobbyId] = useState<string>("");

  const joinLobby = () => {
    // Functionality for joining a lobby goes here
    // For now, it doesn't do anything
  };

  const createLobby = async ()  => {
    try {
      const response = await api.post("/lobbies");

      // Get the returned user and update a new object.
      const lobby = new Lobby (response.data);

      localStorage.setItem("id", lobby.id);

      // Login successfully worked --> navigate to the route /game in the GameRouter
      navigate("/lobby");
    } catch (error) {
      alert(
        `Something went wrong while creating a lobby: \n${handleError(error)}`
      );
    }
  };

  return (
    <BaseContainer className="game container">
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
          <Button width="100%" onClick={joinLobby}>
            Join Lobby
          </Button>
          <Button width="100%" onClick={createLobby}>
            Create Lobby
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default Game;
