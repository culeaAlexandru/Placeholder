import React, { useState, useEffect } from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";

export default function DashboardWatchlist() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [chartInstance, setChartInstance] = useState(null);
  const [assetSymbol, setAssetSymbol] = useState("");
  const [searchState, setSearchState] = useState({
    companyName: "",
    hasSearched: false,
  });
  const [searchResult, setSearchResult] = useState(null);
  const [savedAssets, setSavedAssets] = useState([]);
  const fromDate = "2023-03-23";
  const toDate = "2024-03-23";
  const apiKey = "SbUhzMlpiU94dp9UtJGKlPs59R6DBpGi";
  const [apiUrl, setApiUrl] = useState(
    `https://financialmodelingprep.com/api/v3/historical-chart/4hour/${assetSymbol}?from=${fromDate}&to=${toDate}&apikey=${apiKey}`
  );

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

  const searchApiUrl = `https://financialmodelingprep.com/api/v3/stock/list?apikey=${apiKey}`;

  useEffect(() => {
    if (!searchState.hasSearched || !searchState.companyName) return;

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
          setSearchResult(null);
          return;
        }

        const foundItem = data.find((item) => {
          if (!item || !item.name) return false;
          return item.name
            .toLowerCase()
            .includes(searchState.companyName.toLowerCase());
        });

        setSearchResult(foundItem ? [foundItem] : []);
        setAssetSymbol(foundItem ? foundItem.symbol : "");
        setSearchState({
          ...searchState,
          hasSearched: false,
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setSearchResult(null);
      });
  }, [searchApiUrl, searchState]);

  const handleSearch = () => {
    setSearchState({
      ...searchState,
      hasSearched: true,
    });
  };

  useEffect(() => {
    if (apiUrl) {
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Raw data: ", data);
          const filteredData = data.filter((item) => {
            const date = new Date(item.date);
            return !isNaN(date);
          });
          setData(filteredData);
          console.log(filteredData);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [apiUrl]);

  useEffect(() => {
    if (data) {
      if (chartInstance) {
        chartInstance.destroy();
      }
      drawChart();
    }
  }, [data]);

  const drawChart = () => {
    const ctx = document.getElementById("myChart").getContext("2d");
    const newChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((item) => new Date(item.date).toLocaleDateString()),
        datasets: [
          {
            label: "Close Value",
            data: data.map((item) => item.close),
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
    setChartInstance(newChartInstance);
  };

  const handleSaveAsset = () => {
    console.log(data);
    if (
      !data ||
      data.length === 0 ||
      !data[data.length - 1]?.close === undefined
    ) {
      alert(
        " This asset has no close value or the close value is not available."
      );
      return;
    }
    axios
      .post("http://localhost:3002/save-asset", {
        username: username,
        assetSymbol: assetSymbol,
      })
      .then((response) => {
        if (response.status === 200) {
          alert("Asset saved successfully!");
        } else if (response.status === 400) {
          alert("Asset is already saved.");
        } else {
          alert("Failed to save asset.");
        }
      })
      .catch((error) => {
        console.error("Error saving asset:", error);
        alert("An error occurred while saving the asset.");
      });
  };

  useEffect(() => {
    if (username.length > 0) {
      axios
        .get(`http://localhost:3002/saved-assets/${username}`)
        .then((response) => {
          setSavedAssets(response.data.savedAssets);
        })
        .catch((error) => {
          console.error("Error fetching saved assets:", error);
        });
    }
  }, [username]);

  const handleAssetButtonClick = (assetSymbol) => {
    console.log("Button clicked for asset:", assetSymbol);
    setAssetSymbol(assetSymbol);

    const newApiUrl = `https://financialmodelingprep.com/api/v3/historical-chart/4hour/${assetSymbol}?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    setApiUrl(newApiUrl);

    fetch(newApiUrl)
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter((item) => {
          const date = new Date(item.date);
          return date;
        });
        setData(filteredData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleSearchResultClick = (symbol) => {
    setAssetSymbol(symbol);
    setApiUrl(
      `https://financialmodelingprep.com/api/v3/historical-chart/4hour/${symbol}?from=${fromDate}&to=${toDate}&apikey=${apiKey}`
    );
  };

  return (
    <div className="dashboard">
      <div className="page-title">
        <Link to="/" className="custom-link">
          <h2>Placeholder</h2>
        </Link>
      </div>
      <div className="container-middle">
        <div>
          <input
            type="text"
            value={searchState.companyName}
            onChange={(e) =>
              setSearchState({
                ...searchState,
                companyName: e.target.value,
              })
            }
            placeholder="Enter company name"
          />
          <button onClick={handleSearch}>Search</button>
          {searchResult && searchResult.length > 0 ? (
            <div>
              <h2>Search Results:</h2>
              <ul>
                {searchResult.map((item) => (
                  <li
                    key={item.symbol}
                    onClick={() => handleSearchResultClick(item.symbol)}
                  >
                    <strong>Name:</strong> {item.name}
                    <strong>Symbol:</strong> {item.symbol}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No matching company found.</p>
          )}
          <button onClick={handleSaveAsset}>Save Asset</button>
          <button onClick={() => handleAssetButtonClick(assetSymbol)}>
            Update Chart
          </button>
          <div>
            <h2>Saved Assets:</h2>
            {savedAssets.length > 0 ? (
              <ul>
                {savedAssets.map((assetSymbol) => (
                  <li key={assetSymbol}>
                    <button onClick={() => handleAssetButtonClick(assetSymbol)}>
                      {assetSymbol}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved assets found.</p>
            )}
          </div>
          <canvas id="myChart"></canvas>
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
            <h4
              className="second-container-text"
              style={{ backgroundColor: "rgb(161, 161, 161)" }}
            >
              Watchlist
            </h4>
          </Link>
          <Link to="/dashboard/portfolios" className="custom-link">
            <h4 className="second-container-text">Portfolios</h4>
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
