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
    suggestions: [],
  });
  const [searchResult, setSearchResult] = useState(null);
  const [savedAssets, setSavedAssets] = useState([]);
  const [warning, setWarning] = useState("");
  const fromDate = "2023-03-23";
  const toDate = "2024-03-23";
  const apiKey = "SbUhzMlpiU94dp9UtJGKlPs59R6DBpGi";
  const searchApiUrl = `https://financialmodelingprep.com/api/v3/stock/list?apikey=${apiKey}`;
  const [searchWarning, setSearchWarning] = useState(
    "Please search for an asset"
  );

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

  // Effect hook to navigate to login page if user is not logged in
  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Function to toggle modal visibility
  const toggleModal = () => {
    setModal(!modal);
  };

  // Effect hook to add/remove class on body based on modal visibility
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

  // Effect hook to fetch search results when searchState changes
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

        const foundItems = data.filter((item) => {
          return (
            item.name &&
            item.name.toLowerCase() === searchState.companyName.toLowerCase()
          );
        });

        setSearchResult(foundItems);
        setAssetSymbol(foundItems.length > 0 ? foundItems[0].symbol : "");
        setSearchState({
          ...searchState,
          hasSearched: false,
        });
        if (foundItems.length > 0) {
          updateChartData(foundItems[0].symbol);
        }
        setSearchWarning("");
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setSearchResult(null);
      });
  }, [searchApiUrl, searchState]);

  // Function to update chart data based on selected asset symbol
  const updateChartData = (symbol) => {
    const newApiUrl = `https://financialmodelingprep.com/api/v3/historical-chart/4hour/${symbol}?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;

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

  // Effect hook to draw chart when data changes
  useEffect(() => {
    if (data) {
      if (chartInstance) {
        chartInstance.destroy();
      }
      drawChart();
    }
    // eslint-disable-next-line
  }, [data]);

  // Function to draw chart using Chart.js
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

  // Function to handle saving asset
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
          setSavedAssets((prevSavedAssets) => [
            ...prevSavedAssets,
            assetSymbol,
          ]);
          setWarning("");
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

  // Effect hook to fetch saved assets on component mount
  useEffect(() => {
    if (username.length > 0 && savedAssets === 0) {
      setWarning("No assets were saved");
    } else if (username.length > 0 && warning === "") {
      axios
        .get(`http://localhost:3002/saved-assets/${username}`)
        .then((response) => {
          setSavedAssets(response.data.savedAssets);
        })
        .catch((error) => {
          console.error("Error fetching saved assets:", error);
        });
    }
  }, [username, savedAssets, warning]);

  // Function to handle search
  const handleSearch = () => {
    setSearchState({
      ...searchState,
      hasSearched: true,
    });
  };

  // Function to handle search input change
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

  // Function to handle button click for an asset
  const handleAssetButtonClick = (assetSymbol) => {
    console.log("Button clicked for asset:", assetSymbol);
    setAssetSymbol(assetSymbol);
    updateChartData(assetSymbol);
  };

  // Function to handle click on search result
  const handleSearchResultClick = (symbol) => {
    setAssetSymbol(symbol);
    updateChartData(symbol);
  };

  // Function to handle suggestion click
  const handleSuggestionClick = (name) => {
    setSearchState({
      ...searchState,
      companyName: name,
      suggestions: [],
    });
  };

  return (
    // Dashboard container
    <div className="dashboard">
      {/* Page title */}
      <div className="page-title">
        <Link to="/" className="custom-link">
          <h2>Placeholder</h2>
        </Link>
      </div>
      {/* Middle container */}
      <div className="container-middle">
        <div>
          {/* Search input */}
          <input
            type="text"
            value={searchState.companyName}
            onChange={handleInputChange}
            placeholder="Enter company name"
          />
          {/* Search button */}
          <button onClick={handleSearch}>Search</button>
          {/* Display search suggestions if available */}
          {searchState.suggestions.length > 0 && (
            <div>
              <h2>Search Suggestions:</h2>
              <ul>
                {searchState.suggestions.map((item) => (
                  <li
                    key={item.symbol}
                    onClick={() =>
                      handleSuggestionClick(item.name, item.symbol)
                    }
                  >
                    <strong>Name:</strong> {item.name}
                    <strong>Symbol:</strong> {item.symbol}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Display search results if available */}
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
            // Display search warning if no results
            <p>{searchWarning}</p>
          )}
          {/* Save Asset button */}
          <button onClick={handleSaveAsset}>Save Asset</button>
          {/* Display saved assets */}
          <div>
            <h2>Saved Assets:</h2>
            {savedAssets.length > 0 ? (
              <ul>
                {savedAssets.map((assetSymbol) => (
                  <li key={assetSymbol}>
                    {/* Button to view saved asset data */}
                    <button onClick={() => handleAssetButtonClick(assetSymbol)}>
                      {assetSymbol}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              // Display warning if no saved assets
              <p>{warning}</p>
            )}
          </div>
          {/* Chart canvas */}
          <canvas id="myChart"></canvas>
        </div>
      </div>
      {/* Profile container */}
      <div className="profile">
        <div className="username">{username}</div>
        {/* Placeholder image */}
        <img src={portrait} alt=" "></img>
      </div>
      {/* Left containers */}
      <div className="containers-left">
        <div className="first-container">
          {/* Link to Dashboard */}
          <Link to="/dashboard" className="custom-link">
            <h3 className="first-container-text">Dashboard</h3>
          </Link>
        </div>
        <div className="second-container">
          {/* Links to other sections */}
          <Link to="/dashboard/invest" className="custom-link">
            <h4 className="second-container-text">Invest</h4>
          </Link>
          <Link to="/dashboard/watchlist" className="custom-link">
            {/* Highlighted link for Watchlist */}
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
          {/* Links to Profile and Logout */}
          <Link to="/dashboard/profile" className="custom-link">
            <h4 className="third-container-text">Profile</h4>
          </Link>
          {/* Logout button */}
          <h4 className="third-container-text" onClick={toggleModal}>
            Log out
          </h4>
        </div>
        {/* Modal for logout confirmation */}
        <div className="modal-container">
          {modal && (
            <div className="modal">
              <div onClick={toggleModal} className="overlay"></div>
              <div className="modal-content">
                <h2>Are you sure you want to log out?</h2>
                {/* Button to confirm logout */}
                <Link to="/" className="custom-link">
                  <button className="modal-yes-btn" onClick={handleLogout}>
                    Yes
                  </button>
                </Link>
                {/* Button to cancel logout */}
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
