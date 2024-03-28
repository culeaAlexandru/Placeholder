import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Login.css";

export default function Login() {
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const navigate = useNavigate();

  const [loginStatus, setLoginStatus] = useState("");
  const [statusHolder, setstatusHolder] = useState("message");

  const [isLoggedIn, setIsLoggedIn] = useState();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:3002/", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setIsLoggedIn(data.valid);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn === true) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const loginUser = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:3002/login", {
        LoginUserName: loginUserName,
        LoginPassword: loginPassword,
      })
      .then((response) => {
        if (
          response.data.message ||
          loginUserName === "" ||
          loginPassword === ""
        ) {
          setLoginStatus("Credentials error");
        } else {
          localStorage.setItem("isLoggedIn", "true");
          navigate("/");
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
}
