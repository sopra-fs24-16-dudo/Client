import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Profile.scss";
import { User } from "types";

const Player = ({ user, isCurrentUser }: { user: User, isCurrentUser: boolean }) => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    // Redirect to the edit profile page
    navigate("/editProfile");
  };

  return (
    <div className="player container">
      <div className="player info">
        <div className="player info-item">Username: {user.username}</div>
        <div className="player info-item">Birthday: {user.birthday}</div>
        <div className="player info-item">Creation Date: {user.creationDate}</div>
        <div className="player info-item">Status: {user.status}</div>

        {isCurrentUser && (
          <div className="player info-item">
            <Button onClick={handleEditProfile}>Edit Profile</Button>
          </div>
        )}
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

  return (
    <BaseContainer>
      <div className="profile container">
        <div className="profile form">
          <ul className="profile user-list">
            <li className="player list-item">
              <Player user={user} isCurrentUser={userId === currentUser.id} />
            </li>
          </ul>
          <Button style={{ marginBottom: "35px" }} width="100%" onClick={() => doHome()}>
            Back to Homepage
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default Profile;