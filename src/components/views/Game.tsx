import React, { useEffect, useState, useRef } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/Game.scss";
import { useNavigate } from "react-router-dom";
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
import AgoraRTC, { IRemoteAudioTrack, IAgoraRTCClient } from "agora-rtc-sdk-ng";
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
  isPlaying: boolean;
}

interface AudioSubscriptions {
  [userId: string]: AudioSubscription;
}

const Game = () => {
  const [players, setPlayers] = useState([]);
  const [currentBid, setCurrentBid] = useState(null);
  const [nextBid, setNextBid] = useState(null);
  const [validBids, setValidBids] = useState([]);
  const [rules, setRules] = useState([]);
  const lobbyId = localStorage.getItem("lobbyId");
  const [hand, setHand] = useState([]);
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
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isRolling, setIsRolling] = useState(false);
  const suits = ["NINE", "TEN", "JACK", "QUEEN", "KING", "ACE"];
  const [isFijo, setIsFijo] = useState(false);
  const [die1, setDie1] = useState({ suit: "NINE" });
  const [die2, setDie2] = useState({ suit: "TEN" });
  const [die3, setDie3] = useState({ suit: "JACK" });
  const [die4, setDie4] = useState({ suit: "QUEEN" });
  const [die5, setDie5] = useState({ suit: "KING" });
  //Voice chat
  const APP_ID = "cd2162615d2f426da1c1b565bb447f17"; //agora app id from website hosting the website
  const TEMP_TOKEN = null; // token for security
  const [rtc, setRtc] = useState({
    client: null,
    localAudioTrack: null,
  });

  const [usersInVoiceChannel, setUsersInVoiceChannel] = useState([]);
  const [isInVoiceChannel, setIsInVoiceChannel] = useState(false);
  const [isCurrentUserInVC, setIsCurrentUserInVC] = useState(true);

  const [isMuted, setIsMuted] = useState(false);
  const [audioSubscriptions, setAudioSubscriptions] = useState<AudioSubscriptions>({});
  const [volumeToggle, setVolumeToggle] = useState({});

  const [isMicAvailable, setIsMicAvailable] = useState(true);
  const muteButtonClass = !isMicAvailable ? "disabled-button" : "";
  const [volume, setVolume] = useState(0.1);

  const audioRef = useRef(null);
  const [navigationEntry] = performance.getEntriesByType("navigation");
  if (navigationEntry) {
    switch (navigationEntry["type"]) {
    case "navigate":
      console.log("User navigated to the page");
      location.reload();
      break;
    case "back_forward":
      console.log("User used back/forward button");
      location.reload();
      break;
    case "prerender":
      console.log("Page was prerendered");
      location.reload();
      break;
    default:
      break;
    }
  }

  const playersToArray = (playersObj) => {
    return Object.values(playersObj);
  };
  useEffect(() => {
    const state = { from: "Game" };
    sessionStorage.setItem("navigationState", JSON.stringify(state));

    const websocket = new SockJS(`${getDomain()}/ws`);
    const stompClient = Stomp.over(websocket);
    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/lobby/${lobbyId}`, (message) => {
        const parsedMessage = JSON.parse(message.body);
        const playersArray = playersToArray(parsedMessage.players);
        setPlayers(playersArray);
        if (parsedMessage.nextBid !== null) {
          setNextBid(parsedMessage.nextBid.amount + " " + parsedMessage.nextBid.suit);
        }
        else {
          setNextBid("null");
        }
        setCurrentBid(parsedMessage.currentBid);
        setCurrentPlayerId(parsedMessage.currentPlayer.id);
        checkWinner();
        rollHand();
      });
    }, (error) => {
      console.error("Error connecting to Stomp server:", error);
    });

    return () => {
      stompClient.disconnect(() => {
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
        const currentPlayerId = await api.get(`/games/currentPlayer/${lobbyId}`);
        setCurrentPlayerId(currentPlayerId.data);
        const fijo = await api.get(`/games/fijoCheck/${lobbyId}`);
        setIsFijo(fijo.data);
      } catch (error) {
        console.error("Error fetching users in lobby:", error);
      }
    };
    fetchUsersInLobby();
    rollHand();


  }, []);

  useEffect(() => {
    async function fetchHand() {
      const fijo = await api.get(`/games/fijoCheck/${lobbyId}`);
      setIsFijo(fijo.data);
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

  const navigatToLobby = () => {
    navigate(`/lobby/${lobbyId}`);
  };

  const checkWinner = async () => {
    const winner = await api.get(`/games/winnerCheck/${lobbyId}`);
    if (winner.data) {
      const w = await api.get(`/games/winner/${lobbyId}`);
      setWinner(w.data);
      setShowWinnerModal(true);
    } else {
      checkLoser();
    }
  }

  const checkLoser = async () => {
    const loser = await api.get(`/games/loser/${lobbyId}`);
    if (loser.data) {
      const r = await api.get(`/games/fijoCheck/${lobbyId}`);
      setIsFijo(loser.data.chips === 1)
      setLoser(loser.data);
      setShowLoserModal(true);
      let countdownTimer = setInterval(() => {
        setCountdown(prevCountdown => prevCountdown > 0 ? prevCountdown - 1 : 0);
      }, 1000);
      setTimeout(() => {
        setShowLoserModal(false);
        setCountdown(5);
        clearInterval(countdownTimer);
      }, 5000);
    }
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
      die.classList.remove("rotate-animation");
      setTimeout(() => {
        startRolling();
        die.classList.add("rotate-animation");
      }, 10);
    });
  };

  // Function to start the dice rolling
  const startRolling = () => {
    setIsRolling(true);
    const rollInterval = setInterval(() => {
      setDie1({ suit: suits[Math.floor(Math.random() * suits.length)] });
      setDie2({ suit: suits[Math.floor(Math.random() * suits.length)] });
      setDie3({ suit: suits[Math.floor(Math.random() * suits.length)] });
      setDie4({ suit: suits[Math.floor(Math.random() * suits.length)] });
      setDie5({ suit: suits[Math.floor(Math.random() * suits.length)] });
    }, 200);

    setTimeout(() => {
      clearInterval(rollInterval);
      setIsRolling(false);
      rollHand();
    }, 2500);
  };
  const bid = async (inputBid) => {
    const requestBody = JSON.stringify(inputBid);
    await api.post(`/games/placeBid/${lobbyId}`, requestBody);
    setShowBidOtherModal(false);
  };
  const showBidOther = () => {
    setShowBidOtherModal(true);
  };
  const bidDudo = async () => {
    await api.put(`/games/dudo/${lobbyId}`);
    const winner = await api.get(`/games/winnerCheck/${lobbyId}`);
    if (!winner.data) {
      setTimeout(async() => {
        await api.put(`/games/round/${lobbyId}`);
      }, 5000);

    }else {
      endGame();
    }
  };

  useEffect(() => {
    if (winner !== null) {
      setShowWinnerModal(true);
    }
  }, [winner]);
  const endGame = async () => {
    try {
      const reqBody = JSON.stringify({playerId});
      await api.put(`/games/end/${lobbyId}`);
    } catch (error) {
      console.error("Error ending the game:", error);
    }
  };

  const handleLeaveConfirmation = () => {
    setShowLeaveConfirmation(!showLeaveConfirmation);
  };

  const leaveGame = async () => {
    try {
      leaveVoiceChannel();
      const reqBody = JSON.stringify({ playerId });
      await api.post(`/games/exit/${lobbyId}`, playerId);
      navigate("/homepage");
    } catch (error) {
      console.error("Error leaving the game:", error);
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////AGORA////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  const joinVoiceChannel = async () => {
    try {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setRtc(prevState => ({ ...prevState, client }));

      await client.join(APP_ID, lobbyId, TEMP_TOKEN, userId);
      // Always request permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      await client.publish(localAudioTrack);

      setRtc(prevState => ({ ...prevState, localAudioTrack }));

      setupClientEventHandlers(client);

      setIsInVoiceChannel(true);
      setUsersInVoiceChannel(prev => [...prev, userId]);

      // Check if there are existing remote users and subscribe to their audio tracks
      const remoteUsers = client.remoteUsers;
      for (const remoteUser of remoteUsers) {
        if (remoteUser.hasAudio) {
          await client.subscribe(remoteUser, "audio");
          const audioTrack = remoteUser.audioTrack;
          setAudioSubscriptions(prev => ({
            ...prev,
            [remoteUser.uid]: { track: audioTrack, isPlaying: true }
          }));
          audioTrack.play();
        }
      }

      await checkMicrophoneAvailability();
    } catch (error) {
      console.error("Error joining channel:", error);
      setIsMicAvailable(false);
    }
  };

  const leaveVoiceChannel = async () => {
    try {
      if (rtc.client) {
        rtc.client.leave();
        rtc.localAudioTrack?.close();

        setRtc({ client: null, localAudioTrack: null });
        setIsInVoiceChannel(false);
        setUsersInVoiceChannel(prev => prev.filter(id => id !== userId));
      }
    } catch (error) {
      console.error("Error leaving the voice channel:", error);
    }
  };

  useEffect(() => {
    joinVoiceChannel();

    return () => {
      leaveVoiceChannel();
      cleanupAgora();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (rtc.client) {
        const isInVC = checkUserInVoiceChannel(userId);
        setIsCurrentUserInVC(isInVC);

        if (!isInVC) {
          try {
            await leaveVoiceChannel();
            await joinVoiceChannel();
          } catch (error) {
            console.error("Error rejoining channel:", error);
          }
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [rtc.client, userId, lobbyId, setRtc, location.pathname]);


  const checkMicrophoneAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === "audioinput");

      if (audioInputDevices.length === 0) {
        setIsMicAvailable(false);
      } else {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setIsMicAvailable(true);
        } catch {
          setIsMicAvailable(false);
        }
      }
    } catch {
      console.log("Error checking microphone availability:");
    }
  };

  const setupClientEventHandlers = (client: IAgoraRTCClient) => {
    client.on("user-published", async (user, mediaType: "audio") => {
      toggleMute();
      toggleMute();
      if (mediaType === "audio") {
        await client.subscribe(user, mediaType);
        const audioTrack = user.audioTrack;
        setAudioSubscriptions((prev) => {
          const isPlaying = prev[user.uid]?.isPlaying ?? true;

          return {
            ...prev,
            [user.uid]: { track: audioTrack, isPlaying },
          };
        });
        if (audioSubscriptions[user.uid]?.isPlaying !== false) {
          audioTrack.play();
        }
        setUsersInVoiceChannel((prev) => [...prev, user.uid]);
      }
    });

    client.on("user-unpublished", (user, mediaType: "audio") => {
      if (mediaType === "audio") {
        setAudioSubscriptions((prev) => {
          const { [user.uid]: _, ...rest } = prev;

          return rest;
        });
        setUsersInVoiceChannel((prev) => prev.filter((uid) => uid !== user.uid));
      }
    });

    client.enableAudioVolumeIndicator();
  };

  const cleanupAgora = () => {
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

  const toggleMute = async () => {
    if (!isMicAvailable) return;
    if (rtc.localAudioTrack) {
      const newMutedState = !isMuted;
      await rtc.localAudioTrack.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const checkUserInVoiceChannel = async (userId) => {
    if (rtc.client) {
      const remoteUsers = rtc.client.remoteUsers;

      return remoteUsers.some(user => user.uid === userId);
    }

    return false;
  };

  const handleVolumeChange = (userId, volume) => {
    setAudioSubscriptions((prev) => {
      const currentSubscription = prev[userId];
      if (currentSubscription) {
        currentSubscription.track.setVolume(volume);

        return {
          ...prev,
          [userId]: { ...currentSubscription, volume },
        };
      }

      return prev;
    });
  };

  return (
    <BaseContainer className="game container">
      <div className="music-bar">
        <audio ref={audioRef} src={jazz} autoPlay loop />
        <p>Music volume: </p>
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(Number(e.target.value))} />
      </div>
      <div className="game-header">
        {/* Players at the top */}
        <div className="opponent-container">
          {players.filter(player => player.id !== playerId).map((player) => (
            <div className="opponent" key={player.id} style={{}}>
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
              <p className = "volume-wrap" >Player volume: </p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={(audioSubscriptions[player.id]?.volume)/100 ?? 0.5}
                onChange={(e) => handleVolumeChange(player.id, (Number(e.target.value)*100))}
                disabled={!audioSubscriptions[player.id]?.isPlaying} />
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
          {!currentBid || currentBid.suit === null || currentBid.suit === "null" ?
            <>
              No current bid
              {isFijo && "  (Fijo)"}
            </> :
            <>
              {currentBid.amount + " "}
              <img src={suitImages[currentBid.suit]} alt={currentBid.suit} width="40px" height="35px" />
              {isFijo && "  (Fijo)"}
            </>
          }
        </div>
        {}
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
        {players.filter(player => player.id === playerId).map((player, index) => (
          player.chips > 0 && (
            <div className="hand-container" key={index}>
              <div className="die-row">
                {isRolling ? (
                  <>
                    <div className="die">
                      <img src={suitImages[die1.suit]} alt={die1.suit} className="die-image" />
                    </div>
                    <div className="die">
                      <img src={suitImages[die2.suit]} alt={die2.suit} className="die-image" />
                    </div>
                  </>
                ) : (
                  hand.slice(0, 2).map((die, index) => (
                    <div key={index} className="die">
                      <img src={suitImages[die.suit]} alt={die.suit} className="die-image" />
                    </div>
                  ))
                )}
              </div>
              <div className="die-row">
                {isRolling ? (
                  <div className="die">
                    <img src={suitImages[die3.suit]} alt={die3.suit} className="die-image" />
                  </div>
                ) : (
                  <div className="die">
                    <img src={suitImages[hand[2]?.suit || ""]} alt={hand[2]?.suit} className="die-image" />
                  </div>
                )}
              </div>
              <div className="die-row">
                {isRolling ? (
                  <>
                    <div className="die">
                      <img src={suitImages[die4.suit]} alt={die4.suit} className="die-image" />
                    </div>
                    <div className="die">
                      <img src={suitImages[die5.suit]} alt={die5.suit} className="die-image" />
                    </div>
                  </>
                ) : (
                  hand.slice(3, 5).map((die, index) => (
                    <div key={index} className="die">
                      <img src={suitImages[die.suit]} alt={die.suit} className="die-image" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        ))}
      </div>
      <div className="game-footer">
        <Button
          onClick={toggleMute}
          disabled={!isMicAvailable}
          className={muteButtonClass}
        >
          {!isMicAvailable ? "Unmute" : (isMuted ? "Unmute" : "Mute")}
        </Button>
        <Button onClick={() => bid(nextBid)} disabled={validBids.length === 0 || playerId !== currentPlayerId}>
          {validBids.length === 0 ? "Bid" : `Bid ${nextBid}`}
        </Button>
        <Button onClick={showBidOther} disabled={validBids.length === 0 || playerId !== currentPlayerId}>Bid
          Other</Button>
        <Button onClick={() => bidDudo()} disabled={playerId !== currentPlayerId || !currentBid || currentBid.suit === null || currentBid.suit === "null"}>Dudo</Button>
      </div>
      <Button className="leave-game-button" onClick={handleLeaveConfirmation}>
        Leave Game
      </Button>
      {showLeaveConfirmation && (
        <div className="leave-game-confirmation-modal">
          <div className="leave-game-confirmation-content">
            <h2>Are you sure you want to leave the game?</h2>
            <div>
              <Button type="primary" onClick={leaveGame}>Yes</Button>
              <Button onClick={() => setShowLeaveConfirmation(false)}>No</Button>
            </div>
          </div>
        </div>
      )}

      {showBidOtherModal && (
        <div className="bid-other-modal">
          <div className="bid-other-content">
            <h1>Select a bid</h1>
            {stage === "selectAmount" && (
              <img src={suitImages[selectedSuit.toString()]} alt={selectedSuit} className="suit-image" />)}
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
              navigatToLobby();
            }}>Back to Lobby</Button>
          </div>
        </div>
      )}
      {showLoserModal && (
        <div className="loser-modal">
          <div className="loser-content">
            <h1>{loser.username} lost a coin!</h1>
            {isFijo && <h2>Get ready for a fijo round!</h2>}
            <p>The next round will start in {countdown} seconds</p>
          </div>
        </div>
      )}
    </BaseContainer>
  );
};

export default Game;