import React, { useState, useEffect, useRef, useCallback } from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartLine,
  faEye,
  faFolder,
  faUser,
  faSignOutAlt,
  faCalendarAlt,
  faSearch,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

export default function DashboardWatchlist() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [assetSymbol, setAssetSymbol] = useState("");
  const [searchState, setSearchState] = useState({
    companyName: "",
    hasSearched: false,
    suggestions: [],
  });
  const [searchResult, setSearchResult] = useState(null);
  const searchBarRef = useRef(null);
  const [showInput, setShowInput] = useState(true);
  const [savedAssets, setSavedAssets] = useState([]);
  const [warning, setWarning] = useState("");
  const [displayType, setDisplayType] = useState(
    localStorage.getItem("displayType") || "returns"
  );
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [interval, setInterval] = useState("Interval");
  const apiKey = "SbUhzMlpiU94dp9UtJGKlPs59R6DBpGi";
  const searchApiUrl = `https://financialmodelingprep.com/api/v3/stock/list?apikey=${apiKey}`;

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

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

  const updateChartData = useCallback(
    (symbol) => {
      if (!symbol || !startDate || !endDate || interval === "Interval") {
        return;
      }

      const fetchInterval = interval === "Daily" ? "4hour" : interval;
      const newApiUrl = `https://financialmodelingprep.com/api/v3/historical-chart/${fetchInterval}/${symbol}?apikey=${apiKey}`;

      fetch(newApiUrl)
        .then((response) => response.json())
        .then((data) => {
          const filteredData = data.filter((item) => {
            const date = new Date(item.date);
            return date >= startDate && date <= endDate;
          });
          setData(filteredData);
          if (filteredData.length === 0) {
            setWarning("Asset has no data");
          } else {
            setWarning("");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setWarning("An error occurred while fetching data.");
        });
    },
    [interval, startDate, endDate, apiKey]
  );

  useEffect(() => {
    if (searchState.hasSearched && searchState.companyName) {
      fetch(searchApiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (!data) {
            console.error("Error: Data is null");
            return;
          }

          const foundItems = data.filter((item) => {
            return (
              item.name &&
              item.name.toLowerCase() === searchState.companyName.toLowerCase()
            );
          });

          setAssetSymbol(foundItems.length > 0 ? foundItems[0].symbol : "");
          setSearchState({
            ...searchState,
            hasSearched: false,
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [searchApiUrl, searchState]);

  useEffect(() => {
    if (assetSymbol && startDate && endDate && interval) {
      updateChartData(assetSymbol);
    }
  }, [assetSymbol, startDate, endDate, interval, updateChartData]);

  const drawChart = useCallback(() => {
    const ctx = chartRef.current.getContext("2d");
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    const newChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: data
          ? data
              .map((item) => new Date(item.date).toLocaleDateString())
              .reverse() // Reverse the date labels
          : [],
        datasets: [
          {
            label: displayType === "returns" ? "Returns" : "Close Value",
            data: data
              ? displayType === "returns"
                ? calculateReturns(data.map((item) => item.close))
                : data.map((item) => item.close)
              : [],
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              font: {
                size: 12,
              },
            },
          },
          x: {
            display: true,
            ticks: {
              font: {
                size: 12,
              },
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });
    chartInstanceRef.current = newChartInstance;
  }, [data, displayType]);

  useEffect(() => {
    // Initialize the chart with empty data
    const ctx = chartRef.current.getContext("2d");
    const initialChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "No data",
            data: [],
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              font: {
                size: 12,
              },
            },
          },
          x: {
            display: true,
            ticks: {
              font: {
                size: 12,
              },
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });
    chartInstanceRef.current = initialChartInstance;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (data) {
      drawChart();
    }
  }, [data, displayType, drawChart]);

  const calculateReturns = (data) => {
    if (data.length < 2) return [];
    const returns = data.slice(1).map((currentClose, index) => {
      const previousClose = data[index];
      return ((currentClose - previousClose) / previousClose) * 100;
    });
    return returns;
  };

  const handleSaveAsset = () => {
    if (
      interval === "Interval" ||
      !data ||
      data.length === 0 ||
      data[data.length - 1]?.close === undefined
    ) {
      setWarning("Asset has no data");
      return;
    }
    axios
      .post("http://localhost:3002/save-asset", {
        username: username,
        assetSymbol: assetSymbol,
      })
      .then((response) => {
        if (response.status === 200) {
          setSavedAssets((prevSavedAssets) => [
            ...prevSavedAssets,
            assetSymbol,
          ]);
          setWarning("");
        } else if (response.status === 400) {
          setWarning("Asset is already saved.");
        } else {
          setWarning("Failed to save asset.");
        }
      })
      .catch((error) => {
        console.error("Error saving asset:", error);
        setWarning("An error occurred while saving the asset.");
      });
  };

  useEffect(() => {
    if (username.length > 0) {
      axios
        .get(`http://localhost:3002/saved-assets/${username}`)
        .then((response) => {
          const assets = response.data.savedAssets;
          setSavedAssets(assets);
          if (assets.length === 0) {
            setWarning("No assets were saved");
          } else {
            setWarning("");
          }
        })
        .catch((error) => {
          console.error("Error fetching saved assets:", error);
        });
    }
  }, [username]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchState((prevState) => ({
      ...prevState,
      companyName: input,
    }));

    if (input.trim() === "") {
      setSearchState((prevState) => ({
        ...prevState,
        suggestions: [],
      }));
      return;
    }

    fetchSuggestions(input);
  };

  const fetchSuggestions = (input) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/search?query=${input}&limit=5&apikey=${apiKey}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data) {
          console.error("Error: Data is null");
          setSearchState((prevState) => ({
            ...prevState,
            suggestions: [],
          }));
          return;
        }

        const profilePromises = data.map((item) =>
          fetch(
            `https://financialmodelingprep.com/api/v3/profile/${item.symbol}?apikey=${apiKey}`
          )
            .then((response) => response.json())
            .then((profileData) => ({
              ...item,
              profile: profileData[0],
            }))
        );

        Promise.all(profilePromises)
          .then((profiles) => {
            const filteredSuggestions = profiles
              .filter(
                (profile) =>
                  profile.profile && profile.profile.currency === "USD"
              )
              .map((profile) => ({
                name: profile.name,
                symbol: profile.symbol,
              }));

            setSearchState((prevState) => ({
              ...prevState,
              suggestions: filteredSuggestions,
            }));
          })
          .catch((error) => {
            console.error("Error fetching profiles:", error);
            setSearchState((prevState) => ({
              ...prevState,
              suggestions: [],
            }));
          });
      })
      .catch((error) => {
        console.error("Error fetching suggestions:", error);
        setSearchState((prevState) => ({
          ...prevState,
          suggestions: [],
        }));
      });
  };

  const handleInputFocus = () => {
    if (searchState.companyName.trim() !== "") {
      fetchSuggestions(searchState.companyName);
    }
  };

  const handleAssetButtonClick = (assetSymbol) => {
    setAssetSymbol(assetSymbol);
  };

  const handleSuggestionClick = (name, symbol) => {
    setSearchResult([{ name, symbol }]);
    setSearchState({
      ...searchState,
      companyName: "",
      suggestions: [],
    });
    setShowInput(false);
    setAssetSymbol(symbol);
  };

  const handleToggleChange = () => {
    const newDisplayType =
      displayType === "historical" ? "returns" : "historical";
    setDisplayType(newDisplayType);
    localStorage.setItem("displayType", newDisplayType);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setSearchState((prevState) => ({
          ...prevState,
          suggestions: [],
        }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchBarRef]);

  const handleDeleteAsset = (assetSymbol) => {
    axios
      .post("http://localhost:3002/delete-saved-asset", {
        username: username,
        assetSymbol: assetSymbol,
      })
      .then((response) => {
        if (response.status === 200) {
          setSavedAssets((prevSavedAssets) =>
            prevSavedAssets.filter((asset) => asset !== assetSymbol)
          );
        } else {
          setWarning("Failed to delete asset.");
        }
      })
      .catch((error) => {
        console.error("Error deleting asset:", error);
        setWarning("An error occurred while deleting the asset.");
      });
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="profile">
          <img src={portrait} alt="User portrait"></img>
          <span className="username">{username || "\u00A0"}</span>
        </div>
        <nav className="menu">
          <Link to="/dashboard" className="menu-item">
            <FontAwesomeIcon icon={faHome} className="menu-icon" /> Dashboard
          </Link>
          <Link to="/dashboard/invest" className="menu-item">
            <FontAwesomeIcon icon={faChartLine} className="menu-icon" /> Invest
          </Link>
          <Link to="/dashboard/watchlist" className="menu-item active">
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
      <div className="main-content">
        <div className="app-title-container">
          <div className="app-title">
            <Link to="/" className="custom-link">
              <h3>Placeholder</h3>
            </Link>
          </div>
        </div>
        <div className="content-watchlist">
          <div className="input-section">
            <div className="input-row">
              {showInput && (
                <div className="search-bar-watchlist" ref={searchBarRef}>
                  <input
                    type="text"
                    value={searchState.companyName}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder="Search for an asset"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="search-icon-watchlist"
                  />
                  {searchState.suggestions.length > 0 && (
                    <div className="suggestion-dropdown-watchlist">
                      <ul>
                        {searchState.suggestions.map((item) => (
                          <li
                            key={item.symbol}
                            onClick={() =>
                              handleSuggestionClick(item.name, item.symbol)
                            }
                          >
                            {item.name} ({item.symbol})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {searchResult && searchResult.length > 0 && (
                <div className="search-results-watchlist">
                  <ul className="search-results-list">
                    {searchResult.map((item) => (
                      <li
                        key={item.symbol}
                        className="search-result-item-watchlist"
                      >
                        <span className="search-result-text">
                          {item.name} ({item.symbol})
                        </span>
                        {warning && (
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            title={warning}
                            style={{
                              color: "red",
                              marginLeft: "3px",
                              marginBottom: "1px",
                            }}
                          />
                        )}
                        <button
                          className="delete-button"
                          onClick={() => {
                            setShowInput(true);
                            setSearchResult(null);
                            setWarning("");
                          }}
                        >
                          X
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="date-picker-wrapper-watchlist">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText="Select start date"
                  maxDate={new Date()}
                />
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="calendar-icon-watchlist-start-date"
                />
              </div>
            </div>
            <div className="input-row">
              <div className="interval-wrapper-watchlist">
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="interval-select"
                >
                  <option hidden>Interval</option>
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="30m">30 Minutes</option>
                  <option value="1hour">1 Hour</option>
                  <option value="4hour">4 Hour</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
              <div className="date-picker-wrapper-watchlist">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="Select end date"
                  maxDate={new Date()}
                  className="date-picker-input"
                />
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="calendar-icon-watchlist-end-date"
                />
              </div>
            </div>
            <div className="save-asset-wrapper">
              <button className="btn save-asset" onClick={handleSaveAsset}>
                Save Asset
              </button>
            </div>
            <div className="saved-assets">
              <h2>Saved Assets:</h2>
              {savedAssets.length > 0 && (
                <ul>
                  {savedAssets.map((assetSymbol) => (
                    <li key={assetSymbol}>
                      <button
                        className="btn view-asset"
                        onClick={() => handleAssetButtonClick(assetSymbol)}
                      >
                        {assetSymbol}
                      </button>
                      <button
                        className="delete-asset"
                        onClick={() => handleDeleteAsset(assetSymbol)}
                        title="Delete asset"
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="chart-container">
            <div className="toggle-section">
              <label className="toggle-label">
                <Toggle
                  checked={displayType === "returns"}
                  onChange={handleToggleChange}
                  icons={false}
                  className="custom-toggle"
                />
                <span
                  className={`toggle-text-left ${
                    displayType === "historical" ? "active" : ""
                  }`}
                >
                  Historical
                </span>
                <span
                  className={`toggle-text-right ${
                    displayType === "returns" ? "active" : ""
                  }`}
                >
                  Returns
                </span>
              </label>
            </div>
            <canvas id="myChart" ref={chartRef}></canvas>
          </div>
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
