import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { Button } from "components/ui/Button";
import "styles/views/UsersList.scss";

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error(`Error fetching user data: \n${handleError(error)}`);
      }
    }

    fetchUsers();
  }, []);

  const renderUserRow = (user, navigateToUserProfile) => {
    return (
      <li key={user.id} onClick={() => navigateToUserProfile(user.id)} className="user-item">
        <span>{user.username}</span>
        <div className={`status-circle ${user.status ? "ONLINE" : "OFFLINE"}`}></div>
      </li>
    );
  };

  const navigateToUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const navigateToHomepage = () => {
    navigate("/homepage");
  };

  return (
    <BaseContainer className="user-list container"> {/* Apply container class */}
      <h2>User List</h2>
      <div className="user-list">
        <ul>
          {users.map((user) => renderUserRow(user, navigateToUserProfile))}
        </ul>
      </div>
      <div className="button-container"> {/* Adjust button container class */}
        <Button onClick={navigateToHomepage} className="back-button">
          Back to Homepage
        </Button>
      </div>
    </BaseContainer>
  );
};

export default UserList;
