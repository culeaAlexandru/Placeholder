// Import necessary modules and components
import React, { useState, useEffect } from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardProfile() {
  // State variables
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate(); //
  const [profileData, setProfileData] = useState({
    // User's profile data
    firstName: "",
    secondName: "",
    country: "",
    currency: "",
    pronun: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [inputValues, setInputValues] = useState({
    firstName: "",
    secondName: "",
    country: "",
    currency: "",
  });
  const [selectedPronoun, setSelectedPronoun] = useState("");
  const [pronunInput, setPronun] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [changeUsernameMode, setChangeUsernameMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Effect hook to check login status on component mount
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

  // Effect hook to navigate to login page if user is not logged in
  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Function to toggle the modal for logout confirmation
  const toggleModal = () => {
    setModal(!modal);
  };

  // Effect hook to add or remove 'active-modal' class to body based on modal state
  useEffect(() => {
    if (modal) {
      document.body.classList.add("active-modal");
    } else {
      document.body.classList.remove("active-modal");
    }
  }, [modal]);

  // Function to handle pronoun selection
  const handlePronounSelect = (pronoun) => {
    setPronun(pronoun);
    setSelectedPronoun(pronoun);
  };

  // Function to save user profile data
  const handleSaveUser = async () => {
    const userData = {
      firstName: inputValues.firstName || profileData.firstName,
      secondName: inputValues.secondName || profileData.secondName,
      country: inputValues.country || profileData.country,
      currency: inputValues.currency || profileData.currency,
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
        setProfileData(userData);
        setEditMode(false);
        setPronun(pronunInput || profileData.pronun);
      } else {
        console.error("Unexpected response status: ", response.status);
      }
    } catch (error) {
      console.error("Error saving user data: ", error.message);
    }
  };

  // Function to fetch user's profile data
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
        setInputValues(response.data);
        setSelectedPronoun(response.data.pronun);
      } else {
        console.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error.message);
    }
  };

  // Function to handle user logout
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

  // Function to reset input values and exit edit mode
  const handleCancel = () => {
    setInputValues(profileData);
    setEditMode(false);
  };

  // Function to handle profile picture change
  const handleChange = (event) => {
    setProfilePicture(event.target.files[0]);
  };

  // Function to upload profile picture
  const handleClick = async () => {
    const formData = new FormData();
    formData.append("profilePicture", profilePicture);
    formData.append("username", username);

    try {
      const response = await axios.post(
        "http://localhost:3002/upload-profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Profile picture uploaded successfully", response.data);
    } catch (error) {
      console.error("Error uploading profile picture", error);
    }
  };

  // Function to handle password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      console.error("New password and confirm password do not match");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3002/change-password",
        {
          username: username,
          newPassword: newPassword,
        }
      );

      if (response.status === 200) {
        console.log("Password changed successfully");
        setNewPassword("");
        setConfirmPassword("");
        setChangePasswordMode(false);
      } else {
        console.error("Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error.message);
    }
  };

  // Function to handle username change
  const handleUsernameChange = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3002/change-username",
        {
          username: username,
          newUsername: newUsername,
        }
      );

      if (response.status === 200) {
        console.log("Username changed successfully");
        setUsername(newUsername);
        setNewUsername("");
        setChangeUsernameMode(false);
      } else {
        console.error("Failed to change username");
      }
    } catch (error) {
      console.error("Error changing username:", error.message);
    }
  };

  // JSX content
  return (
    <div className="dashboard">
      <div className="page-title">
        {/* Link to homepage */}
        <Link to="/" className="custom-link">
          <h2>Placeholder</h2>
        </Link>
      </div>
      <div className="container-middle">
        <div className="profile-form">
          {/* Profile form inputs */}
          {/* First Name */}
          <label htmlFor="firstName">
            First Name:{" "}
            {editMode ? (
              <input
                type="text"
                value={inputValues.firstName}
                onChange={(e) =>
                  setInputValues({ ...inputValues, firstName: e.target.value })
                }
                placeholder={profileData.firstName}
              />
            ) : (
              <span>{profileData.firstName}</span>
            )}
          </label>
          <br />
          {/* Second Name */}
          <label htmlFor="secondName">
            Second Name:{" "}
            {editMode ? (
              <input
                type="text"
                value={inputValues.secondName}
                onChange={(e) =>
                  setInputValues({ ...inputValues, secondName: e.target.value })
                }
                placeholder={profileData.secondName}
              />
            ) : (
              <span>{profileData.secondName}</span>
            )}
          </label>
          <br />
          {/* Country */}
          <label htmlFor="country">
            Country:{" "}
            {editMode ? (
              <input
                type="text"
                value={inputValues.country}
                onChange={(e) =>
                  setInputValues({ ...inputValues, country: e.target.value })
                }
                placeholder={profileData.country}
              />
            ) : (
              <span>{profileData.country}</span>
            )}
          </label>
          <br />
          {/* Pronoun selection */}
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
          <br />
          {/* Save and cancel buttons */}
          {editMode ? (
            <>
              <button onClick={handleSaveUser}>Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)}>Edit</button>
          )}
          {/* Profile picture upload */}
          <div>
            <input type="file" onChange={handleChange} />
            <button onClick={handleClick}>Upload</button>
            {/* Display uploaded profile picture */}
            {profilePicture && (
              <img
                src={URL.createObjectURL(profilePicture)}
                alt="Profile Picture"
              />
            )}
          </div>
          {/* Change password section */}
          {changePasswordMode ? (
            <>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button onClick={handlePasswordChange}>Confirm</button>
            </>
          ) : (
            <button onClick={() => setChangePasswordMode(true)}>
              Change Password
            </button>
          )}
          {/* Change username section */}
          {changeUsernameMode ? (
            <>
              <input
                type="text"
                placeholder="New Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <button onClick={handleUsernameChange}>Confirm</button>
            </>
          ) : (
            <button onClick={() => setChangeUsernameMode(true)}>
              Change Username
            </button>
          )}
        </div>
      </div>
      {/* Profile display */}
      <div className="profile">
        <div className="username">{username}</div>
        {/* Display profile picture */}
        {profilePicture ? (
          <img
            src={URL.createObjectURL(profilePicture)}
            alt="Profile Picture"
          />
        ) : (
          <img src={portrait} alt="Default Profile Picture" />
        )}
      </div>
      {/* Sidebar navigation */}
      <div className="containers-left">
        <div className="first-container">
          {/* Dashboard link */}
          <Link to="/dashboard" className="custom-link">
            <h3 className="first-container-text">Dashboard</h3>
          </Link>
        </div>
        <div className="second-container">
          {/* Links to other dashboard sections */}
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
          {/* Profile link and logout button */}
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
        {/* Logout confirmation modal */}
        <div className="modal-container">
          {modal && (
            <div className="modal">
              <div onClick={toggleModal} className="overlay"></div>
              <div className="modal-content">
                <h2>Are you sure you want to log out?</h2>
                {/* Confirm and cancel buttons */}
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
