import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as d3 from "d3";
import { Link, useNavigate } from "react-router-dom";
import "../Home-page.css";
import "../Home-page-loggedIn.css";
import portrait from "../imgs/default-pp.jpg";

const initializeData = (id, region) => ({
  id,
  region,
  value: Array.from({ length: 7 }, () => Math.floor(Math.random() * 21)),
});

const initialData = [
  initializeData("d1", "Asset 1"),
  initializeData("d2", "Asset 2"),
  initializeData("d3", "Asset 3"),
  initializeData("d4", "Asset 4"),
];

export default function Homepage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const [isSliderInteracted, setIsSliderInteracted] = useState(false);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");

  const chartContainerRef = useRef(null);

  axios.defaults.withCredentials = true;

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

  useEffect(() => {
    const isUserLoggedIn = localStorage.getItem("isLoggedIn");

    console.log(isUserLoggedIn);
    if (isUserLoggedIn === "true") {
      setIsLoggedIn(true);
      console.log("User is logged in");
    }
  }, []);

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

  useEffect(() => {
    if (isChecked) {
      console.log(selectedData);

      // Function to create and update the chart
      const chart = () => {
        const width = 600;
        const height = 400;
        const marginTop = 50;
        const marginRight = 50;
        const marginBottom = 30;
        const marginLeft = 40;

        const tickValues = Array.from({ length: 7 }, (_, i) => i + 1);

        // X and Y scales
        const x = d3
          .scaleBand()
          .domain(tickValues)
          .range([marginLeft - 80, width - marginRight + 120])
          .padding(1.7);

        const y = d3
          .scaleLinear()
          .domain([0, 20])
          .range([height - marginBottom, marginTop]);

        // SVG container for the chart
        const svg = d3
          .select(chartContainerRef.current)
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height])
          .attr("style", "max-width: 100%; height: auto;");

        // Remove any existing elements within the SVG
        svg.selectAll("*").remove();

        // X-axis
        svg
          .append("g")
          .attr("transform", `translate(0,${height - marginBottom})`)
          .call(
            d3.axisBottom(x).tickValues(tickValues).tickFormat(d3.format("d"))
          )
          .call((g) => g.select(".domain").remove());

        // Y-axis
        svg
          .append("g")
          .attr("transform", `translate(${marginLeft},0)`)
          .call(
            d3
              .axisRight(y)
              .tickSize(width - marginLeft - marginRight)
              .ticks(11)
          )
          .call((g) => g.select(".domain").remove())
          .call((g) =>
            g
              .selectAll(".tick:not(:first-of-type) line")
              .attr("stroke-opacity", 0.5)
              .attr("stroke-dasharray", "2,2")
          )
          .call((g) => g.selectAll(".tick text").attr("x", 4).attr("dy", -4));

        // Line chart
        svg
          .append("path")
          .datum(selectedData)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr(
            "d",
            d3
              .line()
              .x((d, i) => x(i + 1))
              .y((d) => y(d))
          );
      };

      // Call the chart function
      chart();
    }
  }, [isChecked, selectedData]);

  const handleCheckboxChange = (data) => {
    const selectedValue = initialData.find((d) => d.id === data.id).value;
    setSelectedData(selectedValue);
    setIsChecked(true);
  };
  const handleSliderInput = (e) => {
    const value = parseInt(e.target.value, 10);
    setSliderValue(value);
    showValue();
    setIsSliderInteracted(true);
    sessionStorage.setItem("riskValue", value);
  };

  const handleSliderMouseDown = () => {
    showValue();
  };

  const handleSliderMouseUp = () => {
    hideValue();
    console.log(sliderValue);
  };

  const handleSliderMouseOut = (e) => {
    const isSliderElement = e.relatedTarget.id === "mySlider";
    const isValueElement = e.relatedTarget.id === "slider-value";

    if (!isSliderElement && !isValueElement) {
      hideValue();
    }
  };

  const showValue = () => {
    setIsSliderVisible(true);
  };

  const hideValue = () => {
    setIsSliderVisible(false);
  };

  const sliderPosition = (sliderValue / 10) * 100;
  const sliderStyles = {
    left: `${sliderPosition}%`,
    display: isSliderVisible ? "block" : "none",
  };

  const pStyles = isSliderVisible
    ? { position: "relative", bottom: "50px" }
    : {};

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

  const navigate = useNavigate();

  const handleContinue = async (e) => {
    e.preventDefault();
    console.log("Called");

    console.log("Saving risk value for user:", username);
    console.log("Risk value:", sliderValue);

    if (!isLoggedIn) {
      sessionStorage.setItem("riskValue", sliderValue);
      navigate("/login");
    } else {
      try {
        const response = await axios.post("http://localhost:3002/save-risk", {
          username: username,
          riskValue: sliderValue,
        });

        if (response.status === 200) {
          console.log("Risk value saved successfully");
          navigate("/dashboard/invest");
        }
      } catch (error) {
        console.error("Error saving risk value:", error.message);
      }
    }
  };

  useEffect(() => {
    const riskValue = sessionStorage.getItem("riskValue");
    if (riskValue) {
      setSliderValue(parseInt(riskValue, 10));
      sessionStorage.removeItem("riskValue");
    }
  }, []);

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
      <div className="slider-container">
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
        <form onSubmit={handleContinue}>
          <button className="continue-button">Continue</button>
        </form>
      </div>

      {/* Common Chart */}
      <div className="chart">
        <div className="chart-container">
          <svg ref={chartContainerRef}></svg>
        </div>
        <div className="data-container">
          {/* List of regions with checkboxes */}
          <ul>
            {initialData.map((data) => (
              <li key={data.id}>
                <span>{data.region}</span>
                <input
                  type="checkbox"
                  checked={isChecked && selectedData === data.value}
                  onChange={() => handleCheckboxChange(data)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
