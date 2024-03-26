import React, { useState } from "react";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/Game.scss";

const Game = () => {
  const navigate = useNavigate();
  const [lobbyId, setLobbyId] = useState<string>("");

  const joinLobby = () => {
    // Functionality for joining a lobby goes here
    // For now, it doesn't do anything
  };

  const createLobby = () => {
    // Functionality for creating a lobby goes here
    // For now, it doesn't do anything
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
