import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Profile.scss";
import { User } from "types";
import AgoraRTC from "agora-rtc-sdk";

const Player = ({ user, isCurrentUser }: { user: User, isCurrentUser: boolean }) => {
  const navigate = useNavigate();

  return (
    <div className="player container">
      <div className="player info">
        <div className="player info-item">Username: {user.username}</div>
        <div className="player info-item">Status: {user.status}</div>
        <div className="player info-item">Games played: {user.gamesPlayed}</div>
      </div>
    </div>
  );
};

Player.propTypes = {
  user: PropTypes.object.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
};

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState<User>({});
  const [currentUser, setCurrentUser] = useState<User>({});

  // Agora client state
  const [rtc, setRtc] = useState({
    client: null,
    localAudioTrack: null,
  });

  let state = JSON.parse(sessionStorage.getItem("navigationState"));

  // Initialize Agora RTC client
  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setRtc((prevState) => ({ ...prevState, client }));
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error(`Error fetching user data: \n${handleError(error)}`);
      }
    }

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("id");
    setCurrentUser({ id: storedUserId });
  }, []);

  const doHome = () => {
    navigate("/homepage");
  };

  /////////////////////////AGORA LOBBY HANDLE///////////////////////////////////
  // Function to check if user is in voice channel
  const checkUserInVoiceChannel = async (userId) => {
    if (rtc.client) {
      const remoteUsers = rtc.client.remoteUsers;

      return remoteUsers.some(user => user.uid === userId);
    }

    return false;
  };

  // Function to remove user from voice channel
  const leaveVoiceChannel = async () => {
    try {
      if (rtc.client) {
        await rtc.client.leave();
        rtc.localAudioTrack?.close();
        setRtc({ client: null, localAudioTrack: null });
        console.log("Left the voice channel successfully");
      }
    } catch (error) {
      console.error("Error leaving the voice channel:", error);
    }
  };

  // Function to check if user is in a lobby
  const isUserInLobby = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/lobby`);

      return response.status === 200 ? response.data : null;
    } catch (error) {
      console.error("Error checking if user is in a lobby:", error);

      return null;
    }
  };

  // Function to check if user is in a lobby and handle VC accordingly
  const checkAndRemoveFromVC = async () => {
    const userId = localStorage.getItem("id");
    const lobbyId = await isUserInLobby(userId);
    console.log("checkAndRemoveFromVC Was triggered userId: $",userId, "lobbyId: ",lobbyId)


    if (!lobbyId) {
      const isInVC = await checkUserInVoiceChannel(userId);
      if (isInVC) {
        console.log("User is in VC but not in a lobby, removing from VC");
        await leaveVoiceChannel();
      }
    }
    console.log("User is in lobby but not in an associated VC")
  };

  useEffect(() => {
    // Check and remove from VC if needed
    console.log("Session Storage before cleaning up Lobby is: ", sessionStorage)
    console.log("Use Effect Was triggered")
    checkAndRemoveFromVC();
    sessionStorage.removeItem("navigationState");
    console.log("Session Storage after cleaning up Lobby is: ", sessionStorage)
  }, [state]);
  ///////////////////////////////////////////////////////////////////////////////

  return (
    <BaseContainer>
      <div className="profile container">
        <div className="profile form">
          <ul className="profile user-list">
            <h2>Profile</h2>
            <li className="player list-item">
              <Player user={user} isCurrentUser={userId === currentUser.id} />
            </li>
          </ul>
          <Button onClick={() => doHome()}>
            Back to Homepage
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default Profile;