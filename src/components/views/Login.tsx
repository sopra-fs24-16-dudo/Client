import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Login.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import showPasswordIMG from "images/show_password.png"

const FormField = (props) => {
  return (
    <div className="login field">
      <div className="input-container">
        <input
          className="registration input"
          placeholder={props.placeholder}
          value={props.value || ""}
          onChange={(e) => props.onChange(e.target.value)}
          maxLength={25}
          type={props.type || "text"}
        />
        {props.imgSrc && (
          <img
            src={props.imgSrc}
            alt=""
            width="25"
            height="25"
            onClick={props.onImgClick}
            className="input-image"
          />
        )}
      </div>
    </div>
  );
};

FormField.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.string,
  imgSrc: PropTypes.string,
  onImgClick: PropTypes.func, // Add this line
};

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>(null);
  const [username, setUsername] = useState<string>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const doLogin = async () => {
    try {
      const requestBody = JSON.stringify({ username, name });
      const response = await api.post("/login", requestBody);

      const user = new User(response.data);

      localStorage.setItem("token", user.token);
      localStorage.setItem("id", user.id);
      localStorage.setItem("currentPlayerId", user.id);
      navigate("/homepage");
    } catch (error) {
      alert(
        `Something went wrong during the login: \n${handleError(error)}`
      );
    }
  };

  const doRegistration = () => {
    navigate("/registration");
  }

  return (
    <BaseContainer>
      <div className="login container">
        <div className="login form">
          <FormField
            placeholder="Username"
            value={username}
            onChange={(un: string) => setUsername(un)}
          />
          <FormField
            placeholder="Password"
            value={name}
            onChange={(n) => setName(n)}
            type={showPassword ? "text" : "password"}
            imgSrc={showPasswordIMG}
            onImgClick={() => setShowPassword(!showPassword)}
          />
          <div className="login button-container">
            <Button
              disabled={!username || !name}
              width="100%"
              onClick={() => doLogin()}
            >
              Login
            </Button>
            <Button
              width="100%"
              onClick={() => doRegistration()}
              className="secondary-button"
            >
              Create an Account
            </Button>
          </div>
        </div>
      </div>
    </BaseContainer>

  );
};

export default Login;
