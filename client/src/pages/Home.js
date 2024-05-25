import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../Home-page.css";
import "../Home-page-loggedIn.css";
import portrait from "../imgs/default-pp.jpg";

export default function Homepage() {
  // State variables to manage login status, slider value, slider visibility, interaction, Log out modal visibility, username, and chart data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [sliderValue, setSliderValue] = useState(0);
  // const [isSliderVisible, setIsSliderVisible] = useState(false);
  // const [isSliderInteracted, setIsSliderInteracted] = useState(false);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  // Navigation hook
  // const navigate = useNavigate();

  // Set axios default credentials to true
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

    console.log(isUserLoggedIn);
    if (isUserLoggedIn === "true") {
      setIsLoggedIn(true);
      console.log("User is logged in");
    }
  }, []);

  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    axios
      .get("http://localhost:3002/logout")
      .then(() => {
        console.log("User logged out successfully");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  // Function to handle slider input
  // const handleSliderInput = (e) => {
  //   const value = parseInt(e.target.value, 10);
  //   setSliderValue(value);
  //   showValue();
  //   setIsSliderInteracted(true);
  //   sessionStorage.setItem("riskValue", value);
  // };

  // Functions to handle slider mouse events
  // const handleSliderMouseDown = () => {
  //   showValue();
  // };

  // const handleSliderMouseUp = () => {
  //   hideValue();
  //   console.log(sliderValue);
  // };

  // const handleSliderMouseOut = (e) => {
  //   const isSliderElement = e.relatedTarget.id === "mySlider";
  //   const isValueElement = e.relatedTarget.id === "slider-value";

  //   if (!isSliderElement && !isValueElement) {
  //     hideValue();
  //   }
  // };

  // const showValue = () => {
  //   setIsSliderVisible(true);
  // };

  // const hideValue = () => {
  //   setIsSliderVisible(false);
  // };

  // Function to set slider position styles
  // const sliderPosition = (sliderValue / 10) * 100;
  // const sliderStyles = {
  //   left: `${sliderPosition}%`,
  //   display: isSliderVisible ? "block" : "none",
  // };

  // // Styles for slider text position
  // const pStyles = isSliderVisible
  //   ? { position: "relative", bottom: "50px" }
  //   : {};

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

  // Effect hook to retrieve risk value from session storage
  // useEffect(() => {
  //   const riskValue = sessionStorage.getItem("riskValue");
  //   if (riskValue) {
  //     setSliderValue(parseInt(riskValue, 10));
  //     sessionStorage.removeItem("riskValue");
  //   }
  // }, []);

  // Effect hook to render chart using Chart.js
  // useEffect(() => {
  //   if (data) {
  //     if (chartRef.current) {
  //       const ctx = chartRef.current.getContext("2d");
  //       const newChartInstance = new Chart(ctx, {
  //         type: "line",
  //         data: {
  //           labels: data.map((item) =>
  //             new Date(item.date).toLocaleDateString()
  //           ),
  //           datasets: [
  //             {
  //               label: "Close Value",
  //               data: data.map((item) => item.close),
  //               borderColor: "rgba(255, 99, 132, 1)",
  //               borderWidth: 1,
  //             },
  //           ],
  //         },
  //         options: {
  //           scales: {
  //             y: {
  //               beginAtZero: false,
  //               ticks: {
  //                 font: {
  //                   size: 12,
  //                 },
  //               },
  //             },
  //             x: {
  //               display: true,
  //               ticks: {
  //                 font: {
  //                   size: 12,
  //                 },
  //               },
  //               grid: {
  //                 display: false,
  //               },
  //             },
  //           },
  //         },
  //       });
  //       chartRef.current = newChartInstance;
  //     }
  //   }
  // }, [data]);

  // // Effect hook to fetch chart data from API
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const apiUrl = `https://financialmodelingprep.com/api/v3/historical-chart/4hour/AA?from=2023-03-23&to=2024-03-23&apikey=SbUhzMlpiU94dp9UtJGKlPs59R6DBpGi`;
  //       const response = await fetch(apiUrl);
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       const filteredData = data.filter((item) => {
  //         const date = new Date(item.date);
  //         return date;
  //       });
  //       setData(filteredData);
  //     } catch (error) {
  //       console.error("Error fetching or processing data:", error);
  //       setData([]);
  //     }
  //   };

  //   fetchData();
  // }, []);

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
              <img src={portrait} alt=""></img>
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
                    Porfolios <br />
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
          // Home Header
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
      {/* Common Slider Container */}
      {/*<div className="slider-container">
        <p className="slider-text" style={pStyles}>
          Select one of the options for the risk input
        </p>
        <input
          type="range"
          className="slider"
          id="mySlider"
          value={sliderValue}
          max={10}
          onChange={handleSliderInput}
          onMouseDown={handleSliderMouseDown}
          onMouseUp={handleSliderMouseUp}
          onMouseOut={handleSliderMouseOut}
        />
        <div id="slider-value" style={sliderStyles}>
          {sliderValue}
        </div>
        <p className="risk-output">
          {isSliderInteracted
            ? sliderValue === 0
              ? "Please insert a valid risk value"
              : `The risk selected is: ${sliderValue}`
            : ""}
        </p>
      </div>*/}
    </div>
  );
}
// Function to handle continue button click

// const handleContinue = async (e) => {
//   e.preventDefault();
//   console.log("Called");

//   console.log("Saving risk value for user:", username);
//   console.log("Risk value:", sliderValue);

//   if (!isLoggedIn) {
//     sessionStorage.setItem("riskValue", sliderValue);
//     navigate("/login");
//   } else {
//     try {
//       const response = await axios.post("http://localhost:3002/save-risk", {
//         username: username,
//         riskValue: sliderValue,
//       });

//       if (response.status === 200) {
//         console.log("Risk value saved successfully");
//         navigate("/dashboard/invest");
//       }
//     } catch (error) {
//       console.error("Error saving risk value:", error.message);
//     }
//   }
// };
