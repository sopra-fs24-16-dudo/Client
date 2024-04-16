import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/Game.scss";

const DudoGame = () => {
  const [gameState, setGameState] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState("");
  const lobbyId = localStorage.getItem("lobbyId");

  useEffect(() => {
    fetchGameState();
  }, []);

  const fetchGameState = async () => {
    try {
      const response = await api.get(`/dudo/game/${lobbyId}`);
      setGameState(response.data);
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  };

  const handleStartGame = async () => {
    try {
      // Implement logic to start the game
    } catch (error) {
      console.error('Error starting the game:', error);
    }
  };

  const handleBid = async () => {
    try {
      // Implement logic to make a bid
    } catch (error) {
      console.error('Error making a bid:', error);
    }
  };

  const handleDudo = async () => {
    try {
      // Implement logic to call Dudo
    } catch (error) {
      console.error('Error calling Dudo:', error);
    }
  };

  const handleDisplayRules = async () => {
    try {
      setShowRulesModal(true);
      const response = await api.get("/rules");
      setRules(response.data.join("\n"));
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const handleCloseRulesModal = () => {
    setShowRulesModal(false);
  };

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <BaseContainer className="dudo-game-container">
      <h2>Dudo Game</h2>
      <div className="game-info">
        <p>Current Turn: {gameState.currentTurn}</p>
        <p>Current Player: {gameState.currentPlayer}</p>
      </div>
      <div className="game-actions">
        <Button onClick={handleStartGame}>Start Game</Button>
        <Button onClick={handleBid}>Bid</Button>
        <Button onClick={handleDudo}>Dudo</Button>
        <Button onClick={handleDisplayRules}>Display Rules</Button>
      </div>
      {showRulesModal && (
        <div className="rules-modal">
          <div className="rules-content">
            <h2>Rules</h2>
            <p>{rules}</p>
            <Button onClick={handleCloseRulesModal}>Close</Button>
          </div>
        </div>
      )}
    </BaseContainer>
  );
};

export default DudoGame;
