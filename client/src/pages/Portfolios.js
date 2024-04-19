import React, { useState, useEffect } from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import jspdf from "jspdf";

export default function DashboardPortfolios() {
  // State variables to store the login status, Log out modal visibility, user's portfolio data and to show warning message
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState("");
  const [portfolioData, setPortfolioData] = useState([]);
  const [warning, setWarning] = useState("No portfolios saved");
  const navigate = useNavigate(); // Hook for navigation

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
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  // Effect hook to redirect to login page if not logged in
  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Effect hook to fetch portfolio data when username changes
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
            setWarning("");
          } else {
            setPortfolioData([]);
          }
        } catch (error) {
          console.error("Error fetching portfolio data:", error);
        }
      };
      fetchPortfolioData();
    }
  }, [username]);

  // Function to toggle modal visibility
  const toggleModal = () => {
    setModal(!modal);
  };

  // Effect hook to add/remove CSS class for body based on modal visibility
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

  // Function to generate PDF for a specific portfolio
  const generatePdf = (index) => {
    if (
      portfolioData.length === 0 ||
      index < 0 ||
      index >= portfolioData.length
    ) {
      console.error("Invalid index or portfolio data is not available");
      return;
    }

    const pdf = new jspdf();

    setTimeout(() => {
      const portfolio = portfolioData[index];
      if (portfolio.assets === 1) {
        pdf.text(`Portfolio ${index + 1}`, 20, 20);
        pdf.text(`Balance Input: ${portfolio.balanceInput}`, 20, 30);
        pdf.text(`Risk Input A: ${portfolio.riskInputA}`, 20, 40);
        pdf.text(`First Asset: ${portfolio.firstAsset}`, 20, 50);
        pdf.text(`Balance Result: ${portfolio.balanceResult}`, 20, 60);
      } else if (portfolio.assets === 2) {
        pdf.text(`Portfolio ${index + 1}`, 20, 20);
        pdf.text(`Balance Input: ${portfolio.balanceInput}`, 20, 30);
        pdf.text(`Risk Input A: ${portfolio.riskInputA}`, 20, 40);
        pdf.text(`Risk Input B: ${portfolio.riskInputB}`, 20, 50);
        pdf.text(`First Asset: ${portfolio.firstAsset}`, 20, 60);
        pdf.text(`Second Asset: ${portfolio.secondAsset}`, 20, 70);
        pdf.text(`Balance Result: ${portfolio.balanceResult}`, 20, 80);
      }

      pdf.save(`Placeholder - Portfolio ${index + 1}.pdf`);
    }, 100);
  };

  // Render UI
  return (
    <div className="dashboard">
      {/* Page Title */}
      <div className="page-title">
        <Link to="/" className="custom-link">
          <h2>Placeholder</h2>
        </Link>
      </div>
      <div className="container-middle">
        {/* Portfolio Data */}
        <div className="portfolio-data">
          {portfolioData.length > 0 ? (
            <div>
              {portfolioData.map((portfolio, index) => (
                <div key={index}>
                  <p>Portfolio {index + 1}</p>
                  <p>Balance Input: {portfolio.balanceInput}</p>
                  <p>Risk Input A: {portfolio.riskInputA}</p>
                  {portfolio.assets === 2 && (
                    <p>Risk Input B: {portfolio.riskInputB}</p>
                  )}
                  <p>First Asset: {portfolio.firstAsset}</p>
                  {portfolio.assets === 2 && (
                    <p>Second Asset: {portfolio.secondAsset}</p>
                  )}
                  <p>Balance Result: {portfolio.balanceResult}</p>
                  <button onClick={() => generatePdf(index)}>
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>{warning}</p>
          )}
        </div>
      </div>
      {/* User Profile */}
      <div className="profile">
        <div className="username">{username}</div>
        <img src={portrait} alt=" "></img>
      </div>
      {/* Navigation Links */}
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
        {/* Modal for Logout Confirmation */}
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
