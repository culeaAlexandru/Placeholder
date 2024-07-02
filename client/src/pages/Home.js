import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../Home-page.css";
import "../Home-page-loggedIn.css";
import portrait from "../imgs/default-pp.jpg";

export default function Homepage() {
  // State variables
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  axios.defaults.withCredentials = true;

  // Effect hook to check if the user is logged in when the component mounts
  useEffect(() => {
    axios.get("http://localhost:3002").then((res) => {
      if (res.data.valid) {
        setIsLoggedIn(true);
        setUsername(res.data.username);
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  // Effect hook to check if the user was previously logged in
  useEffect(() => {
    const isUserLoggedIn = localStorage.getItem("isLoggedIn");

    if (isUserLoggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    axios.get("http://localhost:3002/logout").catch((error) => {
      console.error("Error logging out:", error);
    });
  };

  // Ref for dropdown menu
  const menuRef = useRef(null);
  useEffect(() => {
    let handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [menuRef]);

  return (
    <div className={isLoggedIn ? "home-page-logged" : "home-page"}>
      {/* Common Header */}
      <div className="header">
        <h2 className="page-title">Placeholder</h2>
        {isLoggedIn ? (
          // LoggedIn Header
          <div className="nav-menu" ref={menuRef}>
            <div
              className="menu-trigger"
              onClick={() => {
                setOpen(!open);
              }}
            >
              <img src={portrait} alt="User" />
            </div>
            <div className={`dropdown-menu ${open ? "active" : "inactive"}`}>
              <div className="username">{username}</div>
              <div className="dropdown-links1">
                <ul className="first-container">
                  <Link to="/dashboard" className="dropdown-links">
                    Dashboard <br />
                  </Link>
                </ul>
                <ul>
                  <Link to="/dashboard/invest" className="dropdown-links">
                    Invest <br />
                  </Link>
                </ul>
                <ul>
                  <Link to="/dashboard/watchlist" className="dropdown-links">
                    Watchlist <br />
                  </Link>
                </ul>
                <ul>
                  <Link to="/dashboard/portfolios" className="dropdown-links">
                    Portfolios <br />
                  </Link>
                </ul>
                <ul className="second-container">
                  <Link to="/dashboard/profile" className="dropdown-links">
                    Profile <br />
                  </Link>
                </ul>
                <ul>
                  <Link
                    to="/"
                    className="dropdown-links"
                    onClick={handleLogout}
                  >
                    Log out <br />
                  </Link>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Home Header for users not logged in
          <div className="nav-menu-no-log">
            <li className="login-in-link" style={{ display: "inline-block" }}>
              <Link to="/login" className="custom-link">
                Login
              </Link>
            </li>
            <li className="register-link" style={{ display: "inline-block" }}>
              <Link to="/register" className="custom-link">
                Register
              </Link>
            </li>
          </div>
        )}
      </div>
    </div>
  );
}
