import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/Lobby.scss";
import PropTypes from "prop-types";

const FormField = (props) => {
  return (
    <div className="chat field">
      <input
        className="chat input"
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormField.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

const Lobby = () => {
  const [users, setUsers] = useState([]);
  const [allReady, setAllReady] = useState(false);
  const navigate = useNavigate();
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState([]);
  const lobbyId = localStorage.getItem("lobbyId");
  const userId = localStorage.getItem("id");
  const [message, setMessage] = useState("");

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
      const requestBody = JSON.stringify(userId);
      // Send request to update readiness status to the server
      await api.put(`/lobby/user/${lobbyId}/ready`, requestBody);

      // Check if all users are ready after the update
      const response = await api.get(`/lobby/user/${lobbyId}/ready`);
      setAllReady(response.data);

      if (response.data) {
        navigate("/game");
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

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = () => {
    if (message.trim() !== "") {
      sendMessage();
      setMessage(""); // Clear the input field after sending the message
    }
  };

  const sendMessage = async () => {
    //try {
    // const requestBody = { username: localStorage.getItem("username"), message: message };
    //  await api.post(`/lobby/${lobbyId}/chat`, requestBody);
    // Optionally, you can fetch the updated chat messages here if needed
    // } catch (error) {
    // console.error("Error sending message:", error);
    // }
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
          <img src="/Question.png" alt="Question" width="80px" height="80px" />
        </a>
      </div>
      <div className="button-container">
        <Button onClick={() => toggleReadyStatus()}>Ready</Button>
        <Button onClick={leaveLobby}>Leave Lobby</Button>
      </div>
      {showRulesModal && (
        <div className="rules-modal">
          <div className="rules-content">
            <h2>Rules</h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {rules.map((rule, index) => (
                <p key={index}>{rule}</p>
              ))}
            </div>
            <Button onClick={() => setShowRulesModal(false)}>Close</Button>
          </div>
        </div>
      )}
      <div className="chat container" >
        {/* Other chat content */}
        <FormField
          placeholder="Type something..."
          value={message}
          onChange={(m) => setMessage(m)}
        />
        <Button
          width="30%"
          style={{ position: "absolute", bottom: "10", right: "0" }}
          onClick={() => sendMessage()}
          className="chat button"
        >
          Send
        </Button>
      </div>
    </BaseContainer>
  );
};

export default Lobby;