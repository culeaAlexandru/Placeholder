import React, { useState, useEffect } from "react";
import axios from "axios";
import portrait from "../imgs/default-pp.jpg";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import "../Modal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartLine,
  faEye,
  faFolder,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
  // State variables
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [cardModal, setCardModal] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRequests, setAdminRequests] = useState([]);
  const [currentCard, setCurrentCard] = useState("");
  const navigate = useNavigate();

  // Effect to check login status when component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3002", {
          withCredentials: true,
        });
        const { valid, username, admin } = response.data;
        setIsLoggedIn(valid);
        setUsername(username);
        setIsAdmin(admin);
        if (admin) {
          fetchAdminRequests(); // Fetch admin verification requests if user is an admin
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    // Function to fetch admin requests if user is an admin
    const fetchAdminRequests = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3002/admin/verify-requests",
          {
            withCredentials: true,
          }
        );
        setAdminRequests(response.data);
      } catch (error) {
        console.error("Error fetching admin requests:", error);
      }
    };

    checkLoginStatus();
  }, []);

  // Effect to navigate to login page if user is not logged in
  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setModal(!modal);
  };

  // Function to toggle the card modal visibility and set current card
  const toggleCardModal = (cardTitle) => {
    setCurrentCard(cardTitle);
    setCardModal(!cardModal);
  };

  // Effect to add or remove active-modal class to body based on modal states
  useEffect(() => {
    if (modal || cardModal) {
      document.body.classList.add("active-modal");
    } else {
      document.body.classList.remove("active-modal");
    }
  }, [modal, cardModal]);

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3002/logout", {
        withCredentials: true,
      });
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Function to update admin status of a user
  const updateAdminStatus = async (email, status) => {
    try {
      await axios.post(
        "http://localhost:3002/admin/update-verify-status",
        {
          email,
          status,
        },
        {
          withCredentials: true,
        }
      );
      setAdminRequests(
        adminRequests.filter((request) => request.email !== email)
      );
    } catch (error) {
      console.error("Error updating admin status:", error);
    }
  };

  // Card contents for different dashboard sections
  const cardContents = {
    Invest: (
      <div>
        <p>This guide will help you use the Invest page:</p>
        <ol>
          <li>
            <strong>Select Assets:</strong> Choose 2-4 assets by typing the name
            or symbol. Click suggestions to select.
          </li>
          <li>
            <strong>Manage Search Bars:</strong> Add (+) or remove (-) search
            bars. Click 'X' to remove an asset.
          </li>
          <li>
            <strong>Set Investment Period:</strong> Choose start and end dates
            for your investment.
          </li>
          <li>
            <strong>Select Data Interval:</strong> Choose data intervals like
            Daily or Hourly.
          </li>
          <li>
            <strong>Review and Confirm:</strong> Review your selections. A line
            chart will show the historical data.
          </li>
          <li>
            <strong>Monte Carlo Simulation:</strong> View simulation results and
            detailed metrics for portfolios.
          </li>
        </ol>
        <p>
          You can save, delete, or buy portfolios based on simulation results.
        </p>
      </div>
    ),
    Watchlist: (
      <div>
        <p>This guide will help you use the Watchlist page:</p>
        <ol>
          <li>
            <strong>Search for Assets:</strong> Type the name or symbol of an
            asset. Suggestions will appear as you type. Click a suggestion to
            select it.
          </li>
          <li>
            <strong>Select Dates:</strong> Choose start and end dates for
            viewing historical data.
          </li>
          <li>
            <strong>Select Interval:</strong> Choose a data interval (e.g.,
            Daily, Hourly).
          </li>
          <li>
            <strong>Save Assets:</strong> Save assets to your watchlist for easy
            access later.
          </li>
          <li>
            <strong>View Saved Assets:</strong> View and manage assets you've
            saved to your watchlist after inputting the start date, end date and
            the interval.
          </li>
          <li>
            <strong>Toggle Data View:</strong> Switch between historical data
            and returns using the toggle switch.
          </li>
        </ol>
      </div>
    ),
    Portfolios: (
      <div>
        <p>This guide will help you use the Portfolios page:</p>
        <ol>
          <li>
            <strong>View Portfolios:</strong> Access your saved portfolios,
            including details like asset names, percentages, expected return,
            and risk.
          </li>
          <li>
            <strong>Check and Update:</strong> Check the current performance of
            a portfolio and update its metrics.
          </li>
          <li>
            <strong>Download PDF:</strong> Generate and download a PDF report of
            your portfolio.
          </li>
          <li>
            <strong>Delete Portfolios:</strong> Remove portfolios you no longer
            need.
          </li>
        </ol>
      </div>
    ),
    Profile: (
      <div>
        <p>This guide will help you use the Profile page:</p>
        <ol>
          <li>
            <strong>View Profile:</strong> See your first name, last name,
            country, and pronoun.
          </li>
          <li>
            <strong>Edit Profile:</strong> Click "Edit" to modify your profile
            details and save changes.
          </li>
          <li>
            <strong>Change Password:</strong> Click "Change Password" to update
            your password.
          </li>
          <li>
            <strong>Log Out:</strong> Use the log out option to securely exit
            your account.
          </li>
        </ol>
      </div>
    ),
    "Other features": (
      <div>
        <h3>Other Features</h3>
        <p>
          This guide will help you use additional features of the dashboard:
        </p>
        <ol>
          <li>
            <strong>Log Out:</strong> You can log out from any page of the
            dashboard by clicking the "Log out" button in the sidebar.
          </li>
          <li>
            <strong>Profile Information:</strong> Your username and profile
            picture are displayed in the top right corner of the dashboard.
          </li>
          <li>
            <strong>Homepage Navigation:</strong> Click on the name of the page
            (e.g., "Placeholder") at the top of the dashboard to go back to the
            homepage.
          </li>
        </ol>
      </div>
    ),
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="profile">
          <img src={portrait} alt=""></img>
          <span className="username" placeholder="">
            {username || "\u00A0"}
          </span>
        </div>
        <nav className="menu">
          <Link to="/dashboard" className="menu-item">
            <FontAwesomeIcon icon={faHome} className="menu-icon" /> Dashboard
          </Link>
          <Link to="/dashboard/invest" className="menu-item">
            <FontAwesomeIcon icon={faChartLine} className="menu-icon" /> Invest
          </Link>
          <Link to="/dashboard/watchlist" className="menu-item">
            <FontAwesomeIcon icon={faEye} className="menu-icon" /> Watchlist
          </Link>
          <Link to="/dashboard/portfolios" className="menu-item">
            <FontAwesomeIcon icon={faFolder} className="menu-icon" /> Portfolios
          </Link>
        </nav>
        <div className="bottom-links">
          <Link to="/dashboard/profile" className="menu-item">
            <FontAwesomeIcon icon={faUser} className="menu-icon" /> Profile
          </Link>
          <div className="menu-item" onClick={toggleModal}>
            <FontAwesomeIcon icon={faSignOutAlt} className="menu-icon" /> Log
            out
          </div>
        </div>
      </div>
      <div className="main-content-dashboard">
        <div className="app-title-container">
          <div className="app-title">
            <Link to="/" className="custom-link">
              <h3>Placeholder</h3>
            </Link>
          </div>
        </div>
        <div className="content">
          {isAdmin ? (
            <div className="admin-requests">
              <h3>Admin Verification Requests</h3>
              <ul>
                {adminRequests.map((request) => (
                  <li key={request.email} className="request-card">
                    <p>Username: {request.username}</p>
                    <p>Email: {request.email}</p>
                    <p>First Name: {request.firstName}</p>
                    <p>Last Name: {request.lastName}</p>
                    <p>Country: {request.country}</p>
                    <p>Address: {request.adress}</p>
                    <p>Phone Number: {request.phoneNumber}</p>
                    <p>
                      CI Photo:{" "}
                      <img
                        src={request.CIPhoto}
                        alt="CI"
                        className="ci-photo"
                      />
                    </p>
                    <div className="button-group">
                      <button
                        className="btn"
                        onClick={() =>
                          updateAdminStatus(request.email, "Accepted")
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="btn"
                        onClick={() =>
                          updateAdminStatus(request.email, "Rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="welcome-content">
              <h2>Below you can find some information about the page</h2>
              <div className="card-container">
                {Object.keys(cardContents).map((cardTitle) => (
                  <div
                    key={cardTitle}
                    className="card"
                    onClick={() => toggleCardModal(cardTitle)}
                  >
                    <h2>{cardTitle}</h2>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {modal && (
        <div className="modal-container">
          <div className="modal">
            <div onClick={toggleModal} className="overlay"></div>
            <div className="modal-content">
              <h2>Are you sure you want to log out?</h2>
              <Link to="/" className="custom-link">
                <button className="btn modal-yes-btn" onClick={handleLogout}>
                  Yes
                </button>
              </Link>
              <button className="btn modal-no-btn" onClick={toggleModal}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {cardModal && (
        <div className="modal-container">
          <div className="modal">
            <div onClick={toggleCardModal} className="overlay"></div>
            <div className="modal-content">
              <h2>{currentCard}</h2>
              {cardContents[currentCard]}
              <button className="btn modal-close-btn" onClick={toggleCardModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
