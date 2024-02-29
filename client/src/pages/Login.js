import React, { useEffect, useState } from "react";
import Axios from "axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Login.css";

const Login = () => {
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const navigateTo = useNavigate();

  const [loginStatus, setLoginStatus] = useState("");
  const [statusHolder, setstatusHolder] = useState("message");

  const loginUser = (event) => {
    event.preventDefault();
    Axios.post("http://localhost:3002/login", {
      LoginUserName: loginUserName,
      LoginPassword: loginPassword,
    }).then((response) => {
      if (
        response.data.message ||
        loginUserName === "" ||
        loginPassword === ""
      ) {
        setLoginStatus("Credentials error");
      } else {
        localStorage.setItem("isLoggedIn", "true");
        navigateTo("/");
      }
    });
  };

  useEffect(() => {
    if (loginStatus !== "") {
      setstatusHolder("showMessage");
      setTimeout(() => {
        setstatusHolder("message");
      }, 4000);
    }
  }, [loginStatus]);

  axios.defaults.withCredentials = true;

  return (
    <div className="login-page">
      <div className="login">
        <a href="/" className="page-title">
          Placeholder
        </a>
        <div className="wrapper">
          <form id="form">
            <h1>Login</h1>
            <div className="mb-3 input-box">
              <input
                type="username"
                className="form-control"
                id="username"
                autoComplete="off"
                placeholder="Username"
                onChange={(event) => {
                  setLoginUserName(event.target.value);
                }}
              />
            </div>
            <div className="mb-3 input-box">
              <input
                type="password"
                className="form-control"
                id="password"
                autoComplete="off"
                placeholder="Password"
                onChange={(event) => {
                  setLoginPassword(event.target.value);
                }}
              />
            </div>
            <div className="mb-3">
              <div className="forgot">
                <a href="*">Forgot password?</a>
              </div>
            </div>
            <div className="mb-3">
              <button type="submit" className="btn-login" onClick={loginUser}>
                Login
              </button>
            </div>
            <div className="register-text mb-3">
              <p>
                Don't have an account?
                <a href="/register" className="link-register">
                  Sign-up
                </a>
              </p>
              <span className={statusHolder}>{loginStatus}</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
