import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User } from "types";
import "styles/views/UserList.scss";

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