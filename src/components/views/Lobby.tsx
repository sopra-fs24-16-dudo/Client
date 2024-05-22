import React, { useState, useEffect } from "react";
import { api, handleError, client } from "helpers/api";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/Lobby.scss";
import PropTypes from "prop-types";
import AgoraRTC from "agora-rtc-sdk";
import question from "../../images/question.png";
import leaderboard from "../../images/leaderboard.png";

import { getDomain } from "helpers/getDomain";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

interface UserInfo {
  userId: string;
  token: string;
}

type AgoraEvent = "user-published" | "user-unpublished";

const Lobby = () => {
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState([]);
  const [allReady, setAllReady] = useState(false);
  const navigate = useNavigate();
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState([]);
  const lobbyId = localStorage.getItem("lobbyId");
  const userId = localStorage.getItem("id");
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const websocket = new SockJS(`${getDomain()}/ws`);
    const stompClient = Stomp.over(websocket);
    stompClient.connect({}, () => {
      console.log("Connected to Stomp server");
      stompClient.subscribe(`/topic/lobby/${lobbyId}`, (message) => {
        console.log("Received message from lobby channel:", message.body);
        const parsedMessage = JSON.parse(message.body);
        const updatedUserList = parsedMessage.players;
        setUsers(updatedUserList);
        const updateAdmin = parsedMessage.adminId;
        setAdmin(updateAdmin)
      });
      stompClient.subscribe(`/topic/kick/${userId}`, (message) => {
        console.log("Received kick message:", message.body);
        window.location.href = "/homepage";
      });
      stompClient.subscribe(`/topic/start/${lobbyId}`, (message) => {
        console.log("Game started:", message.body);
        window.location.href = "/game/" + lobbyId;
      });
    }, (error) => {
      console.error("Error connecting to Stomp server:", error);
    });

    return () => {
      stompClient.disconnect(() => {
        console.log("Disconnected from Stomp server");
      });
      websocket.close();
    };
  }, [lobbyId, setUsers]);


  useEffect(() => {
    async function fetchUsersInLobby () {
      try {
        console.log("LobbyID:", lobbyId);
        const response = await api.get(`/lobby/players/${lobbyId}`);
        setUsers(response.data);
        const allReady = response.data.every((user) => user.ready);
        setAllReady(allReady);
        const adminId = await api.get(`/lobby/admin/${lobbyId}`);
        setAdmin(adminId.data);
        console.log("Admin:", adminId.data);
      } catch (error) {
        console.error("Error fetching users in lobby:", error);
      }
    };
    fetchUsersInLobby();
  }, [lobbyId]);

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
      await api.put(`/lobby/player/${lobbyId}/ready`, requestBody);
      const response = await api.get(`/lobby/players/${lobbyId}`);

      const state = { from: "Lobby" };
      sessionStorage.setItem("navigationState", JSON.stringify(state));
      console.log("Session Storage after having been in Lobby is: ", sessionStorage.getItem("navigationState"));

      const updatedUsers = response.data;
      const allReady = updatedUsers.every((user) => user.ready);
      const enoughPlayers = updatedUsers.length >= 2;
      if (allReady && enoughPlayers) {
        await api.post(`/lobby/start/${lobbyId}`);
      }
    } catch (error) {
      console.error("Error toggling ready status:", error);
    }
  };

  const leaveLobby = async () => {
    try {
      const requestBody = JSON.stringify(userId);
      await api.post(`/lobby/exit/${lobbyId}`, requestBody);
      navigate("/homepage");
    } catch (error) {
      alert(
        `Failed to leave the lobby: \n${handleError(error)}`
      );
    }
  };

  const kickPlayer = async (userIdToKick) => {
    try {
      const requestBody = JSON.stringify( userIdToKick );
      await api.post(`/lobby/kick/${lobbyId}/${userIdToKick}`, requestBody);
    } catch (error) {
      console.error("Error kicking player:", error);
    }
  };
  const showRules = async () => {
    setShowRulesModal(true)
  };

  const showLeaderboard = async () => {
    try {
      const response = await api.get(`/leaderboard/${lobbyId}`);
      const leaderboardData = response.data.split(",").map(playerData => {
        const [username, points] = playerData.split(" ");

        return { username, points: points ? parseInt(points) : 0 };
      });
      leaderboardData.sort((a, b) => b.points - a.points);
      setLeaderboardData(leaderboardData);
      setShowLeaderboardModal(true);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  }

  return (
    <BaseContainer className="lobby container">
      <div className="user-list">
        <h2>Lobby id: {lobbyId}</h2>
        <h3>Users in Lobby:</h3>
      </div>
      <div className="user-list">
        <ul>
          {Object.keys(users).map((playerId) => {
            const player = users[playerId];

            return (
              <div key={playerId} className="user">
                <span>
                  {player.username} {player.ready ? "- Ready" : ""}
                </span>
                {player.id !== admin && admin.toString() === userId && (
                  <Button onClick={() => kickPlayer(player.id)}>Kick</Button>
                )}
              </div>
            );
          })}
        </ul>
        <a href="#" className="question-image" onClick={showRules}>
          <img src={question} alt="Question" width="80px" height="80px" />
        </a>
        <a href="#" className="leaderboard-image" onClick={showLeaderboard}>
          <img src={leaderboard} alt="Leaderboard" width="110px" height="110px" />
        </a>
      </div>
      <div className="button-container">
        <Button onClick={() => toggleReadyStatus()}>Ready</Button>
        <Button onClick={leaveLobby}>Leave Lobby</Button>
      </div>
      <div>
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
      {showLeaderboardModal && (
        <div className="leaderboard-modal">
          <div className="leaderboard-content">
            <h2>Leaderboard</h2>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player, index) => (
                  <tr key={index}>
                    <td>{player.username}</td>
                    <td>{player.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <footer>
              <div> Win with two chips: 2pts</div>
              <div> Win with less than two chips: 1pt</div>
            </footer>
            <Button onClick={() => setShowLeaderboardModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </BaseContainer>
  );
};

export default Lobby;