import React, { useState, useEffect } from "react";
import { api, handleError, client } from "helpers/api";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/Lobby.scss";
import PropTypes from "prop-types";
import AgoraRTC from "agora-rtc-sdk";
import question from "../../images/question.png";

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
interface UserInfo {
  userId: string;
  token: string;
}
interface UserType {
  uid: string;
  info: UserInfo;
  mediaType: string;
}

interface MediaType {
  type: "audio" | "video"; // Media type
  track: any; // The media track object
}

type AgoraEvent = "user-published" | "user-unpublished";

const Lobby = () => {
  const [users, setUsers] = useState([]);
  const [allReady, setAllReady] = useState(false);
  const navigate = useNavigate();
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState("");
  const lobbyId = localStorage.getItem("lobbyId");
  const userId = localStorage.getItem("id");
  //const [voiceChannel, setVoiceChannel] = useState(null);
  //const [voiceChannelJoined, setVoiceChannelJoined] = useState(false);


 /* useEffect(() => {
    // Subscribe to the lobby channel when the component mounts
    const subscribeToLobbyChannel = () => {
      client.connect({}, () => {
        // Successful connection callback
        console.log('Connected to Stomp server');
        // Subscribe to the lobby channel
        client.subscribe(`/topic/lobby/${lobbyId}`, (message) => {
          // Handle incoming messages from the lobby channel
          console.log('Received message from lobby channel:', message.body);
          // You can update the state or perform any other actions based on the incoming message
        });
      }, (error) => {
        // Error callback
        console.error('Error connecting to Stomp server:', error);
      });
    };

    // Call the function to subscribe to the lobby channel
    subscribeToLobbyChannel();

    // Cleanup function
    return () => {
      // Disconnect from the Stomp server when the component unmounts
      if (client && client.connected) {
        client.disconnect(() => {
          console.log('Disconnected from Stomp server');
        });
      }
    };
  }, [lobbyId]); */

  useEffect(() => {
    async function fetchUsersInLobby () {
      try {
        console.log("LobbyID:", lobbyId);
        const response = await api.get(`/lobby/players/${lobbyId}`);
        setUsers(response.data);
        const allReady = response.data.every((user) => user.ready);
        setAllReady(allReady);

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
  /*
  useEffect(() => {
    const initializeAgora = async () => {
      const appId = "b33a2021ed144a9386270ca92a266f62";
      const client: any = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });

      client.on("user-published", async (user: any, mediaType: any) => {
        await client.subscribe(user, mediaType.type);
        if (mediaType.type === "audio") {
          // Play the received audio track
          const audioTrack = user.audioTrack;
          audioTrack.play();
        }
      });

      client.on("user-unpublished", (user: any) => {
        // Handle user unpublish event
      });

      try {
        if (!voiceChannel) {
          console.error("Voice channel not set.");

          return;
        }

        await client.join(appId, voiceChannel, userId);
        console.log("Successfully joined the voice channel");
      } catch (error) {
        console.error("Failed to join the voice channel:", error);
      }
    };
    if (voiceChannel && userId) {
      initializeAgora();
    }

    return () => {
      // Cleanup logic when the component unmounts
      if (voiceChannel) {
        leaveVoiceChannel();
      }
    };
  }, [voiceChannel, userId]);

   */

  const toggleReadyStatus = async () => {
    try {
      const requestBody = JSON.stringify(userId);
      // Send request to update readiness status to the server
      await api.put(`/lobby/player/${lobbyId}/ready`, requestBody);

      // Check if all users are ready after the update
      //const response = await api.get(`/lobby/player/${lobbyId}/ready`);
      //setAllReady(response.data);

      //if (response.data) {
        //await api.post(`/lobby/start/${lobbyId}`);
        //navigate(`/game/${lobbyId}`);
      //}
    } catch (error) {
      console.error("Error toggling ready status:", error);
    }
  };

  const leaveLobby = async () => {
    try {
      const requestBody = JSON.stringify(userId);

      await api.post(`/lobby/exit/${lobbyId}`, requestBody);

      //if (voiceChannel) {
      //  await leaveVoiceChannel();
      // }

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
  /*
  const joinVoiceChannel = async () => {
    try {

      const response = await api.post("/lobby/${lobbyId}/${userId}/voice-channel/join", { userId, lobbyId });

      // If join request is successful, set the voice channel state
      if (response.status === 200) {
        setVoiceChannelJoined(true);
        setVoiceChannel(response.data.voiceChannel);
      } else {
        console.error("Error joining voice channel:", response.statusText);
      }
    } catch (error) {
      console.error("Error joining voice channel:", error);
    }
  };

  const leaveVoiceChannel = async () => {
    try {
      // Make a POST request to the server endpoint to leave voice channel
      const response = await api.post("/lobby/${lobbyId}/${userId}/voice-channel/leave", { userId, lobbyId });

      // If leave request is successful, reset the voice channel state
      if (response.status === 200) {
        setVoiceChannelJoined(false);
        setVoiceChannel(null);
      } else {
        console.error("Error leaving voice channel:", response.statusText);
      }
    } catch (error) {
      console.error("Error leaving voice channel:", error);
    }
  };

   */
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

  return (
    <BaseContainer className="lobby container">
      <h2>Lobby</h2>
      <div className="user-list">
        <h3>Users in Lobby:</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.username} {user.ready ? "- Ready" : ""}
            </li>
          ))}
        </ul>
        <a href="#" className="question-image" onClick={showRules}>
          <img src={question} alt="Question" width="80px" height="80px" />
        </a>
      </div>
      <div className="button-container">
        <Button onClick={() => toggleReadyStatus()}>Ready</Button>
        <Button onClick={leaveLobby}>Leave Lobby</Button>
      </div>
      <div/* className="voice-channels">
        {voiceChannelJoined ? (
          <Button onClick={leaveVoiceChannel}>Leave Voice Chat</Button>
        ) : (
          <Button onClick={joinVoiceChannel}>Join Voice Chat</Button>
        )}
      </div>*/>
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
      <div className="chat container">
        {/* Other chat content */}
        <FormField
          placeholder="Type something..."
          value={message}
          onChange={(m) => setMessage(m)}
        />
        <Button onClick={() => sendMessage()}> Send </Button>
      </div>
    </BaseContainer>
  );
};

export default Lobby;