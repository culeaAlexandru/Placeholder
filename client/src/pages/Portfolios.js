import React, { useState, useEffect, useCallback } from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Chart from "chart.js/auto";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartLine,
  faEye,
  faFolder,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function DashboardPortfolios() {
  // State variables
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState("");
  const [portfolioData, setPortfolioData] = useState([]);
  const [warning, setWarning] = useState("No portfolios saved");
  const [riskFreeRate, setRiskFreeRate] = useState(null);
  const [differences, setDifferences] = useState([]);
  const navigate = useNavigate();
  const apiKey = "6DinljGuXqTXCJvUfRnUQUhpuERJy68U";

  // Effect to check login status on component mount
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

  // Effect to redirect to login page if not logged in
  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Effect to fetch portfolio data
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
            const portfolios = response.data.portfolioData;
            const updatedPortfolios = await Promise.all(
              portfolios.map(async (portfolio) => {
                const symbols = [
                  portfolio.asset1Name,
                  portfolio.asset2Name,
                  portfolio.asset3Name,
                  portfolio.asset4Name,
                ].filter(Boolean);
                const interval = portfolio.interval;
                const startDate = portfolio.startDate;
                const endDate = portfolio.endDate;

                const dataPromises = symbols.map((symbol) => {
                  const key = `${symbol}-${interval}-${startDate}-${endDate}`;
                  let historicalData = localStorage.getItem(key);
                  if (historicalData) {
                    return Promise.resolve(JSON.parse(historicalData));
                  } else {
                    return fetchHistoricalData(
                      symbol,
                      interval,
                      startDate,
                      endDate
                    ).then((data) => {
                      localStorage.setItem(key, JSON.stringify(data));
                      return data;
                    });
                  }
                });

                const allData = await Promise.all(dataPromises);
                const dates = allData[0].map((entry) => entry.date);
                const closeValues = allData[0].map((entry) => entry.close);

                return {
                  ...portfolio,
                  dates,
                  closeValues,
                  symbols,
                };
              })
            );
            setPortfolioData(updatedPortfolios);
            setWarning("");
            setDifferences(new Array(updatedPortfolios.length).fill({}));
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

  // Effect to fetch risk-free rate
  useEffect(() => {
    const fetchRiskFreeRate = async () => {
      const cachedRate = sessionStorage.getItem("riskFreeRate");
      if (cachedRate) {
        setRiskFreeRate(parseFloat(cachedRate));
      } else {
        const apiKey = "M4H1P0NX0B015FR8";
        const url = `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=monthly&maturity=3month&apikey=${apiKey}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data["data"] && data["data"].length > 0) {
            const firstRate = parseFloat(data["data"][0]["value"]);
            sessionStorage.setItem("riskFreeRate", firstRate);
            setRiskFreeRate(firstRate);
          } else {
            console.error("Unexpected API response format:", data);
          }
        } catch (error) {
          console.error("Error fetching risk-free rate:", error);
        }
      }
    };

    fetchRiskFreeRate();
  }, []);

  // Utility functions for calculating financial metrics
  const calculateReturns = (data) => {
    if (!data || data.length < 2) return [];
    const returns = data.slice(1).map((currentClose, index) => {
      const previousClose = data[index].close;
      if (previousClose === 0) return undefined;
      const change =
        ((currentClose.close - previousClose) / previousClose) * 100;
      return change;
    });
    return returns.filter((r) => r !== undefined);
  };

  const calculateCovariance = (x, y) => {
    const n = x.length;
    const meanX = x.reduce((acc, curr) => acc + curr, 0) / n;
    const meanY = y.reduce((acc, curr) => acc + curr, 0) / n;
    return (
      x
        .map((val, idx) => (val - meanX) * (y[idx] - meanY))
        .reduce((acc, curr) => acc + curr, 0) /
      (n - 1)
    );
  };

  const calculateStandardDeviation = (data) => {
    const n = data.length;
    const mean = data.reduce((acc, curr) => acc + curr, 0) / n;
    return Math.sqrt(
      data
        .map((x) => Math.pow(x - mean, 2))
        .reduce((acc, curr) => acc + curr, 0) /
        (n - 1)
    );
  };

  const calculateMeanReturn = (returns) => {
    const sum = returns.reduce((acc, curr) => acc + curr, 0);
    return sum / returns.length;
  };

  const calculateCorrelationMatrix = useCallback((allData) => {
    if (allData.length === 0) return [];
    let matrix = new Array(allData.length)
      .fill(0)
      .map(() => new Array(allData.length).fill(0));
    for (let i = 0; i < allData.length; i++) {
      for (let j = i; j < allData.length; j++) {
        if (i === j) {
          matrix[i][j] = 1;
        } else {
          const covariance = calculateCovariance(allData[i], allData[j]);
          const stdI = calculateStandardDeviation(allData[i]);
          const stdJ = calculateStandardDeviation(allData[j]);
          matrix[i][j] = matrix[j][i] = covariance / (stdI * stdJ);
        }
      }
    }
    return matrix;
  }, []);

  const calculatePortfolioMetrics = useCallback(
    (weights, assetsReturn, assetsVol, assetsCorrelationMatrix) => {
      const portfolioReturn = weights.reduce(
        (acc, weight, index) => acc + weight * assetsReturn[index],
        0
      );

      let portfolioVolatility = 0;
      for (let i = 0; i < weights.length; i++) {
        for (let j = 0; j < weights.length; j++) {
          portfolioVolatility +=
            weights[i] *
            weights[j] *
            assetsVol[i] *
            assetsVol[j] *
            assetsCorrelationMatrix[i][j];
        }
      }
      portfolioVolatility = Math.sqrt(portfolioVolatility);

      const sharpeRatio =
        (portfolioReturn - riskFreeRate) / portfolioVolatility;

      return {
        return: portfolioReturn,
        volatility: portfolioVolatility,
        sharpeRatio,
      };
    },
    [riskFreeRate]
  );

  // Function to fetch historical data from the API
  const fetchHistoricalData = async (symbol, interval, startDate, endDate) => {
    let apiInterval = interval;
    if (interval === "Daily") {
      apiInterval = "4hour";
    }

    const formattedStartDate = new Date(startDate).toISOString().split("T")[0];
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0];
    const url = `https://financialmodelingprep.com/api/v3/historical-chart/${apiInterval}/${symbol}?from=${formattedStartDate}&to=${formattedEndDate}&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      let data = await response.json();

      if (interval === "Daily") {
        const groupedByDate = data.reduce((acc, cur) => {
          const date = new Date(cur.date).toISOString().split("T")[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(cur);
          return acc;
        }, {});

        data = Object.keys(groupedByDate).map((date) => ({
          date,
          close:
            groupedByDate[date].reduce((sum, value) => sum + value.close, 0) /
            groupedByDate[date].length,
        }));
      }

      if (
        new Date(formattedEndDate) - new Date(formattedStartDate) >
        7 * 24 * 60 * 60 * 1000
      ) {
        const groupedByWeek = data.reduce((acc, cur) => {
          const week = new Date(cur.date).toISOString().slice(0, 10);
          if (!acc[week]) acc[week] = [];
          acc[week].push(cur);
          return acc;
        }, {});

        data = Object.keys(groupedByWeek).map((week) => ({
          date: week,
          close:
            groupedByWeek[week].reduce((sum, value) => sum + value.close, 0) /
            groupedByWeek[week].length,
        }));
      }

      return data;
    } catch (error) {
      console.error("Error fetching historical data:", error);
      return [];
    }
  };

  // Function to calculate best outcome based on percentile
  const calculateBestOutcome = useCallback((percentile, returns) => {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.ceil(percentile * sortedReturns.length) - 1;
    return sortedReturns[index];
  }, []);

  // Function to calculate date difference in days
  const calculateDateDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = Math.abs(end - start);
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  // Function to calculate new start date based on difference
  const calculateNewStartDate = (endDate, difference) => {
    const end = new Date(endDate);
    const newStart = new Date(end.setDate(end.getDate() - difference));
    return newStart.toISOString().split("T")[0];
  };

  // Function to handle check button click
  const handleCheckButton = async (index) => {
    try {
      const portfolio = portfolioData[index];
      const interval = portfolio.interval;
      const originalStartDate = portfolio.startDate;
      const originalEndDate = portfolio.endDate;

      if (!originalStartDate || !originalEndDate || !interval) {
        throw new Error(
          "Start date, end date, or interval is missing in the portfolio data."
        );
      }

      const difference = calculateDateDifference(
        originalStartDate,
        originalEndDate
      );

      const today = new Date();
      const newEndDate = today.toISOString().split("T")[0];
      const newStartDate = calculateNewStartDate(newEndDate, difference);

      const symbols = [
        portfolio.asset1Name,
        portfolio.asset2Name,
        portfolio.asset3Name,
        portfolio.asset4Name,
      ].filter(Boolean);

      const weights = [
        parseFloat(portfolio.asset1Percent),
        parseFloat(portfolio.asset2Percent),
        parseFloat(portfolio.asset3Percent),
        parseFloat(portfolio.asset4Percent),
      ]
        .filter(Boolean)
        .map((weight) => weight / 100);

      const dataPromises = symbols.map((symbol) =>
        fetchHistoricalData(symbol, interval, newStartDate, newEndDate)
      );

      const allData = await Promise.all(dataPromises);

      const returns = allData.map((data) => calculateReturns(data));

      const meanReturns = returns.map((r) => {
        const meanReturn = calculateMeanReturn(r);
        return meanReturn;
      });

      const volatilities = returns.map((r) => calculateStandardDeviation(r));

      const correlationMatrix = calculateCorrelationMatrix(returns);

      const metrics = calculatePortfolioMetrics(
        weights,
        meanReturns,
        volatilities,
        correlationMatrix
      );

      const expectedReturnDiff = (
        metrics.return - parseFloat(portfolio.expectedReturn)
      ).toFixed(2);
      const bestOutcomeDiff = (
        calculateBestOutcome(0.99, meanReturns) -
        parseFloat(portfolio.bestOutcome)
      ).toFixed(2);

      const updatedDifferences = differences.map((diff, i) =>
        i === index ? { expectedReturnDiff, bestOutcomeDiff } : diff
      );

      setDifferences(updatedDifferences);
    } catch (error) {
      console.error("Error in handleCheckButton: ", error);
    }
  };

  // Function to handle update button click
  const handleUpdateButton = async (index) => {
    try {
      const portfolio = portfolioData[index];
      const interval = portfolio.interval;
      const originalStartDate = portfolio.startDate;
      const originalEndDate = portfolio.endDate;

      if (!originalStartDate || !originalEndDate || !interval) {
        throw new Error(
          "Start date, end date, or interval is missing in the portfolio data."
        );
      }

      const difference = calculateDateDifference(
        originalStartDate,
        originalEndDate
      );

      const today = new Date();
      const newEndDate = today.toISOString().split("T")[0];
      const newStartDate = calculateNewStartDate(newEndDate, difference);

      const symbols = [
        portfolio.asset1Name,
        portfolio.asset2Name,
        portfolio.asset3Name,
        portfolio.asset4Name,
      ].filter(Boolean);

      const weights = [
        parseFloat(portfolio.asset1Percent),
        parseFloat(portfolio.asset2Percent),
        parseFloat(portfolio.asset3Percent),
        parseFloat(portfolio.asset4Percent),
      ]
        .filter(Boolean)
        .map((weight) => weight / 100);

      const dataPromises = symbols.map((symbol) =>
        fetchHistoricalData(symbol, interval, newStartDate, newEndDate)
      );

      const allData = await Promise.all(dataPromises);

      const returns = allData.map((data) => calculateReturns(data));

      const meanReturns = returns.map((r) => {
        const meanReturn = calculateMeanReturn(r);
        return meanReturn;
      });

      const volatilities = returns.map((r) => calculateStandardDeviation(r));

      const correlationMatrix = calculateCorrelationMatrix(returns);

      const metrics = calculatePortfolioMetrics(
        weights,
        meanReturns,
        volatilities,
        correlationMatrix
      );

      const updatedPortfolio = {
        ...portfolio,
        expectedReturn: metrics.return.toFixed(2),
        bestOutcome: calculateBestOutcome(0.99, meanReturns).toFixed(2),
        dateUpdated: new Date(),
      };

      const updatedPortfolios = portfolioData.map((p, i) =>
        i === index ? updatedPortfolio : p
      );
      setPortfolioData(updatedPortfolios);
      const updatedDifferences = differences.map((diff, i) =>
        i === index ? {} : diff
      );

      setDifferences(updatedDifferences);
    } catch (error) {
      console.error("Error in handleUpdateButton: ", error);
    }
  };

  // Function to handle delete button click
  const handleDeleteButton = async (index) => {
    try {
      await axios.post("http://localhost:3002/delete-portfolio", {
        username: username,
        portfolioIndex: index,
      });

      const updatedPortfolios = portfolioData.filter((_, i) => i !== index);
      const updatedDifferences = differences.filter((_, i) => i !== index);

      setPortfolioData(updatedPortfolios);
      setDifferences(updatedDifferences);
    } catch (error) {
      console.error("Error in handleDeleteButton: ", error);
    }
  };

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setModal(!modal);
  };

  // Effect to add or remove active-modal class to body based on modal states
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
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Function to generate PDF for portfolio data
  const generatePdf = async (index) => {
    if (
      portfolioData.length === 0 ||
      index < 0 ||
      index >= portfolioData.length
    ) {
      console.error("Invalid index or portfolio data is not available");
      return;
    }

    const pdf = new jsPDF();
    const portfolio = portfolioData[index];

    const addTitle = (title, startY) => {
      pdf.setFontSize(16);
      pdf.text(title, 15, startY);
      return startY + 10;
    };

    const addTable = (title, data, startY) => {
      startY = addTitle(title, startY);
      pdf.autoTable({
        head: [["Key", "Value"]],
        body: data,
        startY: startY,
      });

      return pdf.previousAutoTable.finalY;
    };

    const addChart = async (label, data, color, startY) => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");

      new Chart(ctx, {
        type: "line",
        data: {
          labels: data.labels,
          datasets: [
            {
              label: label,
              data: data.values,
              borderColor: color,
              fill: false,
            },
          ],
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const chartDataUrl = canvas.toDataURL("image/png");
      pdf.addImage(chartDataUrl, "PNG", 15, startY, 180, 100);

      return startY + 110;
    };

    const addHistoricalAndReturnsCharts = async (
      dates,
      closeValues,
      labelPrefix,
      startY
    ) => {
      const labels = dates;
      const values = closeValues;
      const returns = calculateReturns(closeValues.map((close) => ({ close })));

      let nextY = startY;
      nextY = await addChart(
        `${labelPrefix} Historical Close Values`,
        { labels, values },
        "blue",
        nextY
      );
      if (nextY > 200) {
        pdf.addPage();
        nextY = 20;
      }
      nextY += 10;
      nextY = await addChart(
        `${labelPrefix} Returns`,
        { labels, values: returns },
        "green",
        nextY
      );

      return nextY;
    };

    const addCurrentDataCharts = async (
      symbol,
      interval,
      datesLength,
      startY
    ) => {
      const currentEndDate = new Date().toISOString().split("T")[0];
      const currentStartDate = calculateNewStartDate(
        currentEndDate,
        datesLength
      );
      const currentData = await fetchHistoricalData(
        symbol,
        interval,
        currentStartDate,
        currentEndDate
      );

      const currentCloseValues = currentData.map((entry) => entry.close);
      const currentDates = currentData.map((entry) => entry.date);

      let nextY = startY;
      nextY = await addHistoricalAndReturnsCharts(
        currentDates,
        currentCloseValues,
        `Current ${symbol}`,
        nextY
      );

      return nextY;
    };

    const addHistoricalDataTable = (symbol, dates, closeValues, startY) => {
      const tableData = dates.map((date, index) => [date, closeValues[index]]);
      startY = addTitle(`Historical Data for ${symbol}`, startY);

      pdf.autoTable({
        head: [["Date", "Close Value"]],
        body: tableData,
        startY: startY,
      });

      return pdf.previousAutoTable.finalY;
    };

    const addReturnsDataTable = (symbol, dates, returns, startY) => {
      const tableData = dates
        .map((date, index) =>
          returns[index] !== undefined
            ? [date, `${returns[index].toFixed(2)}%`]
            : []
        )
        .filter((row) => row.length > 0);

      startY = addTitle(`Returns Data for ${symbol}`, startY);

      pdf.autoTable({
        head: [["Date", "Return (%)"]],
        body: tableData,
        startY: startY,
      });

      return pdf.previousAutoTable.finalY;
    };

    let startY = 20;
    startY = addTable(
      "Portfolio Data",
      [
        ["Asset 1 Name", portfolio.asset1Name],
        ["Asset 1 %", `${portfolio.asset1Percent}`],
        ["Asset 2 Name", portfolio.asset2Name || "-"],
        [
          "Asset 2 %",
          portfolio.asset2Percent ? `${portfolio.asset2Percent}` : "-",
        ],
        ["Asset 3 Name", portfolio.asset3Name || "-"],
        [
          "Asset 3 %",
          portfolio.asset3Percent ? `${portfolio.asset3Percent}` : "-",
        ],
        ["Asset 4 Name", portfolio.asset4Name || "-"],
        [
          "Asset 4 %",
          portfolio.asset4Percent ? `${portfolio.asset4Percent}` : "-",
        ],
        ["Expected Return", portfolio.expectedReturn],
        ["Risk", portfolio.risk],
        ["Best Outcome", portfolio.bestOutcome],
        ["Date Created", new Date(portfolio.dateCreated).toLocaleString()],
        ["Date Updated", new Date(portfolio.dateUpdated).toLocaleString()],
      ],
      startY
    );
    startY += 20;

    for (let i = 0; i < portfolio.symbols.length; i++) {
      const symbol = portfolio.symbols[i];
      const closeValues = portfolio.closeValues;
      const dates = portfolio.dates;

      const returns = calculateReturns(closeValues.map((close) => ({ close })));

      startY = addHistoricalDataTable(symbol, dates, closeValues, startY);
      if (startY > 200) {
        pdf.addPage();
        startY = 20;
      }
      startY += 10;
      startY = addReturnsDataTable(symbol, dates, returns, startY);
      if (startY > 200) {
        pdf.addPage();
        startY = 20;
      }

      startY = await addHistoricalAndReturnsCharts(
        dates,
        closeValues,
        `Past ${symbol}`,
        startY
      );

      if (startY > 200) {
        pdf.addPage();
        startY = 20;
      }

      startY = await addCurrentDataCharts(
        symbol,
        portfolio.interval,
        portfolio.dates.length,
        startY
      );
    }

    pdf.save(`Portfolio ${index + 1}.pdf`);
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
          <Link to="/dashboard/portfolios" className="menu-item active">
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
      <div className="main-content">
        <div className="app-title-container">
          <div className="app-title">
            <Link to="/" className="custom-link">
              <h3>Placeholder</h3>
            </Link>
          </div>
        </div>
        <div className="portfolio-data">
          {portfolioData.length > 0 ? (
            <div className="portfolio-table">
              <table>
                <thead>
                  <tr>
                    <th>Nr. Crt</th>
                    <th>Asset 1 Name</th>
                    <th>Asset 1 %</th>
                    <th>Asset 2 Name</th>
                    <th>Asset 2 %</th>
                    <th>Asset 3 Name</th>
                    <th>Asset 3 %</th>
                    <th>Asset 4 Name</th>
                    <th>Asset 4 %</th>
                    <th>Expected Return</th>
                    <th>Risk</th>
                    <th>Best Outcome</th>
                    <th>Date Created</th>
                    <th>Date Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.map((portfolio, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{portfolio.asset1Name}</td>
                      <td>{portfolio.asset1Percent}</td>
                      <td>{portfolio.asset2Name || "-"}</td>
                      <td>{portfolio.asset2Percent || "-"}</td>
                      <td>{portfolio.asset3Name || "-"}</td>
                      <td>{portfolio.asset3Percent || "-"}</td>
                      <td>{portfolio.asset4Name || "-"}</td>
                      <td>{portfolio.asset4Percent || "-"}</td>
                      <td>
                        {portfolio.expectedReturn}
                        {differences[index] &&
                          differences[index].expectedReturnDiff !== "0.00" &&
                          differences[index].expectedReturnDiff !== undefined &&
                          ` (${
                            differences[index].expectedReturnDiff > 0 ? "+" : ""
                          }${differences[index].expectedReturnDiff})`}
                      </td>
                      <td>{portfolio.risk}</td>
                      <td>
                        {portfolio.bestOutcome}
                        {differences[index] &&
                          differences[index].bestOutcomeDiff !== "0.00" &&
                          differences[index].bestOutcomeDiff !== undefined &&
                          ` (${
                            differences[index].bestOutcomeDiff > 0 ? "+" : ""
                          }${differences[index].bestOutcomeDiff})`}
                      </td>
                      <td>
                        {new Date(portfolio.dateCreated).toLocaleString()}
                      </td>
                      <td>
                        {new Date(portfolio.dateUpdated).toLocaleString()}
                      </td>
                      <td className="actions">
                        <button
                          className="btn download"
                          onClick={() => generatePdf(index)}
                        >
                          Download
                        </button>
                        <button
                          className="btn check"
                          onClick={() => handleCheckButton(index)}
                        >
                          Check
                        </button>
                        <button
                          className="btn update"
                          onClick={() => handleUpdateButton(index)}
                        >
                          Update
                        </button>
                        <button
                          className="btn delete"
                          onClick={() => handleDeleteButton(index)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>{warning}</p>
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
    </div>
  );
}
