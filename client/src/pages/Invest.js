import React, { useEffect, useRef, useState, useCallback } from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartLine,
  faEye,
  faFolder,
  faUser,
  faSignOutAlt,
  faExclamationTriangle,
  faPlus,
  faMinus,
  faCalendarAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

export default function DashboardInvest() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [assetSymbolA, setAssetSymbolA] = useState("");
  const [assetSymbolB, setAssetSymbolB] = useState("");
  const [assetSymbolC, setAssetSymbolC] = useState("");
  const [assetSymbolD, setAssetSymbolD] = useState("");
  const [searchStateA, setSearchStateA] = useState({
    companyName: "",
    hasSearched: false,
    suggestions: [],
  });
  const [searchStateB, setSearchStateB] = useState({
    companyName: "",
    hasSearched: false,
    suggestions: [],
  });
  const [searchStateC, setSearchStateC] = useState({
    companyName: "",
    hasSearched: false,
    suggestions: [],
  });
  const [searchStateD, setSearchStateD] = useState({
    companyName: "",
    hasSearched: false,
    suggestions: [],
  });
  const [searchResultA, setSearchResultA] = useState(null);
  const [searchResultB, setSearchResultB] = useState(null);
  const [searchResultC, setSearchResultC] = useState(null);
  const searchBarRefA = useRef(null);
  const searchBarRefB = useRef(null);
  const searchBarRefC = useRef(null);
  const searchBarRefD = useRef(null);
  const [searchResultD, setSearchResultD] = useState(null);
  const [showInputA, setShowInputA] = useState(true);
  const [showInputB, setShowInputB] = useState(true);
  const [showInputC, setShowInputC] = useState(false);
  const [showInputD, setShowInputD] = useState(false);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [interval, setIntervals] = useState("Interval");
  const [lineChartData, setLineChartData] = useState({});
  const [filteredDataA, setFilteredDataA] = useState([]);
  const [filteredDataB, setFilteredDataB] = useState([]);
  const [filteredDataC, setFilteredDataC] = useState([]);
  const [filteredDataD, setFilteredDataD] = useState([]);
  const [historicalDates, setHistoricalDates] = useState([]);
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assetsReturn, setAssetsReturn] = useState([]);
  const [assetsVol, setAssetsVol] = useState([]);
  const [assetsCorrelationMatrix, setAssetsCorrelationMatrix] = useState([]);
  const [monteCarloPortfolios, setMonteCarloPortfolios] = useState([]);
  const [efficientFrontierData, setEfficientFrontierData] = useState([]);
  const [riskFreeRate, setRiskFreeRate] = useState(null);
  const [clickedInfos, setClickedInfos] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [step, setStep] = useState(0);
  const [assetDataAvailability, setAssetDataAvailability] = useState({
    A: true,
    B: true,
    C: true,
    D: true,
  });
  const [shouldRecalculate, setShouldRecalculate] = useState(false);
  const [suggestionCache, setSuggestionCache] = useState({});

  const apiKey = "N3JAUKTbfxv2bro3C9VzFQARVY7n2Vn5";

  // Check user's login status
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3002", {
          withCredentials: true, // Sending cookies with the request
        });
        const { valid, username } = response.data; // Destructuring response data
        setIsLoggedIn(valid); // Setting login status
        setUsername(username); // Setting username
      } catch (error) {
        console.error("Error checking login status:", error); // Handling error
      }
    };

    checkLoginStatus(); // Calling function to check login status
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login"); // Redirecting to login page
    }
  }, [isLoggedIn, navigate]);

  // Function to toggle the Log out modal visibility
  const toggleModal = () => {
    setModal(!modal); // Toggling modal state
  };

  // Add/remove class for modal
  useEffect(() => {
    if (modal) {
      document.body.classList.add("active-modal"); // Adding class to body for active modal
    } else {
      document.body.classList.remove("active-modal"); // Removing class from body
    }
  }, [modal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRefA.current &&
        !searchBarRefA.current.contains(event.target)
      ) {
        setSearchStateA((prevState) => ({
          ...prevState,
          suggestions: [],
        }));
      }
      if (
        searchBarRefB.current &&
        !searchBarRefB.current.contains(event.target)
      ) {
        setSearchStateB((prevState) => ({
          ...prevState,
          suggestions: [],
        }));
      }
      if (
        searchBarRefC.current &&
        !searchBarRefC.current.contains(event.target)
      ) {
        setSearchStateC((prevState) => ({
          ...prevState,
          suggestions: [],
        }));
      }
      if (
        searchBarRefD.current &&
        !searchBarRefD.current.contains(event.target)
      ) {
        setSearchStateD((prevState) => ({
          ...prevState,
          suggestions: [],
        }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchBarRefA, searchBarRefB, searchBarRefC, searchBarRefD]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const fetchSuggestions = (input, setSearchState) => {
    if (suggestionCache[input]) {
      setSearchState((prevState) => ({
        ...prevState,
        suggestions: suggestionCache[input],
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

            setSuggestionCache((prevCache) => ({
              ...prevCache,
              [input]: filteredSuggestions,
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

  // Handle input change for asset A
  const handleInputChangeA = (e) => {
    const input = e.target.value.trim();
    setSearchStateA((prevState) => ({
      ...prevState,
      companyName: input,
    }));

    if (!input) {
      setSearchStateA((prevState) => ({
        ...prevState,
        suggestions: [],
      }));
      return;
    }

    debounce(() => fetchSuggestions(input, setSearchStateA), 50)();
  };

  // Handle input change for asset B
  const handleInputChangeB = (e) => {
    const input = e.target.value.trim();
    setSearchStateB((prevState) => ({
      ...prevState,
      companyName: input,
    }));

    if (!input) {
      setSearchStateB((prevState) => ({
        ...prevState,
        suggestions: [],
      }));
      return;
    }

    debounce(() => fetchSuggestions(input, setSearchStateB), 50)();
  };

  const handleInputChangeC = (e) => {
    const input = e.target.value.trim();
    setSearchStateC((prevState) => ({
      ...prevState,
      companyName: input,
    }));

    if (!input) {
      setSearchStateC((prevState) => ({
        ...prevState,
        suggestions: [],
      }));
      return;
    }

    debounce(() => fetchSuggestions(input, setSearchStateC), 50)();
  };

  const handleInputChangeD = (e) => {
    const input = e.target.value.trim();
    setSearchStateD((prevState) => ({
      ...prevState,
      companyName: input,
    }));

    if (!input) {
      setSearchStateD((prevState) => ({
        ...prevState,
        suggestions: [],
      }));
      return;
    }

    debounce(() => fetchSuggestions(input, setSearchStateD), 50)();
  };

  // Function to handle click on a suggestion for asset A
  const handleSuggestionClickA = (name, symbol) => {
    setSearchResultA([{ name, symbol }]);
    // setLastValidSearchResultA([{ name, symbol }]);
    setSearchStateA({
      ...searchStateA,
      companyName: "",
      suggestions: [], // Clear suggestions
    });
    setShowInputA(false); // Hiding input field
    setAssetSymbolA(symbol ? symbol : ""); // Setting asset symbol
  };

  // Function to handle click on a suggestion for asset B
  const handleSuggestionClickB = (name, symbol) => {
    setSearchResultB([{ name, symbol }]);
    // setLastValidSearchResultB([{ name, symbol }]);
    setSearchStateB({
      ...searchStateB,
      companyName: "",
      suggestions: [], // Clear suggestions
    });
    setShowInputB(false); // Hiding input field
    setAssetSymbolB(symbol ? symbol : ""); // Setting asset symbol
  };

  const handleSuggestionClickC = (name, symbol) => {
    setSearchResultC([{ name, symbol }]);
    // setLastValidSearchResultC([{ name, symbol }]);
    setSearchStateC({
      ...searchStateC,
      companyName: "",
      suggestions: [], // Clear suggestions
    });
    setShowInputC(false); // Hiding input field
    setAssetSymbolC(symbol ? symbol : ""); // Setting asset symbol
  };
  const handleSuggestionClickD = (name, symbol) => {
    setSearchResultD([{ name, symbol }]);
    // setLastValidSearchResultD([{ name, symbol }]);
    setSearchStateD({
      ...searchStateD,
      companyName: "",
      suggestions: [], // Clear suggestions
    });
    setShowInputD(false); // Hiding input field
    setAssetSymbolD(symbol ? symbol : ""); // Setting asset symbol
  };

  const handleInputFocusA = () => {
    if (searchStateA.companyName.trim() !== "") {
      if (suggestionCache[searchStateA.companyName.trim()]) {
        setSearchStateA((prevState) => ({
          ...prevState,
          suggestions: suggestionCache[searchStateA.companyName.trim()],
        }));
      } else {
        fetchSuggestions(searchStateA.companyName, setSearchStateA);
      }
    }
  };

  const handleInputFocusB = () => {
    if (searchStateB.companyName.trim() !== "") {
      if (suggestionCache[searchStateB.companyName.trim()]) {
        setSearchStateB((prevState) => ({
          ...prevState,
          suggestions: suggestionCache[searchStateB.companyName.trim()],
        }));
      } else {
        fetchSuggestions(searchStateB.companyName, setSearchStateB);
      }
    }
  };

  const handleInputFocusC = () => {
    if (searchStateC.companyName.trim() !== "") {
      if (suggestionCache[searchStateC.companyName.trim()]) {
        setSearchStateC((prevState) => ({
          ...prevState,
          suggestions: suggestionCache[searchStateC.companyName.trim()],
        }));
      } else {
        fetchSuggestions(searchStateC.companyName, setSearchStateC);
      }
    }
  };

  const handleInputFocusD = () => {
    if (searchStateD.companyName.trim() !== "") {
      if (suggestionCache[searchStateD.companyName.trim()]) {
        setSearchStateD((prevState) => ({
          ...prevState,
          suggestions: suggestionCache[searchStateD.companyName.trim()],
        }));
      } else {
        fetchSuggestions(searchStateD.companyName, setSearchStateD);
      }
    }
  };

  const calculateReturns = (data) => {
    if (data.length < 2) return [];
    console.log("Input data for calculateReturns: ", data); // Log input data

    const returns = data.slice(1).map((currentClose, index) => {
      const previousClose = data[index];
      if (previousClose === 0) return undefined;
      const percentageChange =
        ((currentClose - previousClose) / previousClose) * 100;
      return percentageChange;
    });

    console.log("Calculated returns (before filtering undefined): ", returns); // Log calculated returns
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

  const calculateVolatility = (returns, meanReturn) => {
    const variance =
      returns.reduce((acc, curr) => acc + Math.pow(curr - meanReturn, 2), 0) /
      (returns.length - 1);
    return Math.sqrt(variance);
  };

  const calculateCorrelationMatrix = useCallback((allData) => {
    if (allData.length === 0) return [];
    // Assuming allData is an array of arrays of returns
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

  const formatDate = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!shouldRecalculate) return;

      setIsLoading(true); // Start loading

      const symbols = [
        assetSymbolA,
        assetSymbolB,
        assetSymbolC,
        assetSymbolD,
      ].filter(Boolean);
      const setters = [
        setFilteredDataA,
        setFilteredDataB,
        setFilteredDataC,
        setFilteredDataD,
      ];

      if (symbols.length < 2) {
        setIsLoading(false); // Stop loading if not enough symbols
        return;
      }

      const fetchInterval = interval === "Daily" ? "4hour" : interval;

      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      console.log("Fetching data for symbols:", symbols);

      const dataPromises = symbols.map((symbol, index) => {
        if (!symbol) {
          setters[index]([]);
          return Promise.resolve([]);
        }

        console.log(`API triggered for symbol: ${symbol}`);

        const url = `https://financialmodelingprep.com/api/v3/historical-chart/${fetchInterval}/${symbol}?from=${formattedStartDate}&to=${formattedEndDate}&apikey=${apiKey}`;
        console.log(url);

        return fetch(url)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetched data for ${symbol}:`, data);

            if (interval === "Daily") {
              const groupedByDate = data.reduce((acc, cur) => {
                const date = new Date(cur.date).toISOString().split("T")[0];
                if (!acc[date]) acc[date] = [];
                acc[date].push(cur.close);
                return acc;
              }, {});

              data = Object.entries(groupedByDate).map(([date, values]) => {
                const average =
                  values.reduce((a, b) => a + b, 0) / values.length;
                return { date, close: average };
              });

              console.log(
                `Processed data for ${symbol} (Daily interval):`,
                data
              );
            }

            const closes = data.map((entry) => entry.close);
            console.log(`Closing prices for ${symbol}:`, closes);

            const returns = calculateReturns(closes);
            console.log(`Calculated returns for ${symbol}:`, returns);

            const validReturns = returns.filter(
              (r) => r !== null && r !== undefined
            );

            console.log(`Valid returns for ${symbol}:`, validReturns);

            setters[index](validReturns);
            setHistoricalDates(data.map((entry) => entry.date));

            setAssetDataAvailability((prev) => ({
              ...prev,
              [String.fromCharCode(65 + index)]: validReturns.length > 0,
            }));

            return validReturns;
          });
      });

      const allData = await Promise.all(dataPromises);

      console.log("All data after processing:", allData);

      const meanReturns = allData.map((r) => calculateMeanReturn(r));
      console.log("Mean returns:", meanReturns);

      const volatilities = allData.map((r, index) =>
        calculateVolatility(r, meanReturns[index])
      );
      console.log("Volatilities:", volatilities);

      const correlationMatrix = calculateCorrelationMatrix(allData);
      console.log("Correlation matrix:", correlationMatrix);

      setAssetsReturn(meanReturns);
      setAssetsVol(volatilities);
      setAssetsCorrelationMatrix(correlationMatrix);
      setDataFetched(true);

      sessionStorage.setItem("meanReturns", JSON.stringify(meanReturns));

      setShouldRecalculate(false);
      setIsLoading(false); // Stop loading after data is fetched and processed
    };

    if (startDate && endDate && interval !== "Interval") {
      fetchAndProcessData();
    }
  }, [
    assetSymbolA,
    assetSymbolB,
    assetSymbolC,
    assetSymbolD,
    startDate,
    endDate,
    interval,
    apiKey,
    calculateCorrelationMatrix,
    shouldRecalculate, // Added dependency
  ]);

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
  useEffect(() => {
    if (!dataFetched) return;

    const validSymbols = [
      assetSymbolA,
      assetSymbolB,
      assetSymbolC,
      assetSymbolD,
    ].filter(Boolean);

    const reversedHistoricalDates = historicalDates.slice().reverse();
    const reversedFilteredDataA = filteredDataA.slice().reverse();
    const reversedFilteredDataB = filteredDataB.slice().reverse();
    const reversedFilteredDataC = filteredDataC.slice().reverse();
    const reversedFilteredDataD = filteredDataD.slice().reverse();

    setLineChartData({
      labels: reversedHistoricalDates,
      datasets: [
        ...validSymbols.map((symbol, index) => ({
          label: symbol,
          data: [
            reversedFilteredDataA,
            reversedFilteredDataB,
            reversedFilteredDataC,
            reversedFilteredDataD,
          ][index],
          fill: false,
          borderColor: ["green", "blue", "pink", "purple"][index],
          tension: 0.1,
        })),
      ],
    });
  }, [
    filteredDataA,
    filteredDataB,
    filteredDataC,
    filteredDataD,
    assetSymbolA,
    assetSymbolB,
    assetSymbolC,
    assetSymbolD,
    historicalDates,
    dataFetched,
  ]);

  const options = {
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + "%";
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value) {
            return value.toString() + "%";
          },
        },
      },
    },
  };

  const handleClearButtonClick = () => {
    // Reset relevant states for cases 0, 1, 2, 3, and 4
    setSearchStateA({
      companyName: "",
      hasSearched: false,
      suggestions: [],
    });
    setSearchStateB({
      companyName: "",
      hasSearched: false,
      suggestions: [],
    });
    setSearchStateC({
      companyName: "",
      hasSearched: false,
      suggestions: [],
    });
    setSearchStateD({
      companyName: "",
      hasSearched: false,
      suggestions: [],
    });
    setSearchResultA(null);
    setSearchResultB(null);
    setSearchResultC(null);
    setSearchResultD(null);
    setShowInputA(true);
    setShowInputB(true);
    setShowInputC(false);
    setShowInputD(false);
    setStartDate(null);
    setEndDate(null);
    setIntervals("Interval");
    setAssetSymbolA("");
    setAssetSymbolB("");
    setAssetSymbolC("");
    setAssetSymbolD("");
    setLineChartData({});
    setFilteredDataA([]);
    setFilteredDataB([]);
    setFilteredDataC([]);
    setFilteredDataD([]);
    setHistoricalDates([]);
    setStep(0);
    setClickedInfos([]);
    setDataFetched(false);
    setAssetDataAvailability({
      A: true,
      B: true,
      C: true,
      D: true,
    });
    setShouldRecalculate(false);
  };

  const handleDeleteButtonClick = (index) => {
    const updatedSymbols = [
      assetSymbolA,
      assetSymbolB,
      assetSymbolC,
      assetSymbolD,
    ];
    const setters = [
      setSearchResultA,
      setSearchResultB,
      setSearchResultC,
      setSearchResultD,
    ];
    const symbolSetters = [
      setAssetSymbolA,
      setAssetSymbolB,
      setAssetSymbolC,
      setAssetSymbolD,
    ];
    const dataSetters = [
      setFilteredDataA,
      setFilteredDataB,
      setFilteredDataC,
      setFilteredDataD,
    ];
    const showInputSetters = [
      setShowInputA,
      setShowInputB,
      setShowInputC,
      setShowInputD,
    ];

    // Ensure the first two search bars are not deleted, but their symbols and results are cleared
    if (index < 2) {
      setters[index](null);
      symbolSetters[index]("");
      dataSetters[index]([]);
      updatedSymbols[index] = "";

      setClickedInfos((prevInfos) => prevInfos.filter((_, i) => i !== index));
      // Set shouldRecalculate to true after clearing asset data
      setShouldRecalculate(true);
    } else if (index >= 2 && index < updatedSymbols.length) {
      setters[index](null);
      symbolSetters[index]("");
      dataSetters[index]([]);
      updatedSymbols[index] = "";

      setClickedInfos((prevInfos) => prevInfos.filter((_, i) => i !== index));

      // Hide the search bar for the deleted asset
      showInputSetters[index](false);

      // Set shouldRecalculate to true after asset deletion
      setShouldRecalculate(true);
    }
  };

  useEffect(() => {
    // Check if risk-free rate is cached in session storage
    const cachedRate = sessionStorage.getItem("riskFreeRate");

    if (cachedRate) {
      // If cached rate exists, set it as the risk-free rate
      setRiskFreeRate(parseFloat(cachedRate));
    } else {
      // If cached rate doesn't exist, fetch the first risk-free rate data point
      async function fetchRiskFreeRate() {
        // Define API key and URL for fetching risk-free rate data
        const apiKey = "M4H1P0NX0B015FR8";
        const url = `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=monthly&maturity=3month&apikey=${apiKey}`;

        try {
          // Fetch data from the API
          const response = await fetch(url);
          const data = await response.json();

          // Check if the response contains valid data
          if (data["data"] && data["data"].length > 0) {
            // Extract the first risk-free rate from the response data
            const firstRate = parseFloat(data["data"][0]["value"]);

            // Cache the first risk-free rate in session storage
            sessionStorage.setItem("riskFreeRate", firstRate);

            // Set the first risk-free rate as the state variable
            setRiskFreeRate(firstRate);

            // Log the response data and the first rate for debugging
            console.log(data, firstRate);
          } else {
            // Log an error if the API response format is unexpected
            console.error("Unexpected API response format:", data);
          }
        } catch (error) {
          // Log an error if there's an issue fetching the risk-free rate
          console.error("Error fetching risk-free rate:", error);
        }
      }

      // Call the fetchRiskFreeRate function to fetch the first risk-free rate data point
      fetchRiskFreeRate();
    }
  }, []);

  const calculatePortfolioMetrics = useCallback(
    (weights) => {
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
    [assetsReturn, assetsVol, assetsCorrelationMatrix, riskFreeRate]
  );

  const optimizePortfolio = useCallback(
    (initialWeights, targetReturn) => {
      const tolerance = 0.000001;
      let currentWeights = initialWeights.slice();
      let learningRate = 0.001;
      let iteration = 0;
      const maxIterations = 10000;

      const calculateReturn = (weights) => {
        return weights.reduce(
          (acc, weight, index) => acc + weight * assetsReturn[index],
          0
        );
      };

      const calculateVariance = (weights) => {
        let variance = 0;
        for (let i = 0; i < weights.length; i++) {
          for (let j = 0; j < weights.length; j++) {
            variance +=
              weights[i] *
              weights[j] *
              assetsVol[i] *
              assetsVol[j] *
              assetsCorrelationMatrix[i][j];
          }
        }
        return variance;
      };

      const objectiveFunction = (weights) => {
        const portReturn = calculateReturn(weights);
        const portVariance = calculateVariance(weights);
        const penalty = 100 * Math.pow(portReturn - targetReturn, 2);
        return portVariance + penalty;
      };

      const calculateGradient = (weights) => {
        const gradient = Array(weights.length).fill(0);
        const delta = 0.00001;

        for (let index = 0; index < weights.length; index++) {
          const weightPlus = weights.slice();
          weightPlus[index] += delta;
          const objectivePlus = objectiveFunction(weightPlus);
          const objectiveCurrent = objectiveFunction(weights);
          gradient[index] = (objectivePlus - objectiveCurrent) / delta;
        }

        return gradient;
      };

      const updateWeights = (weights, gradients) => {
        const newWeights = weights.map(
          (weight, index) => weight - learningRate * gradients[index]
        );
        const totalWeight = newWeights.reduce((a, b) => a + b, 0);
        return newWeights.map((weight) => weight / totalWeight);
      };

      while (iteration < maxIterations) {
        const gradients = calculateGradient(currentWeights);
        const updatedWeights = updateWeights(currentWeights, gradients);

        const change = currentWeights.reduce(
          (acc, weight, i) => acc + Math.abs(weight - updatedWeights[i]),
          0
        );

        currentWeights = updatedWeights;

        if (change < tolerance) {
          break;
        }

        iteration++;
        // Decay learning rate
        learningRate *= 0.99;
      }

      const optimizedMetrics = calculatePortfolioMetrics(currentWeights);

      return {
        weights: currentWeights,
        ...optimizedMetrics,
      };
    },
    [
      assetsReturn,
      assetsVol,
      assetsCorrelationMatrix,
      calculatePortfolioMetrics,
    ]
  );

  const findEfficientFrontier = useCallback(() => {
    const validAssetsReturn = assetsReturn.filter(
      (assetReturn) => assetReturn !== null && assetReturn !== undefined
    );

    if (validAssetsReturn.length === 0) {
      return { portfolios: [], volatilities: [] };
    }

    const minReturn = Math.min(...validAssetsReturn);
    const maxReturn = Math.max(...validAssetsReturn);

    const targetReturns = Array.from(
      { length: 100 },
      (_, i) => minReturn + (maxReturn - minReturn) * (i / 99)
    );

    const portfolios = targetReturns.map((targetReturn) => {
      const initialWeights = Array.from(
        { length: validAssetsReturn.length },
        () => 1 / validAssetsReturn.length
      );
      const optimizedPortfolio = optimizePortfolio(
        initialWeights,
        targetReturn
      );
      return optimizedPortfolio;
    });

    const volatilities = portfolios.map((portfolio) => portfolio.volatility);
    return { portfolios, volatilities };
  }, [assetsReturn, optimizePortfolio]);

  const generateRandomPortfolios = useCallback(() => {
    const numPortfolios = 500;
    const portfolios = [];

    for (let i = 0; i < numPortfolios; i++) {
      let weights = Array.from({ length: assetsReturn.length }, () =>
        Math.random()
      );
      const totalWeight = weights.reduce((acc, curr) => acc + curr, 0);
      weights = weights.map((weight) => weight / totalWeight);

      weights = weights.map((weight) => weight + (Math.random() - 0.5) * 0.1);
      weights = weights.map((weight) => Math.max(0, Math.min(1, weight)));
      const normalizedWeightSum = weights.reduce((acc, curr) => acc + curr, 0);
      weights = weights.map((weight) => weight / normalizedWeightSum);

      const portfolioMetrics = calculatePortfolioMetrics(weights);

      portfolios.push({ ...portfolioMetrics, weights });
    }

    return portfolios;
  }, [assetsReturn, calculatePortfolioMetrics]);

  useEffect(() => {
    if (!dataFetched) return;

    if (riskFreeRate !== null) {
      setMonteCarloPortfolios(generateRandomPortfolios());
      setEfficientFrontierData(findEfficientFrontier());
    }
  }, [
    riskFreeRate,
    generateRandomPortfolios,
    findEfficientFrontier,
    dataFetched,
  ]);

  const calculateBestOutcome = useCallback((percentile, returns) => {
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.ceil(percentile * sortedReturns.length) - 1;
    return sortedReturns[index];
  }, []);

  useEffect(() => {
    const isEfficientFrontierArray = Array.isArray(
      efficientFrontierData.portfolios
    );

    if (
      chartContainerRef.current &&
      isEfficientFrontierArray &&
      dataFetched &&
      step === 5
    ) {
      const formattedEfficientFrontierData =
        efficientFrontierData.portfolios.map((portfolio) => ({
          x: portfolio.volatility,
          y: portfolio.return,
          metrics: portfolio,
        }));

      const formattedRandomPortfolios = monteCarloPortfolios.map(
        (portfolio) => ({
          x: portfolio.volatility + (Math.random() - 0.5) * 0.1,
          y: portfolio.return + (Math.random() - 0.5) * 0.1,
          metrics: portfolio,
        })
      );

      const ctx = chartContainerRef.current.getContext("2d");
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: "scatter",
        data: {
          datasets: [
            {
              label: "Efficient Frontier",
              data: formattedEfficientFrontierData,
              backgroundColor: "transparent",
              borderColor: "red",
              borderWidth: 2,
              pointRadius: 0,
              showLine: true,
              fill: false,
            },
            {
              label: "Random Portfolios",
              data: formattedRandomPortfolios,
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              pointRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              mode: "point",
              intersect: false,
              callbacks: {
                label: function (context) {
                  const metrics = context.raw.metrics;
                  return `Return: ${metrics.return.toFixed(
                    2
                  )}%, Volatility: ${metrics.volatility.toFixed(2)}%`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Volatility (Standard Deviation)",
              },
              beginAtZero: false,
            },
            y: {
              title: {
                display: true,
                text: "Expected Return",
              },
              beginAtZero: false,
            },
          },
          // Add this part inside your Chart configuration, where onClick is defined.
          onClick: async (event, elements) => {
            if (elements.length > 0) {
              const element = elements[0];
              const datasetIndex = element.datasetIndex;
              const dataIndex = element.index;
              const clickedData =
                chartInstanceRef.current.data.datasets[datasetIndex].data[
                  dataIndex
                ];

              if (clickedData && clickedData.metrics) {
                const clickedPortfolio = clickedData.metrics;

                const meanReturns =
                  JSON.parse(sessionStorage.getItem("meanReturns")) || [];
                const bestOutcomeReturn = calculateBestOutcome(
                  0.99,
                  meanReturns
                );

                // Ensure that weights are defined and process them
                const portfolioComponents = clickedPortfolio.weights
                  ? clickedPortfolio.weights
                      .map((weight, index) => {
                        const symbol = [
                          assetSymbolA,
                          assetSymbolB,
                          assetSymbolC,
                          assetSymbolD,
                        ][index];
                        return symbol
                          ? `Asset ${symbol}: ${(weight * 100).toFixed(2)}%`
                          : null;
                      })
                      .filter(Boolean)
                  : [];

                const cardInfo = {
                  return: clickedPortfolio.return.toFixed(2),
                  volatility: clickedPortfolio.volatility.toFixed(2),
                  bestOutcomeReturn: bestOutcomeReturn.toFixed(2),
                  portfolioComponents,
                };

                console.log("Clicked Portfolio Data:", cardInfo);
                console.log("Best Outcome after clicking:", bestOutcomeReturn);

                setClickedInfos((prevInfos) => [...prevInfos, cardInfo]);
              }
            }
          },
        },
      });

      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    }
  }, [
    monteCarloPortfolios,
    efficientFrontierData,
    assetsReturn,
    calculateBestOutcome,
    assetSymbolA,
    assetSymbolB,
    assetSymbolC,
    assetSymbolD,
    dataFetched,
    step,
  ]);

  const handleSavePortfolio = async (portfolio) => {
    console.log("Portfolio being saved:", portfolio);

    const currentDate = new Date().toISOString();

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    const data = {
      asset1Name: assetSymbolA,
      asset1Percent: portfolio.portfolioComponents[0].split(": ")[1].trim(),
      asset2Name: assetSymbolB,
      asset2Percent: portfolio.portfolioComponents[1].split(": ")[1].trim(),
      expectedReturn: portfolio.return,
      risk: portfolio.volatility,
      bestOutcome: portfolio.bestOutcomeReturn,
      dateCreated: currentDate,
      dateUpdated: currentDate,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      interval: interval,
    };

    if (portfolio.portfolioComponents[2]) {
      data.asset3Name = assetSymbolC;
      data.asset3Percent = portfolio.portfolioComponents[2]
        .split(": ")[1]
        .trim();
    }

    if (portfolio.portfolioComponents[3]) {
      data.asset4Name = assetSymbolD;
      data.asset4Percent = portfolio.portfolioComponents[3]
        .split(": ")[1]
        .trim();
    }

    console.log("Data being sent to backend:", data);

    try {
      const response = await axios.post(
        "http://localhost:3002/save-data-portfolio",
        {
          username: username,
          savedData: data,
        }
      );
      if (response.status === 200) {
        console.log("Data saved successfully");
      }
    } catch (error) {
      console.error("Error saving portfolio data:", error.message);
    }
  };

  const updateLineChartData = useCallback(() => {
    const validSymbols = [
      assetSymbolA,
      assetSymbolB,
      assetSymbolC,
      assetSymbolD,
    ].filter(Boolean);

    const reversedHistoricalDates = historicalDates.slice().reverse();
    const reversedFilteredDataA = filteredDataA.slice().reverse();
    const reversedFilteredDataB = filteredDataB.slice().reverse();
    const reversedFilteredDataC = filteredDataC.slice().reverse();
    const reversedFilteredDataD = filteredDataD.slice().reverse();

    setLineChartData({
      labels: reversedHistoricalDates,
      datasets: [
        ...validSymbols.map((symbol, index) => ({
          label: symbol,
          data: [
            reversedFilteredDataA,
            reversedFilteredDataB,
            reversedFilteredDataC,
            reversedFilteredDataD,
          ][index],
          fill: false,
          borderColor: ["green", "blue", "pink", "purple"][index],
          tension: 0.1,
        })),
      ],
    });
  }, [
    assetSymbolA,
    assetSymbolB,
    assetSymbolC,
    assetSymbolD,
    historicalDates,
    filteredDataA,
    filteredDataB,
    filteredDataC,
    filteredDataD,
  ]);

  useEffect(() => {
    if (dataFetched) {
      updateLineChartData();
    }
  }, [
    dataFetched,
    assetSymbolA,
    assetSymbolB,
    assetSymbolC,
    assetSymbolD,
    filteredDataA,
    filteredDataB,
    filteredDataC,
    filteredDataD,
    updateLineChartData,
  ]);

  const handleNextStep = () => {
    if (step === 3) {
      updateLineChartData();
    }
    setStep((prevStep) => prevStep + 1);
  };

  const handlePreviousStep = () => {
    setStep((prevStep) => {
      if (prevStep === 5) {
        setClickedInfos([]);
      }
      return prevStep - 1;
    });
    if (step === 5) {
      updateLineChartData();
    }
  };

  const handleAddSearchBar = () => {
    const searchBarsCount = [
      showInputA,
      showInputB,
      showInputC,
      showInputD,
    ].filter(Boolean).length;
    const searchResultsCount = [
      searchResultA,
      searchResultB,
      searchResultC,
      searchResultD,
    ].filter(Boolean).length;
    const totalCount = searchBarsCount + searchResultsCount;

    if (totalCount < 4) {
      if (!showInputC && !searchResultC) {
        setShowInputC(true);
      } else if (!showInputD && !searchResultD) {
        setShowInputD(true);
      }
    }
  };

  const handleRemoveSearchBar = () => {
    const searchBarsCount = [
      showInputA,
      showInputB,
      showInputC,
      showInputD,
    ].filter(Boolean).length;
    const searchResultsCount = [
      searchResultA,
      searchResultB,
      searchResultC,
      searchResultD,
    ].filter(Boolean).length;
    const totalCount = searchBarsCount + searchResultsCount;

    if (totalCount > 2) {
      if (showInputD) {
        setShowInputD(false);
        setSearchResultD(null);
        setAssetSymbolD("");
        setSearchStateD({
          companyName: "",
          hasSearched: false,
          suggestions: [],
        });
      } else if (showInputC) {
        setShowInputC(false);
        setSearchResultC(null);
        setAssetSymbolC("");
        setSearchStateC({
          companyName: "",
          hasSearched: false,
          suggestions: [],
        });
      }
    }
  };

  const renderSearchBarControls = () => {
    const searchBarsCount = [
      showInputA,
      showInputB,
      showInputC,
      showInputD,
    ].filter(Boolean).length;
    const searchResultsCount = [
      searchResultA,
      searchResultB,
      searchResultC,
      searchResultD,
    ].filter(Boolean).length;
    const totalCount = searchBarsCount + searchResultsCount;

    return (
      <div className="search-bar-controls">
        {totalCount < 4 && (
          <button onClick={handleAddSearchBar}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
        {totalCount > 2 && (
          <button onClick={handleRemoveSearchBar}>
            <FontAwesomeIcon icon={faMinus} />
          </button>
        )}
      </div>
    );
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && interval !== "Interval") {
      setShouldRecalculate(true);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (startDate && interval !== "Interval") {
      setShouldRecalculate(true);
    }
  };

  const handleIntervalChange = (e) => {
    setIntervals(e.target.value);
    if (startDate && endDate) {
      setShouldRecalculate(true);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <div className="main-content">
              <div className="select-assets-content">
                <p className="instructions">
                  Please insert at least 2 assets to continue, with the
                  possibility to add up to 4 assets. The name of the company
                  will appear in the search suggestions with the symbol in
                  parentheses.
                </p>
                <div className="search-bar-container">
                  {showInputA && (
                    <div className="search-bar" ref={searchBarRefA}>
                      <input
                        type="text"
                        value={searchStateA.companyName}
                        onChange={handleInputChangeA}
                        onFocus={handleInputFocusA}
                        placeholder="Search for the first asset"
                      />
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="search-icon"
                      />
                      {searchStateA.suggestions.length > 0 && (
                        <div className="suggestion-dropdown">
                          <ul>
                            {searchStateA.suggestions.map((item) => (
                              <li
                                key={item.symbol}
                                onClick={() =>
                                  handleSuggestionClickA(item.name, item.symbol)
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
                  {searchResultA && searchResultA.length > 0 && (
                    <div className="search-results">
                      <ul className="search-results-list">
                        {searchResultA.map((item) => (
                          <li key={item.symbol} className="search-result-item">
                            <span className="search-result-text">
                              {item.name} ({item.symbol})
                            </span>
                            {!assetDataAvailability.A && (
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                style={{
                                  color: "red",
                                  marginLeft: "10px",
                                  marginBottom: "1px",
                                }}
                                title="Data for this asset is not available"
                              />
                            )}
                            <button
                              className="delete-button"
                              onClick={() => {
                                setShowInputA(true); // Show input field
                                setSearchResultA(null);
                                handleDeleteButtonClick(0); // Call recalculation with index 0
                              }}
                            >
                              X
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {showInputB && (
                    <div className="search-bar" ref={searchBarRefB}>
                      <input
                        type="text"
                        value={searchStateB.companyName}
                        onChange={handleInputChangeB}
                        onFocus={handleInputFocusB}
                        placeholder="Search for the second asset"
                      />
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="search-icon"
                      />
                      {searchStateB.suggestions.length > 0 && (
                        <div className="suggestion-dropdown">
                          <ul>
                            {searchStateB.suggestions.map((item) => (
                              <li
                                key={item.symbol}
                                onClick={() =>
                                  handleSuggestionClickB(item.name, item.symbol)
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
                  {searchResultB && searchResultB.length > 0 && (
                    <div className="search-results">
                      <ul className="search-results-list">
                        {searchResultB.map((item) => (
                          <li key={item.symbol} className="search-result-item">
                            <span className="search-result-text">
                              {item.name} ({item.symbol})
                            </span>
                            {!assetDataAvailability.B && (
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                style={{
                                  color: "red",
                                  marginLeft: "10px",
                                  marginBottom: "1px",
                                }}
                                title="Data for this asset is not available"
                              />
                            )}
                            <button
                              className="delete-button"
                              onClick={() => {
                                setShowInputB(true); // Show input field
                                setSearchResultB(null);
                                handleDeleteButtonClick(1); // Call recalculation with index 1
                              }}
                            >
                              X
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {showInputC && (
                    <div className="search-bar" ref={searchBarRefC}>
                      <input
                        type="text"
                        value={searchStateC.companyName}
                        onChange={handleInputChangeC}
                        onFocus={handleInputFocusC}
                        placeholder="Search for the third asset"
                      />
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="search-icon"
                      />
                      {searchStateC.suggestions.length > 0 && (
                        <div className="suggestion-dropdown">
                          <ul>
                            {searchStateC.suggestions.map((item) => (
                              <li
                                key={item.symbol}
                                onClick={() =>
                                  handleSuggestionClickC(item.name, item.symbol)
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

                  {searchResultC && searchResultC.length > 0 && (
                    <div className="search-results">
                      <ul className="search-results-list">
                        {searchResultC.map((item) => (
                          <li key={item.symbol} className="search-result-item">
                            <span className="search-result-text">
                              {item.name} ({item.symbol})
                            </span>
                            {!assetDataAvailability.C && (
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                style={{
                                  color: "red",
                                  marginLeft: "10px",
                                  marginBottom: "1px",
                                }}
                                title="Data for this asset is not available"
                              />
                            )}
                            <button
                              className="delete-button"
                              onClick={() => {
                                setShowInputC(true); // Show input field
                                setSearchResultC(null);
                                handleDeleteButtonClick(2); // Call recalculation with index 2
                              }}
                            >
                              X
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {showInputD && (
                    <div className="search-bar" ref={searchBarRefD}>
                      <input
                        type="text"
                        value={searchStateD.companyName}
                        onChange={handleInputChangeD}
                        onFocus={handleInputFocusD}
                        placeholder="Search for the fourth asset"
                      />
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="search-icon"
                      />
                      {searchStateD.suggestions.length > 0 && (
                        <div className="suggestion-dropdown">
                          <ul>
                            {searchStateD.suggestions.map((item) => (
                              <li
                                key={item.symbol}
                                onClick={() =>
                                  handleSuggestionClickD(item.name, item.symbol)
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
                  {searchResultD && searchResultD.length > 0 && (
                    <div className="search-results">
                      <ul className="search-results-list">
                        {searchResultD.map((item) => (
                          <li key={item.symbol} className="search-result-item">
                            <span className="search-result-text">
                              {item.name} ({item.symbol})
                            </span>
                            {!assetDataAvailability.D && (
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                style={{
                                  color: "red",
                                  marginLeft: "10px",
                                  marginBottom: "1px",
                                }}
                                title="Data for this asset is not available"
                              />
                            )}
                            <button
                              className="delete-button"
                              onClick={() => {
                                setShowInputD(true); // Show input field
                                setSearchResultD(null);
                                handleDeleteButtonClick(3); // Call recalculation with index 3
                              }}
                            >
                              X
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {renderSearchBarControls()}
                  <div className="button-container-assets">
                    <button
                      onClick={handleClearButtonClick}
                      className="btn reset-btn-assets"
                    >
                      Reset
                    </button>
                    {(assetSymbolA ||
                      assetSymbolB ||
                      assetSymbolC ||
                      assetSymbolD) &&
                      (assetSymbolA ? 1 : 0) +
                        (assetSymbolB ? 1 : 0) +
                        (assetSymbolC ? 1 : 0) +
                        (assetSymbolD ? 1 : 0) >=
                        2 && (
                        <div className="assets-next">
                          <button className="btn" onClick={handleNextStep}>
                            Next
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="main-content">
            <div className="start-date-content visible">
              <p className="instructions">
                {`\u00A0\u00A0Please select the start date for your investment portfolio.\u00A0`}
              </p>
              <div className="date-picker-wrapper">
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange} // Updated
                  placeholderText="Select start date"
                  maxDate={yesterday}
                  className="date-picker-input"
                />
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="calendar-icon"
                />
              </div>
              <div className="button-container">
                <div>
                  <button onClick={handlePreviousStep} className="btn back-btn">
                    Back
                  </button>
                  {(!assetDataAvailability.A ||
                    !assetDataAvailability.B ||
                    !assetDataAvailability.C ||
                    !assetDataAvailability.D) && (
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      style={{
                        color: "red",
                      }}
                      title="One of the assets has no data"
                    />
                  )}
                </div>
                <button
                  onClick={handleClearButtonClick}
                  className="btn reset-btn"
                >
                  Reset
                </button>

                {startDate && (
                  <button onClick={handleNextStep} className="btn next-btn">
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="main-content">
            <div className="end-date-content visible">
              <p className="instructions">
                {`\u00A0\u00A0Please select the end date for your investment portfolio.\u00A0\u00A0`}
              </p>
              <div className="date-picker-wrapper">
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange} // Updated
                  placeholderText="Select end date"
                  maxDate={new Date()}
                  className="date-picker-input"
                />
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="calendar-icon"
                />
              </div>
              <div className="button-container">
                <div>
                  <button onClick={handlePreviousStep} className="btn back-btn">
                    Back
                  </button>
                  {(!assetDataAvailability.A ||
                    !assetDataAvailability.B ||
                    !assetDataAvailability.C ||
                    !assetDataAvailability.D) && (
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      style={{ color: "red" }}
                      title="One of the assets has no data"
                    />
                  )}
                  <button
                    onClick={handleClearButtonClick}
                    className="btn reset-btn"
                  >
                    Reset
                  </button>
                </div>
                {endDate && (
                  <button onClick={handleNextStep} className="btn next-btn">
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="main-content">
            <div className="interval-content visible">
              <p className="instructions">
                Please select an interval for your investment portfolio data.
              </p>
              <div className="select-wrapper">
                <select
                  value={interval}
                  onChange={handleIntervalChange} // Updated
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
              <div className="button-container-interval">
                <div>
                  <button onClick={handlePreviousStep} className="btn back-btn">
                    Back
                  </button>
                  {(!assetDataAvailability.A ||
                    !assetDataAvailability.B ||
                    !assetDataAvailability.C ||
                    !assetDataAvailability.D) && (
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      style={{ color: "red" }}
                      title="One of the assets has no data"
                    />
                  )}
                  <button
                    onClick={handleClearButtonClick}
                    className="btn reset-btn"
                  >
                    Reset
                  </button>
                </div>
                {interval !== "Interval" && !isLoading && (
                  <button
                    onClick={handleNextStep}
                    className="btn next-btn"
                    disabled={
                      !assetDataAvailability.A ||
                      !assetDataAvailability.B ||
                      !assetDataAvailability.C ||
                      !assetDataAvailability.D
                    }
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="main-content-summary">
            <div className="summary-content visible">
              <div className="summary-details">
                <p>
                  <strong>Assets:</strong>{" "}
                  {[assetSymbolA, assetSymbolB, assetSymbolC, assetSymbolD]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>
                  <strong>Start Date:</strong> {formatDate(startDate)}
                </p>
                <p>
                  <strong>End Date:</strong> {formatDate(endDate)}
                </p>
                <p>
                  <strong>Interval:</strong> {interval}
                </p>
              </div>
              <div className="return-chart-container">
                {Object.keys(lineChartData).length > 0 && (
                  <Line data={lineChartData} options={options} />
                )}
              </div>
              <div className="button-container-summary">
                <button onClick={handlePreviousStep} className="btn back-btn">
                  Back
                </button>
                <button
                  onClick={handleClearButtonClick}
                  className="btn reset-btn"
                >
                  Reset
                </button>
                <button onClick={handleNextStep} className="btn next-btn">
                  Go to Monte Carlo chart
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="main-content">
            <div className="monte-carlo-chart">
              <div className="chart-container-monte-carlo">
                <canvas
                  ref={chartContainerRef}
                  width="800"
                  height="800"
                ></canvas>
                <div className="button-container-monte-carlo">
                  <button className="btn back" onClick={handlePreviousStep}>
                    Back
                  </button>
                </div>
              </div>
              <div className="clicked-info">
                {clickedInfos.map((clickedInfo, index) => (
                  <div key={index} className="clicked-info-card">
                    <h4>Portfolio {index + 1}</h4>
                    <p>
                      Expected Return:{" "}
                      <span className="portfolio-component">
                        {clickedInfo.return}%
                      </span>
                    </p>
                    <p>
                      Risk (CVaR 1%):{" "}
                      <span className="portfolio-component">
                        {clickedInfo.volatility}%
                      </span>
                    </p>
                    <p>
                      Best Outcome (CVaR 99%):{" "}
                      <span className="portfolio-component">
                        {clickedInfo.bestOutcomeReturn}%
                      </span>
                    </p>
                    <div className="portfolio-components-wrapper">
                      <p>Portfolio Components:</p>
                      <div className="portfolio-components">
                        {clickedInfo.portfolioComponents.map(
                          (component, index) => (
                            <span key={index} className="portfolio-component">
                              {component}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div className="button-group">
                      <button
                        className="btn delete"
                        onClick={() => handleDeleteButtonClick(index)}
                      >
                        Delete
                      </button>
                      <button
                        className="btn save"
                        onClick={() => handleSavePortfolio(clickedInfo)}
                      >
                        Save
                      </button>
                      <button className="btn buy" disabled>
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
          <Link to="/dashboard/invest" className="menu-item active">
            <FontAwesomeIcon icon={faChartLine} className="menu-icon" /> Invest
          </Link>
          <Link to="/dashboard/watchlist" className="menu-item">
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
        <div className="content">{renderStepContent()}</div>
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
