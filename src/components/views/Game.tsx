import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/Game.scss";
import PropTypes from "prop-types";
import question from "../../images/question.png";
import chips from "../../images/poker_chip.png";
import nine from "../../images/dice/nine.png";
import ten from "../../images/dice/ten.png";
import jack from "../../images/dice/jack.png";
import queen from "../../images/dice/queen.png";
import king from "../../images/dice/king.png";
import ace from "../../images/dice/ace.png";

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

const suitImages = {
  NINE: nine,
  TEN: ten,
  JACK: jack,
  QUEEN: queen,
  KING: king,
  ACE: ace,
};

const Game = () => {
  // Game state variables
  const [players, setPlayers] = useState([]); // You'll update this with actual player data
  const [currentBid, setCurrentBid] = useState(1); // Example initial state
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState("");
  const lobbyId = localStorage.getItem("lobbyId");
  const [hand, setHand] = useState([]);
  const gameId = localStorage.getItem("lobbyId");
  const userId = localStorage.getItem("id");
  const currentPlayerId = parseInt(localStorage.getItem("currentPlayerId"));

  //dice
  const [die1, setDie1] = useState({ suit: "NINE" });
  const [die2, setDie2] = useState({ suit: "TEN" });
  const [die3, setDie3] = useState({ suit: "JACK" });
  const [die4, setDie4] = useState({ suit: "QUEEN" });
  const [die5, setDie5] = useState({ suit: "KING" });

  // Functions to handle game actions
  // ... other game functions like sendMessage from Lobby

  useEffect(() => { 

    async function fetchUsersInLobby () {
      try {
        console.log("LobbyID:", lobbyId);
        const response = await api.get(`/games/players/${lobbyId}`);
        console.log("response", response.data);
        setPlayers(response.data);
        console.log("players: ", players);
      } catch (error) {
        console.error("Error fetching users in lobby:", error);
      }
    };
    fetchUsersInLobby();
    rollHand();
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
      console.log(`/lobby/chat/${lobbyId}/${userId}`)
      const response = await api.post(`/lobby/chat/${lobbyId}/${userId}`, requestBody);
      console.log("Response:", response);
      setMessage("");
    } catch (error) {
      alert(
        `Something went wrong during the registration: \n${handleError(error)}`
      );
    }
  };
  const rollHand = async () => {
    try {
      const requestBody = JSON.stringify(userId);
      const response = await api.post(`/games/hand/${lobbyId}`, requestBody);
      setTimeout(() => {
        setHand(response.data.dices);
        animateDice();
      }, 3000);

      //wait 3 seconds

    } catch (error) {
      console.error("Error rolling the hand:", error);
    }
  };

  const animateDice = () => {
    const diceElements = document.querySelectorAll(".die-image");
    diceElements.forEach((die) => {
      die.classList.remove("rotate-animation"); // Remove the class first
      setTimeout(() => {
        die.classList.add("rotate-animation"); // Add the class after a short delay
      }, 10); // Wait for 10 milliseconds
    });
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
          {players.filter(player => player.id !== currentPlayerId).map((player) => (
            <div className="opponent" key={player.id}>
              <span className="opponent-name">{player.username}</span>
              <div className="opponent-chips">
                {Array.from({ length: player.chips - 1 }).map((_, index) => (
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
      <div className="current-player-container">
        {players.filter(player => player.id === currentPlayerId).map((player) => (
          <div className="current-player" key={player.id}>
            <span className="current-player-name">{player.username}</span>
            <div className="current-player-chips">
              {Array.from({ length: player.chips - 1 }).map((_, index) => (
                <img key={index} src={chips} alt="Chip" className="chip-image" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="game-main">
        <div className="current-bid">Current Bid: {currentBid}</div>

        <div className="hand-container">
          <div className="die-row">
            {hand.slice(0, 2).map((die, index) => (
              <div key={index} className="die">
                <img src={suitImages[die.suit]} alt={die.suit} className="die-image" />
              </div>
            ))}
          </div>
          <div className="die-row">
            <div className="die">
              <img src={suitImages[hand[2]?.suit || ""]} alt={hand[2]?.suit} className="die-image" />
            </div>
          </div>
          <div className="die-row">
            {hand.slice(3, 5).map((die, index) => (
              <div key={index} className="die">
                <img src={suitImages[die.suit]} alt={die.suit} className="die-image" />
              </div>
            ))}
          </div>
        </div>
        {/* Game board, dice, etc. */}
      </div>

      <div className="game-footer">
        <Button onClick={() => bid(currentBid)}>Bid {biggerBid()} Jacks</Button>
        <Button onClick={() => bidOther(currentBid)}>Bid Other</Button>
        <Button onClick={() => bidDudo()}>Dudo</Button>
      </div>

      <div className="chat container">
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
