import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/Game.scss";
import { useNavigate } from "react-router-dom";
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
  const [currentBid, setCurrentBid] = useState(null);
  const [nextBid, setNextBid] = useState(null);
  const [validBids, setValidBids] = useState([]);
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState("");
  const lobbyId = localStorage.getItem("lobbyId");
  const [hand, setHand] = useState([]);
  const gameId = localStorage.getItem("lobbyId");
  const userId = localStorage.getItem("id");
  const playerId = parseInt(localStorage.getItem("currentPlayerId"));
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [stage, setStage] = useState("selectSuit");
  const uniqueSuits = Array.from(new Set(validBids.map(bid => bid.suit)));
  const [winner, setWinner] = useState(null);
  const navigate = useNavigate();

  const [showBidOtherModal, setShowBidOtherModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  //dice
  const [die1, setDie1] = useState({ suit: "NINE" });
  const [die2, setDie2] = useState({ suit: "TEN" });
  const [die3, setDie3] = useState({ suit: "JACK" });
  const [die4, setDie4] = useState({ suit: "QUEEN" });
  const [die5, setDie5] = useState({ suit: "KING" });

  // Functions to handle game actions
  // ... other game functions like sendMessage from Lobby

  useEffect(() => {

    async function fetchUsersInLobby() {
      try {
        console.log("LobbyID:", lobbyId);
        const response = await api.get(`/games/players/${lobbyId}`);
        console.log("response", response.data);
        setPlayers(response.data);
        console.log("players: ", players);
        const nextBid = await api.get(`/games/nextBid/${lobbyId}`);
        setNextBid(nextBid.data);
        console.log("nextBid: ", nextBid);
        const validBids = await api.get(`/games/validBids/${lobbyId}`);
        setValidBids(validBids.data);
        console.log("validBids: ", validBids);
        console.log("Bid type: ", typeof validBids.data);
        const currentBid = await api.get(`/games/currentBid/${lobbyId}`);
        console.log("Current Bid: ", currentBid.data);
        setCurrentBid(currentBid.data);
        const currentPlayerId = await api.get(`/games/currentPlayer/${lobbyId}`);
        setCurrentPlayerId(currentPlayerId.data);
        console.log("Current Player ID: ", currentPlayerId.data);
        const counter = await api.get(`/games/counter/${lobbyId}`);
        console.log("Counter: ", counter.data);
        const lastPlayerId = await api.get(`/games/lastPlayer/${lobbyId}`);
        console.log("Last Player ID: ", lastPlayerId.data);
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

  const navigatToLobby = () => {
    navigate(`/lobby/${lobbyId}`);
  };

  const showRules = async () => {
    setShowRulesModal(true);
  };

  const sendMessage = async () => {
    try {
      const requestBody = JSON.stringify({ message });
      console.log(`/lobby/chat/${lobbyId}/${userId}`);
      const response = await api.post(`/lobby/chat/${lobbyId}/${userId}`, requestBody);
      console.log("Response:", response);
      setMessage("");
    } catch (error) {
      alert(
        `Something went wrong during the registration: \n${handleError(error)}`,
      );
    }
  };
  const rollHand = async () => {
    try {
      const requestBody = JSON.stringify(userId);
      const response = await api.post(`/games/hand/${lobbyId}`, requestBody);
      setHand(response.data.dices);
      animateDice();

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

  const bid = async (inputBid) => {
    console.log("inputBid: ", inputBid);
    console.log("type of bid: ", typeof inputBid);
    const requestBody = JSON.stringify(inputBid);
    console.log("requestBody: ", requestBody);
    const response = await api.post(`/games/placeBid/${lobbyId}`, requestBody);
    console.log("responseEEEE: ", response);
    //const allHands = await api.get(`/games/hands/${lobbyId}`);
    //console.log("All Hands: ", allHands.data);
    setShowBidOtherModal(false);
  };

  const showBidOther = () => {
    setShowBidOtherModal(true);
  };

  const bidDudo = async () => {
    await api.put(`/games/dudo/${lobbyId}`);
    const loser = await api.get(`/games/loser/${lobbyId}`);
    console.log("loser: ", loser.data);
    const winner = await api.get(`/games/winnerCheck/${lobbyId}`);
    console.log("winner: ", winner.data);
    if (!winner.data) {
      const newRound = await api.put(`/games/round/${lobbyId}`);
      console.log("newRound: ", newRound.data);
      alert(`Loser: ${loser.data.username}`);
      setTimeout(() => {
        window.location.reload(); // This will refresh the page after 5 seconds, effectively closing the alert box
      }, 5000);
    } else {
      const w = await api.get(`/games/winner/${lobbyId}`);
      setWinner(w.data);
      setShowWinnerModal(true);
    }
  };


  return (
    <BaseContainer className="game container">
      <div className="game-header">
        {/* Players at the top */}
        <div className="opponent-container">
          {players.filter(player => player.id !== playerId).map((player) => (
            <div className="opponent" key={player.id}>
              <span
                className={`opponent-name ${player.id === currentPlayerId ? "current" : ""}`}>{player.username}</span>
              <div className="opponent-chips">
                {player.chips === 0 ? (
                  <span className="out-text">OUT</span>
                ) : (
                  Array.from({ length: player.chips - 1 }).map((_, index) => (
                    <img key={index} src={chips} alt="Chip" className="chip-image" />
                  ))
                )}
              </div>
            </div>
          ))}
          <a href="#" className="question-image" onClick={showRules}>
            <img src={question} alt="Question" width="80px" height="80px" />
          </a>
        </div>
      </div>
      <div className="game-main">
        <div className="current-bid">
          Current Bid:
          {currentBid === null || currentBid.includes("null") ? " No current bid" :
            <>
              {currentBid.split(" ")[0] + " "}
              <img src={suitImages[currentBid.split(" ")[1]]} alt={currentBid.split(" ")[1]} width="40px" height="35px" />
            </>
          }
        </div>
        {/* Game board, dice, etc. */}
      </div>
      <div className="player-hand-container">
        <div className="current-player-container">
          {players.filter(player => player.id === playerId).map((player) => (
            <div className="current-player" key={player.id}>
              <span
                className={`current-player-name ${player.id === currentPlayerId ? "current" : ""}`}>{player.username}</span>
              <div className="current-player-chips">
                {player.chips === 0 ? (
                  <span className="out-text">OUT</span>
                ) : (
                  Array.from({ length: player.chips - 1 }).map((_, index) => (
                    <img key={index} src={chips} alt="Chip" className="chip-image" />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
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
      </div>


      <div className="game-footer">
        <Button onClick={() => bid(nextBid)} disabled={playerId !== currentPlayerId}>Bid {nextBid} </Button>
        <Button onClick={showBidOther} disabled={playerId !== currentPlayerId}>Bid Other</Button>
        <Button onClick={() => bidDudo()} disabled={playerId !== currentPlayerId || currentBid.includes("null") || currentBid.suit}>Dudo</Button>
      </div>


      {showBidOtherModal && (
        <div className="bid-other-modal">
          <div className="bid-other-content">
            <h1>Select a bid</h1>
            {stage === "selectAmount" && (
              <img src={suitImages[selectedSuit.toString()]} alt={selectedSuit} className="suit-image" />
            )}
            <div className="bid-grid">
              {stage === "selectSuit" && uniqueSuits.map((suit, index) => (
                <Button key={index} onClick={() => {
                  setSelectedSuit(suit);
                  setStage("selectAmount");
                }}>
                  <img src={suitImages[suit.toString()]} alt={suit} className="suit-image" />
                </Button>
              ))}
              {stage === "selectAmount" && validBids.filter(bids => bids.suit === selectedSuit).map((bids, index) => (
                <Button className="amount-button" key={index} onClick={() => {
                  bid(`${bids.amount} ${bids.suit}`);
                  setShowBidOtherModal(false);
                }}>
                  {bids.amount}
                </Button>
              ))}
            </div>
            <div className="button-container">
              {stage === "selectAmount" &&
                <Button className="close-button" onClick={() => setStage("selectSuit")}>Back</Button>}
              <Button className="close-button" onClick={() => {
                setShowBidOtherModal(false);
                setStage("selectSuit");
                setSelectedSuit(null);
              }}>Close</Button>
            </div>
          </div>
        </div>
      )}

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

      {showWinnerModal && (
        <div className="winner-modal">
          <div className="winner-content">
            <h1>Congratulations {winner.username}!</h1>
            <p>You are the winner!</p>
            <Button onClick={() => {
              setShowWinnerModal(false);
              navigatToLobby(); // This will redirect the user back to the lobby page
            }}>Back to Lobby</Button>
          </div>
        </div>
      )}
    </BaseContainer>
  );
};

export default Game;
