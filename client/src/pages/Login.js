import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Login.css";

export default function Login() {
  // State variables to store the username, password, and login status
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [statusHolder, setstatusHolder] = useState("message");

  // State variable to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState();

  // Function to navigate between pages
  const navigate = useNavigate();

  // Effect to check the login status when the component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Send a request to the server to check login status
        const response = await fetch("http://localhost:3002/", {
          method: "GET",
          credentials: "include",
        });
        // Parse the response
        const data = await response.json();
        // Update isLoggedIn state based on response
        setIsLoggedIn(data.valid && data.isVerified);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, []); // Empty dependency array means this effect runs only once when component mounts

  // Effect to navigate to home page when isLoggedIn changes
  useEffect(() => {
    if (isLoggedIn === true) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]); // Re-run effect when isLoggedIn or navigate changes

  // Function to handle user login
  const loginUser = (event) => {
    event.preventDefault();
    // Send login request to server
    axios
      .post("http://localhost:3002/login", {
        LoginUserName: loginUserName,
        LoginPassword: loginPassword,
      })
      .then((response) => {
        // Handle response from server
        if (response.data.message) {
          setLoginStatus(response.data.message);
        } else if (!response.data.isVerified) {
          setLoginStatus("User not verified");
        } else {
          // Set isLoggedIn in local storage and navigate to home page
          localStorage.setItem("isLoggedIn", "true");
          navigate("/");
        }
      });
  };

  // Effect to display login status message
  useEffect(() => {
    if (loginStatus !== "") {
      setstatusHolder("showMessage");
      setTimeout(() => {
        setstatusHolder("message");
      }, 4000);
    }
  }, [loginStatus]); // Re-run effect when loginStatus changes

  // Set axios to use credentials
  axios.defaults.withCredentials = true;

  // Render the login form
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
