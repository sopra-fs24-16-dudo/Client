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
    navigate("/editProfile");
  };

  return (
    <div className="player container">
      <div className="player info">
        <div className="player info-item">Username: {user.username}</div>
        <div className="player info-item">Status: {user.status}</div>
        <div className="player info-item">Games played: {user.gamesPlayed}</div>
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
        const id = localStorage.getItem("id");
        const response = await api.get(`/users/${id}`);
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