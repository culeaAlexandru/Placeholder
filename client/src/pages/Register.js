import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Register.css";

export default function Register() {
  // Initialize state variables for email, username, password, confirmPassword, and errorMessage
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Hook for navigation
  const navigateTo = useNavigate();

  // Function to handle user registration
  const creatUser = (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Validation checks for email
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

    // Validation checks for username
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

    // Validation checks for password
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 4) {
      setErrorMessage("Please input a password with at least 4 characters");
      return;
    }

    // Sending registration data to the server
    axios
      .post("http://localhost:3002/register", {
        Email: email,
        UserName: userName,
        Password: password,
      })
      .then((response) => {
        // Handling response from the server
        if (response.data.message === "User added!") {
          navigateTo("/login"); // Redirecting to login page upon successful registration
          setEmail(""); // Clearing input fields
          setUserName("");
          setPassword("");
        } else {
          setErrorMessage("Email or username is already registered");
        }
      })
      .catch((error) => {
        // Handling errors during registration
        console.log("Error during registration: ", error);
        setErrorMessage("Error during registration. Please try again.");
      });
  };

  // Render the Register component
  return (
    <div className="register-page">
      <div className="register">
        <a href="/" className="page-title">
          Placeholder
        </a>
        <div className="wrapper">
          <h1>Sign-Up</h1>
          {/* Registration form */}
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
            {/* Button to submit the form */}
            <button type="submit" className="btn-register" onClick={creatUser}>
              Register
            </button>
          </form>
          {/* Link to login page */}
          <div className="register-link">
            <p>
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
          {/* Error message display */}
          <span>{errorMessage}</span>
        </div>
      </div>
    </div>
  );
}
