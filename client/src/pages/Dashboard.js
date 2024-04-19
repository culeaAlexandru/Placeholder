import React, { useState, useEffect } from "react";
import axios from "axios";
import portrait from "../imgs/default-pp.jpg";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import "../Modal.css";

export default function Dashboard() {
  // State variables to manage login status, Log out modal visibility, and username
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // Effect hook to check the login status when the component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3002", {
          withCredentials: true,
        });
        const { valid, username } = response.data;
        setIsLoggedIn(valid);
        setUsername(username);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  // Effect hook to redirect to the login page if not logged in
  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Function to toggle the Log out modal visibility
  const toggleModal = () => {
    setModal(!modal);
  };

  // Effect hook to add/remove CSS class based on modal visibility
  useEffect(() => {
    if (modal) {
      document.body.classList.add("active-modal");
    } else {
      document.body.classList.remove("active-modal");
    }
  }, [modal]);

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

  return (
    <div className="dashboard">
      {/* Page Title */}
      <div className="page-title">
        <Link to="/" className="custom-link">
          <h2>Placeholder</h2>
        </Link>
      </div>
      {/* Main Content */}
      <div className="container-middle">
        <h1>Hello and welcome to Placeholder</h1>
        {/* Information about Dashboard */}
        <div>
          A little information about the dashboard:
          <ul>
            <h4>Invest</h4>
            {/* Details about Invest section */}
            <li>
              In the Invest page you can calculate your outcome based on the
              balance that you have, the risk that you want to take and the
              timeframe defined by you.
            </li>
            {/* More details */}
            <li>
              If you chose to calculate based on only one asset, you can see the
              expected result without having to calculate one more asset
            </li>
            {/* More details */}
            <li>
              If you chose to calculate based on more than one asset, you can
              see the expected result of all the assets you chose in the same
              time
            </li>
            {/* More details */}
            <li>You can save the whole portfolio</li>
          </ul>
          {/* Information about Watchlist */}
          <ul>
            <h4>Watchlist</h4>
            {/* Details about Watchlist section */}
            <li>In the Watchlist page you can search for any asset you want</li>
            {/* More details */}
            <li>
              You can also add assets to the watchlist and remove them from the
              watchlist
            </li>
            {/* More details */}
            <li>
              You can also see the history of the asset based on your timeframe
            </li>
          </ul>
          {/* Information about Portfolios */}
          <ul>
            <h4>Portfolios</h4>
            {/* Details about Portfolios section */}
            <li>
              In the Portfolios page you can see the portfolios saved from the
              Invest page
            </li>
            {/* More details */}
            <li>You can also download the portfolios locally</li>
          </ul>
          {/* Information about Profile */}
          <ul>
            <h4>Profile</h4>
            {/* Details about Profile section */}
            <li>
              In the Profile page you can see the information of the user that
              you are logged in
            </li>
            {/* More details */}
            <li>
              You can also edit the information of the user that you are logged
              in
            </li>
            {/* More details */}
            <li>
              You can also change the password of the user that you are logged
              in
            </li>
            {/* More details */}
            <li>
              You can also change the profile picture of the user that you are
              logged in
            </li>
          </ul>
          {/* Other Features */}
          <ul>
            <h4>Other features</h4>
            {/* Details about other features */}
            <li>
              You can log out from any page of the dashboard by clicking log out
            </li>
            {/* More details */}
            <li>
              You can see the username and the profile picture in the top right
              corner
            </li>
            {/* More details */}
            <li>
              You can go back to the homepage by pressing the name of the page
              from any dashboard page
            </li>
          </ul>
        </div>
      </div>
      {/* Profile Section */}
      <div className="profile">
        {/* Display username */}
        <div className="username">{username}</div>
        {/* Display profile picture */}
        <img src={portrait} alt=" "></img>
      </div>
      {/* Sidebar Navigation */}
      <div className="container-left">
        {/* Dashboard link */}
        <div className="first-container">
          <Link to="/dashboard" className="custom-link">
            <h3 className="first-container-text">Dashboard</h3>
          </Link>
        </div>
        {/* Links to other dashboard sections */}
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
        {/* Profile and Logout links */}
        <div className="third-container">
          <Link to="/dashboard/profile" className="custom-link">
            <h4 className="third-container-text">Profile</h4>
          </Link>
          {/* Logout option */}
          <h4 className="third-container-text" onClick={toggleModal}>
            Log out
          </h4>
        </div>
        {/* Logout Modal */}
        <div className="modal-container">
          {modal && (
            <div className="modal">
              {/* Overlay to close modal */}
              <div onClick={toggleModal} className="overlay"></div>
              {/* Modal Content */}
              <div className="modal-content">
                <h2>Are you sure you want to log out?</h2>
                {/* Logout confirmation */}
                <Link to="/" className="custom-link">
                  <button className="modal-yes-btn" onClick={handleLogout}>
                    Yes
                  </button>
                </Link>
                {/* Cancel logout */}
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
