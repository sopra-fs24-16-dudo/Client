import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import {useNavigate} from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Game.scss";
import { User } from "types";

const Lobby = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(null);

  const doProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  }

  const Player = ({ user }: { user: User }) => (
    <div className="player container" onClick={() => doProfile(user.id)}>
      <div className="player username">{user.username}</div>
    </div>
  );

  Player.propTypes = {
    user: PropTypes.object,
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get("/users");

        // delays continuous execution of an async operation for 1 second.
        // This is just a fake async call, so that the spinner can be displayed
        // feel free to remove it :)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the returned users and update the state.
        setUsers(response.data);

      } catch (error) {
        console.error(
          `Something went wrong while fetching the users: \n${handleError(
            error
          )}`
        );
        console.error("Details:", error);
        alert(
          "Something went wrong while fetching the users! See the console for details."
        );
      }
    }

    fetchData();
  }, []);

  let content = <Spinner />;

  if (users) {
    content = (
      <div className="game">
        <ul className="game user-list">
          {users.map((user: User) => (
            <li key={user.id} className="player list-item">
              <Player user={user}/>
            </li>
          ))}
        </ul>
        <Button width="100%">
          Create Lobby
        </Button>
        <Button width="100%">
          Logout
        </Button>
      </div>
    );
  }

  return (
    <BaseContainer className="game container">
      <h2>Homepage</h2>
      <p className="game paragraph">
        All users:
      </p>
      {content}
    </BaseContainer>
  );
};

export default Lobby;
