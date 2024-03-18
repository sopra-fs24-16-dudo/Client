import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/EditProfile.scss";
import { User } from "types";

const FormField = (props) => {
  return (
    <div className="editprofile field">
      <label className="editprofile label">{props.label}</label>
      <input
        className="editprofile input"
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        maxLength={25}
      />
    </div>
  );
};
  
FormField.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

const EditProfile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("id");
  const [user, setUser] = useState<User>({});
  const [username, setUsername] = useState<string>("");
  const [birthday, setBirthday] = useState<string>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error(`Error fetching user data: \n${handleError(error)}`);
      }
    }

    fetchUserData();
  }, [userId]);

  const handleSaveChanges = async () => {
    try { 

      if (username === user.username) {
        alert("New username must be different from the old one.");

        return;
      }

      const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (birthday){
        if (!birthday.match(birthdayRegex)) {
          alert("Birthday must be in the format YYYY-MM-DD.");

          return;
        }
      }

      const requestBody = JSON.stringify({ username, birthday })
      await api.put(`/users/${userId}`, requestBody);

      navigate(`/profile/${userId}`)

    } catch (error) {
      alert("Failed to save the changes. Please try again.");
    }
  };

  const handleBackToProfile = () => {
    navigate(`/profile/${userId}`);
  }

  return (
    <BaseContainer>
      <div className="editprofile container">
        <div className="editprofile form">
          <FormField
            label = "Username"
            placeholder="Enter new Username ..."
            value={username}
            onChange={(un: string) => setUsername(un)}
          />
          <FormField
            label = "Birthday"
            placeholder="Enter new Birthday (YYYY-MM-DD)..."
            value={birthday}
            onChange={(un: string) => setBirthday(un)}
          />  
          <Button style={{ marginBottom: "20px" }} disabled={!username && !birthday} width="100%" onClick={handleSaveChanges}>
            Save Changes
          </Button>
          <Button style={{ marginBottom: "30px" }} width="100%" onClick={handleBackToProfile}>
            Back To Profile
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default EditProfile;
