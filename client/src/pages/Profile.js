import React, { useState, useEffect } from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardProfile() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [firstNameInput, setFirstName] = useState("");
  const [secondNameInput, setSecondName] = useState("");
  const [countryInput, setCountry] = useState("");
  const [currencyInput, setCurrency] = useState("");
  const [selectedPronoun, setSelectedPronoun] = useState("");
  const [pronunInput, setPronun] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    secondName: "",
    country: "",
    currency: "",
    pronun: "",
  });
  const [firstNameEditMode, setFirstNameEditMode] = useState(false);
  const [secondNameEditMode, setSecondNameEditMode] = useState(false);
  const [countryEditMode, setCountryEditMode] = useState(false);
  const [currencyEditMode, setCurrencyEditMode] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3002", {
          withCredentials: true,
        });
        const { valid, username } = response.data;
        setIsLoggedIn(valid);
        setUsername(username);
        fetchProfileData(username);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const toggleModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    if (modal) {
      document.body.classList.add("active-modal");
    } else {
      document.body.classList.remove("active-modal");
    }
  }, [modal]);

  const handlePronounSelect = (pronoun) => {
    setPronun(pronoun);
    setSelectedPronoun(pronoun);
  };

  const handleSaveUser = async () => {
    const userData = {
      firstName: firstNameInput || profileData.firstName,
      secondName: secondNameInput || profileData.secondName,
      country: countryInput || profileData.country,
      currency: currencyInput || profileData.currency,
      pronun: pronunInput || profileData.pronun,
    };

    try {
      const response = await axios.post(
        "http://localhost:3002/save-data-profile",
        {
          username: username,
          userData: userData,
        }
      );

      if (response.status === 200) {
        console.log("User data updated/created successfully");
        setFirstName(firstNameInput || profileData.firstName);
        setSecondName(secondNameInput || profileData.secondName);
        setCountry(countryInput || profileData.country);
        setCurrency(currencyInput || profileData.currency);
        setPronun(pronunInput || profileData.pronun);
      } else {
        console.error("Unexpected response status: ", response.status);
      }
    } catch (error) {
      if (!error.response) {
        console.error("No response received from server.");
      } else if (error.response.status === 401) {
        console.error("Unauthorized access.");
      } else if (error.response.status === 403) {
        console.error("Forbidden access.");
      } else {
        console.error("Error saving user data: ", error.message);
      }
    }
  };

  const fetchProfileData = async (username) => {
    try {
      const response = await axios.post(
        "http://localhost:3002/get-profile-data",
        {
          username: username,
        }
      );
      if (response.status === 200) {
        setProfileData(response.data);
      } else {
        console.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3002/logout", {
        withCredentials: true,
      });
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-title">
        <Link to="/" className="custom-link">
          <h2>Placeholder</h2>
        </Link>
      </div>
      <div className="container-middle">
        <div className="profile-form">
          <input type="hidden" name="username" value={username} />
          <label htmlFor="firstName">
            First Name: {profileData.firstName}
            {firstNameEditMode ? (
              <input
                type="text"
                name="firstName"
                value={firstNameInput}
                onChange={(e) => setFirstName(e.target.value)}
              />
            ) : (
              <span>{firstNameInput}</span>
            )}
            <button onClick={() => setFirstNameEditMode(!firstNameEditMode)}>
              Edit
            </button>
          </label>
          <br />

          <label htmlFor="secondName">
            Second Name: {profileData.secondName}
            {secondNameEditMode ? (
              <input
                type="text"
                name="secondName"
                value={secondNameInput}
                onChange={(e) => setSecondName(e.target.value)}
              />
            ) : (
              <span>{secondNameInput}</span>
            )}
            <button onClick={() => setSecondNameEditMode(!secondNameEditMode)}>
              Edit
            </button>
          </label>
          <br />

          <label htmlFor="country">
            Country: {profileData.country}
            {countryEditMode ? (
              <input
                type="text"
                name="country"
                value={countryInput}
                onChange={(e) => setCountry(e.target.value)}
              />
            ) : (
              <span>{countryInput}</span>
            )}
            <button onClick={() => setCountryEditMode(!countryEditMode)}>
              Edit
            </button>
          </label>
          <br />

          <label htmlFor="currency">
            Currency: {profileData.currency}
            {currencyEditMode ? (
              <input
                type="text"
                name="currency"
                value={currencyInput}
                onChange={(e) => setCurrency(e.target.value)}
              />
            ) : (
              <span>{currencyInput}</span>
            )}
            <button onClick={() => setCurrencyEditMode(!currencyEditMode)}>
              Edit
            </button>
          </label>
          <br />

          <div>
            <label>
              <input
                type="radio"
                name="pronoun"
                value="Mr."
                checked={selectedPronoun === "Mr."}
                onChange={() => handlePronounSelect("Mr.")}
              />
              Mr.
            </label>
            <label>
              <input
                type="radio"
                name="pronoun"
                value="Mrs."
                checked={selectedPronoun === "Mrs."}
                onChange={() => handlePronounSelect("Mrs.")}
              />
              Mrs.
            </label>
          </div>

          <button type="submit" onClick={handleSaveUser}>
            Save
          </button>
        </div>
      </div>
      <div className="profile">
        <div className="username">{username}</div>
        <img src={portrait} alt=" "></img>
      </div>
      <div className="containers-left">
        <div className="first-container">
          <Link to="/dashboard" className="custom-link">
            <h3 className="first-container-text">Dashboard</h3>
          </Link>
        </div>
        <div className="second-container">
          <Link to="/dashboard/invest" className="custom-link">
            <h4 className="second-container-text">Invest</h4>
          </Link>
          <Link to="/dashboard/watchlist" className="custom-link">
            <h4 className="second-container-text">Watchlist</h4>
          </Link>
          <Link to="/dashboard/portfolios" className="custom-link">
            <h4 className="second-container-text">Portfolios</h4>
          </Link>
        </div>
        <div className="third-container">
          <Link to="/dashboard/profile" className="custom-link">
            <h4
              className="third-container-text"
              style={{ backgroundColor: "rgb(161, 161, 161)" }}
            >
              Profile
            </h4>
          </Link>
          <h4 className="third-container-text" onClick={toggleModal}>
            Log out
          </h4>
        </div>
        <div className="modal-container">
          {modal && (
            <div className="modal">
              <div onClick={toggleModal} className="overlay"></div>
              <div className="modal-content">
                <h2>Are you sure you want to log out?</h2>
                <Link to="/" className="custom-link">
                  <button className="modal-yes-btn" onClick={handleLogout}>
                    Yes
                  </button>
                </Link>
                <button className="modal-no-btn" onClick={toggleModal}>
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
