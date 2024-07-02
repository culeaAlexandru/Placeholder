import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Register.css";

export default function Register() {
  // State variables
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pronoun, setPronoun] = useState("");
  const [country, setCountry] = useState("");
  const [adress, setAdress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [CIPhoto, setCIPhoto] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [errorMessage, setErrorMessage] = useState("");

  const navigateTo = useNavigate();

  // Function to handle user registration
  const creatUser = (event) => {
    event.preventDefault();

    // Form validation
    if (email.trim() === "") {
      setErrorMessage("Please enter an email");
      return;
    }

    if (email.includes(" ")) {
      setErrorMessage("The email cannot contain spaces");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

    if (password.trim() === "") {
      setErrorMessage("Please enter a password");
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

    if (firstName.trim() === "") {
      setErrorMessage("Please enter a first name");
      return;
    }

    if (!/^[\p{L}\s'-]+$/u.test(firstName)) {
      setErrorMessage(
        "First Name can only contain letters, spaces, and special characters for accents or hyphens"
      );
      return;
    }

    if (lastName.trim() === "") {
      setErrorMessage("Please enter a last name");
      return;
    }

    if (!/^[\p{L}\s'-]+$/u.test(lastName)) {
      setErrorMessage(
        "Last Name can only contain letters, spaces, and special characters for accents or hyphens"
      );
      return;
    }

    if (pronoun.trim() === "") {
      setErrorMessage("Please select a pronoun");
      return;
    }

    if (country.trim() === "") {
      setErrorMessage("Please enter a country");
      return;
    }

    if (!/^[\p{L}\s'-]+$/u.test(country)) {
      setErrorMessage(
        "Country can only contain letters and special characters for accents or hyphens"
      );
      return;
    }

    if (adress.trim() === "") {
      setErrorMessage("Please enter an address");
      return;
    }

    if (!/^[\p{L}0-9\s,'-]*$/u.test(adress)) {
      setErrorMessage(
        "Address can only contain letters, numbers, and special characters for accents, hyphens, commas, or spaces"
      );
      return;
    }

    if (phoneNumber.trim() === "") {
      setErrorMessage("Please enter a phone number");
      return;
    }

    if (!/^\d+$/.test(phoneNumber)) {
      setErrorMessage("Phone Number can only contain numbers");
      return;
    }

    if (!CIPhoto) {
      setErrorMessage("Please upload a CI photo");
      return;
    }

    // Create form data for submission
    const formData = new FormData();
    formData.append("Email", email);
    formData.append("UserName", userName);
    formData.append("Password", password);
    formData.append("FirstName", firstName);
    formData.append("LastName", lastName);
    formData.append("Pronoun", pronoun);
    formData.append("Country", country);
    formData.append("Adress", adress);
    formData.append("PhoneNumber", phoneNumber);
    formData.append("CIPhoto", CIPhoto);

    // Submit form data to the server
    axios
      .post("http://localhost:3002/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.data.message === "User added!") {
          navigateTo("/login");
          setEmail("");
          setUserName("");
          setPassword("");
          setFirstName("");
          setLastName("");
          setPronoun("");
          setCountry("");
          setAdress("");
          setPhoneNumber("");
          setCIPhoto(null);
          setFileName("No file chosen");
        } else {
          setErrorMessage("Email or username is already registered");
        }
      })
      .catch((error) => {
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
          <form onSubmit={creatUser}>
            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Username"
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
                placeholder="Password"
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
            <div className="input-box">
              <input
                type="text"
                placeholder="First Name"
                name="firstName"
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Last Name"
                name="lastName"
                onChange={(event) => {
                  setLastName(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
            <div className="input-box pronouns">
              <label>Pronouns:</label>
              <label>
                <input
                  type="radio"
                  name="pronoun"
                  value="Mr"
                  onChange={(event) => {
                    setPronoun(event.target.value);
                    setErrorMessage("");
                  }}
                />
                Mr.
              </label>
              <label>
                <input
                  type="radio"
                  name="pronoun"
                  value="Mrs"
                  onChange={(event) => {
                    setPronoun(event.target.value);
                    setErrorMessage("");
                  }}
                />
                Mrs.
              </label>
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Country"
                name="country"
                onChange={(event) => {
                  setCountry(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Address"
                name="adress"
                onChange={(event) => {
                  setAdress(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Phone Number"
                name="phoneNumber"
                onChange={(event) => {
                  setPhoneNumber(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
            <div className="input-box file-input">
              <label className="file-label" htmlFor="CIPhoto">
                Upload CI Photo
              </label>
              <input
                type="file"
                id="CIPhoto"
                name="CIPhoto"
                onChange={(event) => {
                  if (event.target.files && event.target.files[0]) {
                    const file = event.target.files[0];
                    if (!file.type.startsWith("image/")) {
                      setErrorMessage("Please upload a valid image file.");
                      setCIPhoto(null);
                      setFileName("No file chosen");
                    } else {
                      setCIPhoto(file);
                      setFileName(file.name);
                      setErrorMessage("");
                    }
                  } else {
                    setCIPhoto(null);
                    setFileName("No file chosen");
                  }
                }}
              />
              <span className="file-chosen">{fileName}</span>
            </div>
            <button type="submit" className="btn-register">
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
