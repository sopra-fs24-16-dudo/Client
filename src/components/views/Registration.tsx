import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Registration.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

const FormField = (props) => {
  return (
    <div className="registration field">
      <input
        className="registration input"
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        maxLength={25}
      />
    </div>
  );
};
  
FormField.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

const Registration = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>(null);
  const [username, setUsername] = useState<string>(null);

  const doRegistration = async () => {
    try {
      const requestBody = JSON.stringify({ username, name });
      const response = await api.post("/users", requestBody);

      // Get the returned user and update a new object.
      const user = new User(response.data);

      // Store the token into the local storage.
      localStorage.setItem("token", user.token);
      localStorage.setItem("id", user.id);
      localStorage.setItem("currentPlayerId", user.id);

      // Login successfully worked --> navigate to the route /homepage in the HomepageRouter
      navigate("/homepage");
    } catch (error) {
      alert(
        `Something went wrong during the registration: \n${handleError(error)}`
      );
    }
  }

  const doLogin = () => {
    navigate("/login");
  } 

  return (
    <BaseContainer>
      <div className="registration container">
        <div className="registration form">
          <FormField
            placeholder="Username         (Max. 25 Characters)"
            value={username}
            onChange={(un: string) => setUsername(un)}
          />
          <FormField
            placeholder="Password"
            value={name}
            onChange={(n) => setName(n)}
          />
          <div className="registration button-container">
            <Button
              disabled={!username || !name}
              width="100%"
              onClick={() => doRegistration()}
            >
              Create Account
            </Button>
            <Button
              width="100%"
              onClick={() => doLogin()}
              className="secondary-button"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </BaseContainer>
  );
};

export default Registration;
