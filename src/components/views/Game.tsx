import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/Game.scss";
import PropTypes from "prop-types";
import question from "../../images/question.png";
import chips from "../../images/poker_chip.png";

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

const Game = () => {
  // Game state variables
  const [players, setPlayers] = useState([]); // You'll update this with actual player data
  const [currentBid, setCurrentBid] = useState(1); // Example initial state
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState("");
  const gameId = localStorage.getItem("lobbyId");
  const userId = localStorage.getItem("id");

  // Functions to handle game actions
  // ... other game functions like sendMessage from Lobby

  useEffect(() => { 

    async function fetchUsersInLobby () {
      try {
        console.log("LobbyID:", gameId);
        const response = await api.get(`/lobby/user/${gameId}`);
        setPlayers(response.data);
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

  const showRules = async () => {
    setShowRulesModal(true)
  };

  const sendMessage = async () => {
    try {
      const requestBody = JSON.stringify({ message });
      console.log(`/lobby/chat/${gameId}/${userId}`)
      const response = await api.post(`/lobby/chat/${gameId}/${userId}`, requestBody);
      console.log("Response:", response);
      setMessage("");
    } catch (error) {
      alert(
        `Something went wrong during the registration: \n${handleError(error)}`
      );
    }
  };

  const bid = async (oldBid) => {
    if(oldBid === "Dudo"){
      oldBid = 0;
    }
    setCurrentBid(oldBid += 1);
    //Add the bid functionality
  };

  const bidOther = async (inputBid) => {
    //Add the Bid Other functionality!
    setCurrentBid(inputBid);
  };

  const bidDudo = async () => {
    setCurrentBid("Dudo");
    //Add the bidDudo functionality!
  };

  const biggerBid = () => {
    if(currentBid === "Dudo"){
      return 1;
    }

    return currentBid + 1;
    //Add the bid functionality
  };

  return (
    <BaseContainer className="game container">
      <div className="game-header">
        {/* Players at the top */}
        <div className="opponent-container">
          {players.map((player) => (
            <div className="opponent" key={player.id}>
              <span className="opponent-name">{player.username}</span>
              <div className="opponent-chips">{player.chips}
                {Array.from({ length: 2 /* TODO Instead of 2 put player.chips as soon as we have that in backend!! */}).map((_, index) => (
                  <img key={index} src={chips} alt="Chip" className="chip-image" />
                ))}
              </div>
            </div>
          ))}
          <a href="#" className="question-image" onClick={showRules}>
            <img src={question} alt="Question" width="80px" height="80px" />
          </a>
        </div>
      </div>

      <div className="game-main">
        <div className="current-bid">Current Bid: {currentBid}</div>
        {/* Game board, dice, etc. */}
      </div>

      <div className="game-footer">
        <Button onClick={() => bid(currentBid)}>Bid {biggerBid()} Jacks</Button>
        <Button onClick={() => bidOther(currentBid)}>Bid Other</Button>
        <Button onClick={() => bidDudo()}>Dudo</Button>
      </div>

      <div className="chat container" >
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
    </BaseContainer>
  );
};

export default Game;
