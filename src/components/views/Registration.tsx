import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Registration.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import showPasswordIMG from "images/show_password.png"
import AgoraRTC from "agora-rtc-sdk";

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
  onImgClick: PropTypes.func,
};

const Registration = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
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

  /////////////////////////AGORA LOBBY HANDLE///////////////////////////////////
  // Function to check if user is in voice channel
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
        console.log("Left the voice channel successfully");
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
    console.log("checkAndRemoveFromVC Was triggered userId: $",userId, "lobbyId: ",lobbyId)
    if (!lobbyId) {
      const isInVC = await checkUserInVoiceChannel(userId);
      if (isInVC) {
        console.log("User is in VC but not in a lobby, removing from VC");
        await leaveVoiceChannel();
      }
    } else{
      console.log("User is in lobby but not in an associated VC")
    }
  };

  useEffect(() => {
    console.log("Session Storage before cleaning up Lobby is: ", sessionStorage)
    console.log("Use Effect Was triggered")
    checkAndRemoveFromVC();
    sessionStorage.removeItem("navigationState");
    console.log("Session Storage after cleaning up Lobby is: ", sessionStorage)
  }, [state]);
  ///////////////////////////////////////////////////////////////////////////////

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
