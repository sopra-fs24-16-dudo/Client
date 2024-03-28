import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/Lobby.scss";

const Lobby = () => {
  const [users, setUsers] = useState([]);
  const [allReady, setAllReady] = useState(false);
  const navigate = useNavigate();
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState("");

  useEffect(() => { 

    async function fetchUsersInLobby () {
      try {
        const lobbyId = localStorage.getItem("lobbyId");
        console.log("LobbyID:", lobbyId);
        const response = await api.get(`/lobby/user/${lobbyId}`);
        setUsers(response.data);
        // Check if all users are ready
        // const allReady = response.data.every((user) => user.ready);
        // setAllReady(allReady);
      } catch (error) {
        console.error("Error fetching users in lobby:", error);
      }
    };
    fetchUsersInLobby();
  }, []);

  useEffect(() => {
    async function fetchRules() {
      try {
        const response = await api.get("/rules");
        setRules(response.data);
      } catch (error) {
        console.error("Error fetching rules:", error);
      }
    }
    if (showRulesModal) {
      fetchRules();
    }
  }, [showRulesModal]);

  const toggleReadyStatus = async () => {
    try {
      const updatedUsers = users.map((user) =>
        user.id === localStorage.getItem("id") ? { ...user, ready: !user.ready } : user
      );
      setUsers(updatedUsers);
      // Check if all users are ready
      const allReady = updatedUsers.every((user) => user.ready);
      setAllReady(allReady);
    } catch (error) {
      console.error("Error toggling ready status:", error);
    }
  };

  const leaveLobby = async () => {
    try {
      const lobbyId = localStorage.getItem("lobbyId");
      const userId = localStorage.getItem("id");
      const requestBody = JSON.stringify(userId);
      await api.post(`/lobby/exit/${lobbyId}`, requestBody);

      localStorage.removeItem("lobbyId");
      //await api.delete(⁠ /lobby/user/${lobbyId}/${localStorage.getItem("id")} ⁠);
      navigate("/homepage"); // Navigate back to the Homepage
    } catch (error) {
      alert(
        `Failed to leave the lobby: \n${handleError(error)}`
      );
    }
  };

  const startGame = async () => {
    try {
      await api.post("/lobby/start");
      // Optionally, navigate to the gameplay screen
    } catch (error) {
      alert(
        `Failed to start the game: \n${handleError(error)}`
      );
    }
  };

  const showRules = async () => {
    setShowRulesModal(true)
  };

  return (
    <BaseContainer className="lobby container">
      <h2>Lobby</h2>
      <div className="user-list">
        <h3>Users in Lobby:</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
        <a href="#" className="question-image" onClick={showRules}>
          <img src="/assets/Question.png" alt="Question" width="80px" height="80px" />
        </a>
      </div>
      <div className="button-container">
        <Button onClick={toggleReadyStatus}>
          {users.find((user) => user.id === localStorage.getItem("id"))?.ready ? "Unready" : "Ready"}
        </Button>
        <Button onClick={leaveLobby}>Leave Lobby</Button>
        {allReady && <Button onClick={startGame}>Start Game</Button>}
      </div>
      {showRulesModal && (
        <div className="rules-modal">
          <div className="rules-content">
            <h2>Rules</h2>
            <p>{rules}</p>
            <Button onClick={() => setShowRulesModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </BaseContainer>
  );
};

export default Lobby;