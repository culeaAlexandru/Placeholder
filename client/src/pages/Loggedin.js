import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "../Home-page-loggedIn.css";
import "../Home-page.css";
import { Link } from "react-router-dom";
import portrait from "../imgs/default-pp.jpg";

// Function to initialize data for each region
const initializeData = (id, region) => ({
  id,
  region,
  value: Array.from({ length: 7 }, () => Math.floor(Math.random() * 21)),
});

// Initial data array
const initialData = [
  initializeData("d1", "Asset 1"),
  initializeData("d2", "Asset 2"),
  initializeData("d3", "Asset 3"),
  initializeData("d4", "Asset 4"),
];

export default function LoggedIn() {
  const [open, setOpen] = useState(false);
  // State for checkbox and selected data
  const [isChecked, setIsChecked] = useState(false);
  const [selectedData, setSelectedData] = useState([]);

  // Reference to the chart container element
  const chartContainerRef = useRef(null);

  // Risk slider and the text
  const [sliderValue, setSliderValue] = useState(0);
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const [isSliderInteracted, setIsSliderInteracted] = useState(false);

  const handleSliderInput = (e) => {
    const value = parseInt(e.target.value, 10);
    setSliderValue(value);
    showValue();
    setIsSliderInteracted(true);
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

  let menuRef = useRef();

  useEffect(() => {
    let handler = (e) => {
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    if (isChecked) {
      console.log(selectedData);

      // Function to create and update the chart
      const chart = () => {
        const width = 600; // Increased width
        const height = 400; // Increased height
        const marginTop = 50;
        const marginRight = 50; // Added margin to the right
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

      chart();
    }
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [isChecked, selectedData]);

  const handleCheckboxChange = (data) => {
    const selectedValue = initialData.find((d) => d.id === data.id).value;
    setSelectedData(selectedValue);
    setIsChecked(true);
  };

  return (
    <div className="home-page-logged">
      <div className="header">
        <h2 className="page-title">Placeholder</h2>
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
            <h3>Alexandru Culea</h3>
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
                <Link to="/" className="dropdown-links">
                  Log out <br />
                </Link>
              </ul>
            </div>
          </div>
        </div>
      </div>
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
        <Link
          to={sliderValue === 0 ? "/loggedin" : "/dashboard/invest"}
          className="custom-link"
        >
          <button className="continue-button">Continue</button>
        </Link>
      </div>
      <div className="chart">
        <div className="chart-container">
          <svg ref={chartContainerRef}></svg>
        </div>
        <div className="data-container">
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
