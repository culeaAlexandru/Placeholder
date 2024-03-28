import React, { useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigateTo = useNavigate();

  const creatUser = (event) => {
    event.preventDefault();

    if (email.includes(" ")) {
      setErrorMessage("The email cannot contain spaces");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email");
      return;
    }

    if (!email.includes("@") || email.length < 5) {
      setErrorMessage("Please enter a valid email");
      return;
    }

    if (userName.trim() === "") {
      setErrorMessage("Please insert a username");
      return;
    }

    if (userName.includes(" ")) {
      setErrorMessage("The username cannot contain spaces");
      return;
    }

    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(userName)) {
      setErrorMessage("Please start the username with a letter");
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(userName)) {
      setErrorMessage("Please don't use special characters in the username");
      return;
    }

    if (userName.length < 4) {
      setErrorMessage("Please input a username with at least 4 characters");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 4) {
      setErrorMessage("Please input a password with at least 4 characters");
      return;
    }

    Axios.post("http://localhost:3002/register", {
      Email: email,
      UserName: userName,
      Password: password,
    })
      .then((response) => {
        if (response.data.message === "User added!") {
          navigateTo("/login");
          setEmail("");
          setUserName("");
          setPassword("");
        } else {
          setErrorMessage("Email or username is already registered");
        }
      })
      .catch((error) => {
        console.log("Error during registration: ", error);
        setErrorMessage("Error during registration. Please try again.");
      });
  };

  return (
    <div className="register-page">
      <div className="register">
        <a href="/" className="page-title">
          Placeholder
        </a>
        <div className="wrapper">
          <h1>Sign-Up</h1>
          <form>
            <div className="input-box">
              <input
                type="email"
                placeholder="Enter email"
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
            <div className="input-box">
              <input
                type="username"
                placeholder="Enter username"
                name="username"
                onChange={(event) => {
                  setUserName(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Enter password"
                name="password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Confirm password"
                name="confirmPassword"
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
            <button type="submit" className="btn-register" onClick={creatUser}>
              Register
            </button>
          </form>
          <div className="register-link">
            <p>
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
          <span>{errorMessage}</span>
        </div>
      </div>
    </div>
  );
}
