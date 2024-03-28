import React, { useState, useEffect } from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardPortfolios() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState("");
  const [portfolioData, setPortfolioData] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (username.length > 0) {
      const fetchPortfolioData = async () => {
        try {
          const response = await axios.post(
            "http://localhost:3002/get-portfolio-data",
            {
              username: username,
            }
          );
          if (response.status === 200) {
            setPortfolioData(response.data.portfolioData);
          }
        } catch (error) {
          console.error("Error fetching portfolio data:", error);
        }
      };
      fetchPortfolioData();
    }
  }, [username]);

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
        <div className="portfolio-data">
          {portfolioData.map((portfolio, innerIndex) => (
            <div key={innerIndex}>
              <p>Portfolio {innerIndex + 1}</p>
              <p>Balance Input: {portfolio.balanceInput}</p>
              <p>Risk Input A: {portfolio.riskInputA}</p>
              {portfolio.assets === 2 && (
                <p>Risk Input B: {portfolio.riskInputB}</p>
              )}
              <p>First Asset: {portfolio.firstAsset}</p>
              {portfolio.assets === 2 && (
                <p>Second Asset: {portfolio.firstAsset}</p>
              )}
              <p>Balance Result: {portfolio.balanceResult}</p>
            </div>
          ))}
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
            <h4
              className="second-container-text"
              style={{ backgroundColor: "rgb(161, 161, 161)" }}
            >
              Portfolios
            </h4>
          </Link>
        </div>
        <div className="third-container">
          <Link to="/dashboard/profile" className="custom-link">
            <h4 className="third-container-text">Profile</h4>
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
