import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Profile.scss";
import { User } from "types";

// Define the UserInfoField component
const UserInfoField = ({ label, value }) => (
  <div className="user-info field">
    <label className="user-info label">{label}</label>
    <div className="user-info value">{value}</div>
  </div>
);

// PropTypes for UserInfoField component
UserInfoField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

// Define the Player component
const Player = ({ user, isCurrentUser }) => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate("/editProfile");
  };

  // Function to determine the status indicator color
  const getStatusColor = () => {
    return user.status === "ONLINE" ? "green" : "red";
  };

  return (
    <div className="player container">
      <div className="player info">
        {/* Status Indicator */}
        <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}></div>

        {/* User Information */}
        <UserInfoField label="Username" value={user.username} />
        <UserInfoField label="Birthday" value={user.birthday} />
        <UserInfoField label="Creation Date" value={user.creationDate} />
        <UserInfoField label="Status" value={user.status} />

        {/* Edit Profile Button (if current user) */}
        {isCurrentUser && (
          <div className="player info-item">
            <Button onClick={handleEditProfile}>Edit Profile</Button>
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes for Player component
Player.propTypes = {
  user: PropTypes.object.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
};

// Define the Profile component
const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState<User>({});
  const [currentUser, setCurrentUser] = useState<User>({});

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
    // Retrieve id from localStorage
    const storedUserId = localStorage.getItem("id");
    setCurrentUser({ id: storedUserId });
  }, []);

  const doHome = () => {
    navigate("/homepage");
  };

  const doUserList = () => {
    navigate("/userList");
  };

  return (
    <BaseContainer>
      <div className="profile container">
        <div className="profile form">
          <ul className="profile user-list">
            <li className="player list-item">
              <Player user={user} isCurrentUser={userId === currentUser.id} />
            </li>
          </ul>
          <Button style={{ marginBottom: "35px" }} width="100%" onClick={doHome}>
            Back to Homepage
          </Button>
          <Button style={{ marginBottom: "35px" }} width="100%" onClick={doUserList}>
            Back to User List
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default Profile;
