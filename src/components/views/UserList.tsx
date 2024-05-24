import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User } from "types";
import "styles/views/UserList.scss";
import AgoraRTC from "agora-rtc-sdk";

const UserInfoField = ({ label, value }) => (
  <div className="user-info-field">
    <label className="user-info label">{label}</label>
    <div className="user-info value">{value}</div>
  </div>
);

UserInfoField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

const UserItem = ({ user, onClick }) => {
  const getStatusColor = () => {
    return user.status === "ONLINE" ? "green" : "red";
  };

  return (
    <div className="user-item" onClick={onClick}>
      <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}></div>
      <UserInfoField label="Username" value={user.username} />
      <UserInfoField label="ID" value={user.id.toString()} />
    </div>
  );
};

UserItem.propTypes = {
  user: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

  // Agora client state/////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [rtc, setRtc] = useState({
    client: null,
    localAudioTrack: null,
  });

  const [navigationState, setNavigationState] = useState(() => JSON.parse(sessionStorage.getItem("navigationState")));

  const userId = localStorage.getItem("id");
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Initialize Agora RTC client
  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setRtc((prevState) => ({ ...prevState, client }));
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get("/users");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
        setUsers(response.data);
      } catch (error) {
        alert(`Something went wrong while fetching the users: \n${handleError(error)}`);
      }
    }

    fetchData();
  }, []);

  const navigateToProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  const navigateToHomepage = () => {
    navigate("/");
  };

  /////////////////////////USERLIST AGORA HANDLE///////////////////////////////////
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
    const isInVC = await checkUserInVoiceChannel(userId);
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
  }, [rtc.client, userId, location.pathname, navigationState]); // Add dependencies to re-run effect if these change

  ///////////////////////////////////////////////////////////////////////////////

  return (
    <BaseContainer className="game container">
      <h2>User List</h2>
      <div className="user-list-container">
        {users.length > 0 ? (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id}>
                <UserItem
                  user={user}
                  onClick={() => navigateToProfile(user.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Spinner />
        )}
        <div className="button-container">
          <Button className="primary-button" onClick={navigateToHomepage}>
            Go to Homepage
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default UserList;