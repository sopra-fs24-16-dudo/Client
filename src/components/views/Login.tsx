import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Login.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */
const FormField = (props) => {
  return (
    <div className="login field">
      <input
        className="login input"
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormField.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>(null);
  const [username, setUsername] = useState<string>(null);

  const doLogin = async () => {
    try {
      const requestBody = JSON.stringify({ username, name });
      const response = await api.post("/login", requestBody);

      const user = new User(response.data);

      localStorage.setItem("token", user.token);
      localStorage.setItem("id", user.id);


      navigate("/game");
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
    <div className="Div">
      <div className="Div2">
        <div className="Div3">
          <div className="Div4">
            <div className="Column">
              <img
                loading="lazy"
                srcSet="https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Fb3223ee50ca84556b9540adede97590c?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Fb3223ee50ca84556b9540adede97590c?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Fb3223ee50ca84556b9540adede97590c?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Fb3223ee50ca84556b9540adede97590c?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Fb3223ee50ca84556b9540adede97590c?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Fb3223ee50ca84556b9540adede97590c?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Fb3223ee50ca84556b9540adede97590c?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Fb3223ee50ca84556b9540adede97590c"
                className="Img"
              />
            </div>
            <div className="Column2">
              <div className="Div5">
              <span style={{
                fontFamily: "Libre Bodoni",
                fontSize: "100px",
                fontStyle: "normal",
                fontVariantLigatures: "normal",
                fontVariantCaps: "normal",
                fontWeight: 400
              }}>
                Dudo
              </span>
              </div>
            </div>
            <div className="Column3">
              <img
                loading="lazy"
                srcSet="https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Ff61ebad238f2460fa82781fbaf0546cc?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Ff61ebad238f2460fa82781fbaf0546cc?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Ff61ebad238f2460fa82781fbaf0546cc?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Ff61ebad238f2460fa82781fbaf0546cc?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Ff61ebad238f2460fa82781fbaf0546cc?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Ff61ebad238f2460fa82781fbaf0546cc?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Ff61ebad238f2460fa82781fbaf0546cc?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2Fc5149f80998544599b064363e6cf88da%2Ff61ebad238f2460fa82781fbaf0546cc"
                className="Img2"
              />
            </div>
          </div>
        </div>
        <div className="Div6">
          <br />
          <span style={{ fontFamily: "Libre Bodoni", fontSize: "50px" }}>
          Roll, Bid, and Bluff Your Way to Victory
        </span>
        </div>
        <div className="Div7">
          <div className="Div8">Username</div>
          <div className="Div9" />
          <div className="Div10">login</div>
        </div>
      </div>
    </div>
  );
};

  /**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default Login;
