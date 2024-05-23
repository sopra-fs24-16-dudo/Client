import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Login.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import showPasswordIMG from "images/show_password.png"
import AgoraRTC from "agora-rtc-sdk";

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

  // Agora client state
  const [rtc, setRtc] = useState({
    client: null,
    localAudioTrack: null,
  });

  let state = JSON.parse(sessionStorage.getItem("navigationState"));

  // Initialize Agora RTC client
  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setRtc((prevState) => ({ ...prevState, client }));
  }, []);

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

  /////////////////////////AGORA LOBBY HANDLE///////////////////////////////////
  const checkUserInVoiceChannel = async (userId) => {
    if (rtc.client) {
      const remoteUsers = rtc.client.remoteUsers;

      return remoteUsers.some(user => user.uid === userId);
    }

    return false;
  };

  const leaveVoiceChannel = async () => {
    try {
      if (rtc.client) {
        await rtc.client.leave();
        rtc.localAudioTrack?.close();
        setRtc({ client: null, localAudioTrack: null });
      }
    } catch (error) {
      console.error("Error leaving the voice channel:", error);
    }
  };

  const isUserInLobby = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/lobby`);

      return response.status === 200 ? response.data : null;
    } catch (error) {
      console.error("Error checking if user is in a lobby:", error);

      return null;
    }
  };

  const checkAndRemoveFromVC = async () => {
    const userId = localStorage.getItem("id");
    const lobbyId = await isUserInLobby(userId);
    if (!lobbyId) {
      const isInVC = await checkUserInVoiceChannel(userId);
      if (isInVC) {
        await leaveVoiceChannel();
      }
    } else{
      console.log("User is in lobby but not in an associated VC")
    }
  };

  useEffect(() => {
    checkAndRemoveFromVC();
    sessionStorage.removeItem("navigationState");
  }, [state]);
  ///////////////////////////////////////////////////////////////////////////////

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
