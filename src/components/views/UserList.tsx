import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
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

// Define the UserItem component
const UserItem = ({ user, onClick }) => {
  // Function to determine the status indicator color
  const getStatusColor = () => {
    return user.status === "ONLINE" ? "green" : "red";
  };

  return (
    <div className="user-item container" onClick={onClick}>
      <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}></div>
      <UserInfoField label="Username" value={user.username} />
      <UserInfoField label="ID" value={user.id.toString()} />
    </div>
  );
};

// PropTypes for UserItem component
UserItem.propTypes = {
  user: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

// Define the UserList component
const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

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

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const navigateToHomepage = () => {
    navigate("/");
  };

  return (
    <BaseContainer className="game container">
      <h2>User List</h2>
      <div className="game">
        {users.length > 0 ? (
          <ul className="game user-list">
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
        <Button width="100%" onClick={navigateToHomepage}>
          Go to Homepage
        </Button>
      </div>
    </BaseContainer>
  );
};

export default UserList;
