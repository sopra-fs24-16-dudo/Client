import React, { useEffect, useState, useRef } from "react";
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
import jazz from "../../sounds/GameJazzMusic.mp3";
import { getDomain } from "helpers/getDomain";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
//Imports for the Voice chat API
import AgoraRTC, { IRemoteAudioTrack } from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";

const suitImages = {
  NINE: nine,
  TEN: ten,
  JACK: jack,
  QUEEN: queen,
  KING: king,
  ACE: ace,
};


interface AudioSubscription {
  track: IRemoteAudioTrack;
  isPlaying: boolean; // This flag will indicate if the audio is currently being played
}

interface AudioSubscriptions {
  [userId: string]: AudioSubscription;
}
const Game = () => {
  // Game state variables
  const [players, setPlayers] = useState([]);
  const [currentBid, setCurrentBid] = useState(null);
  const [nextBid, setNextBid] = useState(null);
  const [validBids, setValidBids] = useState([]);
  const [rules, setRules] = useState([]);
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
  const [loser, setLoser] = useState(null);
  const navigate = useNavigate();
  const [showBidOtherModal, setShowBidOtherModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showLoserModal, setShowLoserModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  //dice
  const [die1, setDie1] = useState({ suit: "NINE" });
  const [die2, setDie2] = useState({ suit: "TEN" });
  const [die3, setDie3] = useState({ suit: "JACK" });
  const [die4, setDie4] = useState({ suit: "QUEEN" });
  const [die5, setDie5] = useState({ suit: "KING" });
  //Voice chat
  const APP_ID = "cd2162615d2f426da1c1b565bb447f17"; //agora app id from website hosting the website
  const TEMP_TOKEN = null // token for security
  const [rtc, setRtc] = useState({
    client: null,
    localAudioTrack: null
  });
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioSubscriptions, setAudioSubscriptions] = useState<AudioSubscriptions>({});
  const audioRef = useRef(null);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
    }}, []);


  /////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////AGORA////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    async function initAgora() {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setRtc(prevState => ({ ...prevState, client }));
      try {
        await client.join(APP_ID, lobbyId, TEMP_TOKEN, userId);  // Adjust 'userId' to be the current user
        const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish(localAudioTrack);
        setRtc(prevState => ({ ...prevState, localAudioTrack }));

        client.on("user-published", async (user, mediaType) => {
          if (mediaType === "audio") {
            await client.subscribe(user, mediaType);
            const audioTrack = user.audioTrack;
            setAudioSubscriptions(prev => {
              const isPlaying = prev[user.uid]?.isPlaying ?? true;  // Default to true if not already in subscriptions

              return {
                ...prev,
                [user.uid]: { track: audioTrack, isPlaying }
              };
            });
            if (audioSubscriptions[user.uid]?.isPlaying !== false) { // <-- Added check here
              audioTrack.play();  // Start playing by default
              console.log(`Subscribed and started playing audio from user ${user.uid}`);
            }
          }
        });

        client.enableAudioVolumeIndicator();
        client.on("volume-indicator", (volumes) => {
          volumes.forEach(({ uid, level }) => {
            if (level > 5) {
              setActiveSpeaker(uid);
            }
          });
        });
      } catch (error) {
        console.error("AgoraRTC client join failed", error);
      }
    }

    initAgora();

    return () => {
      if (rtc.client) {
        rtc.client.leave();
        rtc.client.removeAllListeners();
        Object.values(audioSubscriptions).forEach((subscription: AudioSubscription) => {
          subscription.track.stop();
          rtc.client.unsubscribe(subscription.track);
        });
      }
      rtc.localAudioTrack?.close();
    };
  }, []); // Empty dependency array means this effect only runs once after initial render
  const toggleMute = async () => {
    if (rtc.localAudioTrack) {
      const newMutedState = !isMuted;
      await rtc.localAudioTrack.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const toggleAudioPlay = async (userId) => {
    setAudioSubscriptions(prev => {
      const currentSubscription = prev[userId];
      if (currentSubscription) {
        const newIsPlaying = !currentSubscription.isPlaying;
        if (newIsPlaying) {
          rtc.client.subscribe(currentSubscription.track, "audio");
          currentSubscription.track.play();
        } else {
          currentSubscription.track.stop();
          rtc.client.unsubscribe(currentSubscription.track);
        }

        return {
          ...prev,
          [userId]: { ...currentSubscription, isPlaying: newIsPlaying }
        };
      }

      return prev;
    });
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////


  const playersToArray = (playersObj) => {
    return Object.values(playersObj);
  };
  // Functions to handle game actions
  // ... other game functions like sendMessage from Lobby
  useEffect(() => {
    const websocket = new SockJS(`${getDomain()}/ws`);
    const stompClient = Stomp.over(websocket);
    stompClient.connect({}, () => {
      console.log("Connected to Stomp server");
      stompClient.subscribe(`/topic/lobby/${lobbyId}`, (message) => {
        console.log("Received message from lobby channel:", message.body);
        const parsedMessage = JSON.parse(message.body);
        console.log("players object in message:", parsedMessage.players);
        const playersArray = playersToArray(parsedMessage.players);
        setPlayers(playersArray);
        if (parsedMessage.nextBid !== null) {
          setNextBid(parsedMessage.nextBid.amount + " " + parsedMessage.nextBid.suit);
        }
        else {
          setNextBid("null");
        }
        setCurrentBid(parsedMessage.currentBid);
        console.log ("current bid WS: ", currentBid)
        console.log("current bid WS type: ", typeof parsedMessage.currentBid)
        setCurrentPlayerId(parsedMessage.currentPlayer.id);
        checkWinner();
        rollHand();
      });
    }, (error) => {
      console.error("Error connecting to Stomp server:", error);
    });

    // Cleanup-Funktion

    return () => {
      stompClient.disconnect(() => {
        console.log("Disconnected from Stomp server");
      });
      websocket.close();
    };
  }, [lobbyId]);

  useEffect(() => {
    async function fetchUsersInLobby() {
      try {
        const response = await api.get(`/games/players/${lobbyId}`);
        setPlayers(response.data);
        const nextBid = await api.get(`/games/nextBid/${lobbyId}`);
        setNextBid(nextBid.data);
        const validBids = await api.get(`/games/validBids/${lobbyId}`);
        setValidBids(validBids.data);
        const currentBidResponse = await api.get(`/games/currentBid/${lobbyId}`);
        let currentBid = null;
        if (currentBidResponse.data.toLowerCase() !== "null") {
          const currentBidData = currentBidResponse.data.split(" ");
          currentBid = {
            amount: parseInt(currentBidData[0]),
            suit: currentBidData[1]
          };
        }
        setCurrentBid(currentBid);
        console.log("current bid: ", currentBid);
        const currentPlayerId = await api.get(`/games/currentPlayer/${lobbyId}`);
        setCurrentPlayerId(currentPlayerId.data);
      } catch (error) {
        console.error("Error fetching users in lobby:", error);
      }
    };
    fetchUsersInLobby();
    rollHand();


  }, []);

  useEffect(() => {
    async function fetchHand() {
      console.log("currentBid has changed:", currentBid);
      if (!currentBid || currentBid.suit === null || currentBid.suit === "null") {
        animateDice();
      }
      const validBids = await api.get(`/games/validBids/${lobbyId}`);
      setValidBids(validBids.data);
    }
    fetchHand();
  }, [currentBid]);

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

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        console.log("Microphone permissions granted and audio stream created");
      })
      .catch((error) => {
        console.error("Microphone permissions denied or audio stream creation failed", error);
      });
  }, []);

  useEffect(() => {
    AgoraRTC.getDevices().then(devices => {
      const audioOutputDevices = devices.filter(device => device.kind === "audiooutput");
      if (audioOutputDevices.length > 0) {
        console.log("Audio Output Devices:", audioOutputDevices);
      }
    });
  }, []);


  const navigatToLobby = () => {
    navigate(`/lobby/${lobbyId}`);
  };

  const checkWinner = async () => {
    const winner = await api.get(`/games/winnerCheck/${lobbyId}`);
    if (winner.data) {
      const w = await api.get(`/games/winner/${lobbyId}`);
      setWinner(w.data);
      setShowWinnerModal(true);
    }else {
      checkLoser();
    }
    console.log("winner: ", winner.data);
  }

  const checkLoser = async () => {
    const loser = await api.get(`/games/loser/${lobbyId}`);
    if (loser.data) {
      setLoser(loser.data);
      setShowLoserModal(true);
      let countdownTimer = setInterval(() => {
        setCountdown(prevCountdown => prevCountdown > 0 ? prevCountdown - 1 : 0);
      }, 1000);
      setTimeout(() => {
        setShowLoserModal(false);
        setCountdown(5);
        clearInterval(countdownTimer); // Clear the interval here
      }, 5000);
    }
    console.log("loser: ", loser.data);
  }
  const showRules = async () => {
    setShowRulesModal(true);
  };
  const rollHand = async () => {
    try {
      const requestBody = JSON.stringify(userId);
      const response = await api.post(`/games/hand/${lobbyId}`, requestBody);
      setHand(response.data.dices);
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
      setTimeout(async() => {
        const newRound = await api.put(`/games/round/${lobbyId}`);
        console.log("newRound: ", newRound.data);
      }, 5000);

    }
  };

  useEffect(() => {
    if (winner !== null) {
      setShowWinnerModal(true);
      endGame()
    }
  }, [winner]);
  const endGame = async () => {
    try {
      await api.put(`/games/end/${lobbyId}`);
      console.log("update user", userId)
    } catch (error) {
      console.error("Error ending the game:", error);
    }
  };

  return (
    <BaseContainer className="game container">
      <div>
        <audio ref={audioRef} src={jazz} autoPlay loop/>
      </div>
      <div className="game-header">
        {/* Players at the top */}
        <div className="opponent-container">
          {players.filter(player => player.id !== playerId).map((player) => (
            <div className="opponent" key={player.id} style={{
              border: player.id === activeSpeaker ? "2px solid #4CAF50" : "none",
              fontWeight: player.id === activeSpeaker ? "bold" : "normal",
              fontColor: player.id === activeSpeaker ? "green" : "white"
            }}>
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
              <Button onClick={() => toggleAudioPlay(player.id)}>
                {audioSubscriptions[player.id]?.isPlaying ? "Stop Listening" : "Start Listening"}
              </Button>
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
          {!currentBid || currentBid.suit === null || currentBid.suit === "null" ? " No current bid" :
            <>
              {currentBid.amount + " "}
              <img src={suitImages[currentBid.suit]} alt={currentBid.suit} width="40px"
                height="35px" />
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
        <Button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</Button>
        <Button onClick={() => bid(nextBid)} disabled={validBids.length === 0 || playerId !== currentPlayerId}>
          {validBids.length === 0 ? "Bid" : `Bid ${nextBid}`}
        </Button>
        <Button onClick={showBidOther} disabled={validBids.length === 0 || playerId !== currentPlayerId}>Bid Other</Button>
        <Button onClick={() => bidDudo()} disabled={playerId !== currentPlayerId || !currentBid || currentBid.suit === null || currentBid.suit === "null"}>Dudo</Button>
        {winner !== null && (
          <Button onClick={endGame}>End Game</Button>
        )}
      </div>
      {showBidOtherModal && (
        <div className="bid-other-modal">
          <div className="bid-other-content">
            <h1>Select a bid</h1>
            {stage === "selectAmount" && (<img src={suitImages[selectedSuit.toString()]} alt={selectedSuit} className="suit-image" />)}
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
                  setStage("selectSuit");
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
            {winner.id === playerId ? (
              <>
                <h1>Congratulations {winner.username}!</h1>
                <p>You are the winner!</p>
              </>
            ) : (
              <>
                <h1>{winner.username} has won the game!</h1>
                <p>Better luck next time!</p>
              </>
            )}
            <Button onClick={() => {
              setShowWinnerModal(false);
              navigatToLobby(); // This will redirect the user back to the lobby page
            }}>Back to Lobby</Button>
          </div>
        </div>
      )}
      {showLoserModal && (
        <div className="loser-modal">
          <div className="loser-content">
            <h1>{loser.username} lost a coin!</h1>
            <p>The next round will start in {countdown} seconds</p>
          </div>
        </div>
      )}
    </BaseContainer>
  );
};

export default Game;