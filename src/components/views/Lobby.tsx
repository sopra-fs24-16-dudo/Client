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
  const lobbyId = localStorage.getItem("lobbyId");
  const userId = localStorage.getItem("id");

  useEffect(() => {

    async function fetchUsersInLobby () {
      try {
        console.log("LobbyID:", lobbyId);
        const response = await api.get(`/lobby/user/${lobbyId}`);
        setUsers(response.data);
        const allReady = response.data.every((user) => user.ready);
        setAllReady(allReady);

      } catch (error) {
        console.error("Error fetching users in lobby:", error);
      }
    }
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
      const requestBody = JSON.stringify(userId);
      // Send request to update readiness status to the server
      await api.put(`/lobby/user/${lobbyId}/ready`, requestBody);

      // Check if all users are ready after the update
      const response = await api.get(`/lobby/user/${lobbyId}/ready`);
      setAllReady(response.data);

      if (response.data) {
        // Navigate to the specific game for this lobby
        navigate("/game/${lobbyId}`");
      }
    } catch (error) {
      console.error("Error toggling ready status:", error);
    }
  };

  const leaveLobby = async () => {
    try {
      const requestBody = JSON.stringify(userId);

      await api.post(`/lobby/exit/${lobbyId}`, requestBody);

      navigate("/homepage"); // Navigate back to the Homepage
    } catch (error) {
      alert(
        `Failed to leave the lobby: \n${handleError(error)}`
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
            <li key={user.id}>{user.username}
              {user.username} {user.ready ? "- Ready" : ""}
            </li>
          ))}
        </ul>
        <a href="#" className="question-image" onClick={showRules}>
          <img src="/assets/Question.png" alt="Question" width="80px" height="80px" />
        </a>
      </div>
      <div className="button-container">
        <Button onClick={() => toggleReadyStatus()} >Ready</Button>
        <Button onClick={leaveLobby}>Leave Lobby</Button>
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