import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../Login.css";

export default function Login() {
  // State variables for storing username, password, login status, and status holder class
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [statusHolder, setStatusHolder] = useState("message");

  // State variable for checking if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState();

  // Hook for navigating programmatically
  const navigate = useNavigate();

  // Effect to check login status on component mount
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

  // Effect to redirect to home page if the user is already logged in
  useEffect(() => {
    if (isLoggedIn === true) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // Function to handle user login
  const loginUser = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:3002/login", {
        LoginUserName: loginUserName,
        LoginPassword: loginPassword,
      })
      .then((response) => {
        if (response.data.message) {
          setLoginStatus(response.data.message);
        } else {
          localStorage.setItem("isLoggedIn", "true");
          navigate("/");
        }
      });
  };

  // Function to render login status messages
  const renderStatusMessage = () => {
    switch (loginStatus) {
      case "Email not verified":
        return (
          <>
            Your email is not verified. Please check your inbox for a
            verification link.
          </>
        );
      case "Admin approval rejected":
        return (
          <>
            Admin approval rejected. Try again <Link to="/rejection">here</Link>
            .
          </>
        );
      case "Admin approval pending":
        return (
          <>
            Your account is pending admin approval. Please wait for
            confirmation.
          </>
        );
      case "Credentials error":
        return <>Incorrect username or password.</>;
      default:
        return null;
    }
  };

  // Effect to show and hide status messages
  useEffect(() => {
    if (loginStatus !== "") {
      setStatusHolder("showMessage");
      setTimeout(() => {
        setStatusHolder("message");
      }, 4000);
    }
  }, [loginStatus]);

  // Set axios to send credentials with requests
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
              <span className={statusHolder}>{renderStatusMessage()}</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
