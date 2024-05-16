import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Registration.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import showPasswordIMG from "images/show_password.png"

const FormField = (props) => {
  return (
    <div className="registration field">
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

const Registration = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);


  const doRegistration = async () => {
    try {
      const requestBody = JSON.stringify({ username, name });
      const response = await api.post("/users", requestBody);
      const user = new User(response.data);
      localStorage.setItem("token", user.token);
      localStorage.setItem("id", user.id);
      localStorage.setItem("currentPlayerId", user.id);
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
            type={showPassword ? "text" : "password"}
            imgSrc={showPasswordIMG}
            onImgClick={() => setShowPassword(!showPassword)}
          />
          <div className="registration button-container">
            <Button
              disabled={!username || !name}
              onClick={() => doRegistration()}
            >
              Create Account
            </Button>
            <Button
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
