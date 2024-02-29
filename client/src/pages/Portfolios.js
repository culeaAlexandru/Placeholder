import React, { useState, useEffect, useRef } from "react";
import portrait from "../imgs/default-pp.jpg";
import "../Dashboard.css";
import { Link } from "react-router-dom";
import * as d3 from "d3";

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

export default function DashboardPortfolios() {
  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
  };

  if (modal) {
    document.body.classList.add("active-modal");
  } else {
    document.body.classList.remove("active-modal");
  }
  // State for checkbox and selected data
  const [isChecked, setIsChecked] = useState(false);
  const [selectedData, setSelectedData] = useState([]);

  // Reference to the chart container element
  const chartContainerRef = useRef(null);

  // Effect to handle changes in checkbox state and selected data
  useEffect(() => {
    if (isChecked) {
      console.log(selectedData);

      // Function to create and update the chart
      const chart = () => {
        const width = 950;
        const height = 500;
        const marginTop = 100;
        const marginRight = 0;
        const marginBottom = 30;
        const marginLeft = 40;

        const tickValues = Array.from({ length: 7 }, (_, i) => i + 1);

        // X and Y scales
        const x = d3
          .scaleBand()
          .domain(tickValues)
          .range([marginLeft - 50, width - marginRight + 120])
          .padding(1);

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

  // Function to handle checkbox change
  const handleCheckboxChange = (data) => {
    const selectedValue = initialData.find((d) => d.id === data.id).value;
    setSelectedData(selectedValue);
    setIsChecked(true);
  };

  return (
    <div className="dashboard">
      <div className="page-title">
        <Link to="/loggedin" className="custom-link">
          <h2>Placeholder</h2>
        </Link>
      </div>
      <div className="container-middle">
        <div id="chart">
          {/* SVG container for the chart */}
          <svg ref={chartContainerRef}></svg>
        </div>
        <div id="data">
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
      <div className="profile">
        <h4 className="name">Alexandru Culea</h4>
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
              Porfolios
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
                  <button className="modal-yes-btn">Yes</button>
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
