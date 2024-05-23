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

  // Agora client state/////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [rtc, setRtc] = useState({
    client: null,
    localAudioTrack: null,
  });

  const [navigationState, setNavigationState] = useState(() => JSON.parse(sessionStorage.getItem("navigationState")));
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  /////////////////////////PROFILE AGORA HANDLE///////////////////////////////////
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
    if (rtc.client) {
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
    const isInVC = await checkUserInVoiceChannel(userId);
    if (!isInVC) {
      await leaveVoiceChannel();
    } else {
      console.log("User is in VC");
    }
  };

  useEffect(() => {
    // Function to periodically check and remove from VC if needed
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setRtc((prevState) => ({ ...prevState, client }));

    const interval = setInterval(() => {
      checkAndRemoveFromVC();
    }, 5000); // Check every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [rtc.client, userId, location.pathname, navigationState]); // Add dependencies to re-run effect if these change

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