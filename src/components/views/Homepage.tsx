import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/Homepage.scss";
import Lobby from "models/Lobby";
import AgoraRTC from "agora-rtc-sdk";

const Homepage = () => {
  const navigate = useNavigate();

  const [lobbyId, setLobbyId] = useState<string>("");
  const [id, setUserId] = useState<number>(null);

  // Agora client state/////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [rtc, setRtc] = useState({
    client: null,
    localAudioTrack: null,
  });
  const [navigationState, setNavigationState] = useState(() => JSON.parse(sessionStorage.getItem("navigationState")));
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const joinLobby = async () => {
    try {
      const requestBody = JSON.stringify(id);
      await api.put(`/lobbies/players/${lobbyId}`, requestBody);
      localStorage.setItem("lobbyId", lobbyId);
      const isFree = await api.get(`/lobbies/availability/${lobbyId}`);
      if (!isFree.data) {
        alert("Sorry, a game is already in progress in this lobby. Please try again later.");

        return;
      }
      navigate(`/lobby/${lobbyId}`);
    } catch (error) {
      alert(
        `Something went wrong while trying to join a lobby: \n${handleError(error)}`
      );
    }
  };

  const createLobby = async () => {
    try {
      const requestBody = JSON.stringify(id);
      const response = await api.post("/lobbies", requestBody);
      const lobby = new Lobby(response.data);
      localStorage.setItem("lobbyId", lobby.id);
      navigate(`/lobby/${lobby.id}`);
    } catch (error) {
      alert(
        `Something went wrong while creating a lobby: \n${handleError(error)}`
      );
    }
  };

  const goToProfile = () => {
    navigate(`/profile/${id}`);
  };
  const userList = async ()  => {
    try {
      const response = await api.get("/users");
      navigate("/userList");
    } catch (error) {
      alert(
        "Something went wrong while creating a lobby: \n${handleError(error)}"
      );
    }
  };

  const logout = async () => {
    try {
      // Call the backend API to update the user's status to "offline"
      const requestBody = JSON.stringify({id});
      await api.put("/logout", requestBody);
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      localStorage.removeItem("currentPlayerId");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout. Please try again.");
    }
  }

  useEffect(() => {
    const storedUserId = localStorage.getItem("id");
    setUserId(storedUserId);
  }, []);

  /////////////////////////HOMEPAGE AGORA HANDLE///////////////////////////////////
  const useSessionStorageListener = (key, callback) => {
    useEffect(() => {
      const handleStorageChange = (event) => {
        if (event.key === key) {
          callback(JSON.parse(event.newValue));
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }, [key, callback]);
  };

  // Custom hook to handle session storage changes
  useSessionStorageListener("navigationState", (newState) => {
    setNavigationState(newState);
  });

  // Function to check if user is in voice channel
  const checkUserInVoiceChannel = async (userId) => {
    if (rtc.client.remoteUsers) {
      const remoteUsers = rtc.client.remoteUsers;

      return remoteUsers.some(user => user.uid === userId);
    }

    return false;
  };

  const leaveVoiceChannel = async () => {
    try {
      if (rtc.client) {
        await rtc.client.leave();
        rtc.localAudioTrack?.close();
        setRtc({ client: null, localAudioTrack: null });
      }
    } catch (error) {
      console.error("Error leaving the voice channel:", error);
    }
  };

  const checkAndRemoveFromVC = async () => {
    const isInVC = await checkUserInVoiceChannel(id);
    if (!isInVC) {
      await leaveVoiceChannel();
    } else {
      console.log("User is in VC");
    }
  };

  useEffect(() => {
    if (!rtc.client) {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setRtc((prevState) => ({ ...prevState, client }));
    }
  }, [rtc.client]);

  useEffect(() => {
    // Function to periodically check and remove from VC if needed
    const interval = setInterval(() => {
      checkAndRemoveFromVC();
    }, 5000); // Check every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [rtc.client, id, location.pathname, navigationState]); // Add dependencies to re-run effect if these change

  ///////////////////////////////////////////////////////////////////////////////

  return (
    <BaseContainer className="homepage container">
      <h2>Join or create lobby</h2>
      <div className="lobby-form">
        <div className="join-lobby-container">
          <input
            className="registration input" style={{ marginTop: "10px" }}
            type="text"
            placeholder="Enter lobby ID"
            value={lobbyId}
            onChange={(e) => setLobbyId(e.target.value)}
          />
          <Button onClick={joinLobby} disabled={!lobbyId}>
            Join Lobby
          </Button>
        </div>
        <div className="button-container">
          <Button onClick={createLobby}>
            Create Lobby
          </Button>
          <Button width="100%" onClick={userList}>
            Search Users
          </Button>
          <Button onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default Homepage;
