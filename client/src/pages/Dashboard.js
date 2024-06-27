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
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [cardModal, setCardModal] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRequests, setAdminRequests] = useState([]);
  const [currentCard, setCurrentCard] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const toggleModal = () => {
    setModal(!modal);
  };

  const toggleCardModal = (cardTitle) => {
    setCurrentCard(cardTitle);
    setCardModal(!cardModal);
  };

  useEffect(() => {
    if (modal || cardModal) {
      document.body.classList.add("active-modal");
    } else {
      document.body.classList.remove("active-modal");
    }
  }, [modal, cardModal]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3002/logout", {
        withCredentials: true,
      });
      setIsLoggedIn(false);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

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
      console.log(`Status updated to ${status} for ${email}`);
    } catch (error) {
      console.error("Error updating admin status:", error);
    }
  };

  const cardContents = {
    Invest: (
      <div>
        <p>
          In the Invest page you can calculate your outcome based on the balance
          that you have, the risk that you want to take and the timeframe
          defined by you.
        </p>
        <p>
          If you chose to calculate based on only one asset, you can see the
          expected result without having to calculate one more asset.
        </p>
        <p>
          If you chose to calculate based on more than one asset, you can see
          the expected result of all the assets you chose in the same time.
        </p>
        <p>You can save the whole portfolio.</p>
      </div>
    ),
    Watchlist: (
      <div>
        <p>In the Watchlist page you can search for any asset you want.</p>
        <p>
          You can also add assets to the watchlist and remove them from the
          watchlist.
        </p>
        <p>
          You can also see the history of the asset based on your timeframe.
        </p>
      </div>
    ),
    Portfolios: (
      <div>
        <p>
          In the Portfolios page you can see the portfolios saved from the
          Invest page.
        </p>
        <p>You can also download the portfolios locally.</p>
      </div>
    ),
    Profile: (
      <div>
        <p>
          In the Profile page you can see the information of the user that you
          are logged in.
        </p>
        <p>
          You can also edit the information of the user that you are logged in.
        </p>
        <p>
          You can also change the password of the user that you are logged in.
        </p>
        <p>
          You can also change the profile picture of the user that you are
          logged in.
        </p>
      </div>
    ),
    "Other features": (
      <div>
        <p>
          You can log out from any page of the dashboard by clicking log out.
        </p>
        <p>
          You can see the username and the profile picture in the top right
          corner.
        </p>
        <p>
          You can go back to the homepage by pressing the name of the page from
          any dashboard page.
        </p>
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
