import React, { useEffect, useRef, useState, useCallback } from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [searchResultD, setSearchResultD] = useState(null);
  const [searchWarningA, setSearchWarningA] = useState(
    "Please search for an asset"
  );
  const [searchWarningB, setSearchWarningB] = useState(
    "Please search for an asset"
  );
  const [searchWarningC, setSearchWarningC] = useState(
    "Please search for an asset"
  );
  const [searchWarningD, setSearchWarningD] = useState(
    "Please search for an asset"
  );
  const [showInputA, setShowInputA] = useState(true);
  const [showInputB, setShowInputB] = useState(true);
  const [showInputC, setShowInputC] = useState(true);
  const [showInputD, setShowInputD] = useState(true);
  const [showSearchAgainButtonA, setShowSearchAgainButtonA] = useState(false);
  const [showSearchAgainButtonB, setShowSearchAgainButtonB] = useState(false);
  const [showSearchAgainButtonC, setShowSearchAgainButtonC] = useState(false);
  const [showSearchAgainButtonD, setShowSearchAgainButtonD] = useState(false);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [interval, setInterval] = useState("");
  const [lineChartData, setLineChartData] = useState({});
  const [filteredDataA, setFilteredDataA] = useState([]);
  const [filteredDataB, setFilteredDataB] = useState([]);
  const [filteredDataC, setFilteredDataC] = useState([]);
  const [filteredDataD, setFilteredDataD] = useState([]);
  const [historicalDates, setHistoricalDates] = useState([]);
  const [buttonNextDisabled, setButtonNextDisabled] = useState(true);
  const [showSelectAssets, setShowSelectAssets] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showInterval, setShowInterval] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const wrapperRefA = useRef(null);
  const wrapperRefB = useRef(null);
  const wrapperRefC = useRef(null);
  const wrapperRefD = useRef(null);
  const wrapperRefSelectAssets = useRef(null);
  const wrapperRefStartDate = useRef(null);
  const wrapperRefEndDate = useRef(null);
  const wrapperRefInterval = useRef(null);
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [assetsReturn, setAssetsReturn] = useState([]);
  const [assetsVol, setAssetsVol] = useState([]);
  const [assetsCorrelationMatrix, setAssetsCorrelationMatrix] = useState([]);
  const [monteCarloPortfolios, setMonteCarloPortfolios] = useState([]);
  const [efficientFrontierData, setEfficientFrontierData] = useState([]);
  const [riskFreeRate, setRiskFreeRate] = useState(null);
  const [clickedInfos, setClickedInfos] = useState([]);
  const [lastValidSearchResultA, setLastValidSearchResultA] = useState(null);
  const [lastValidSearchResultB, setLastValidSearchResultB] = useState(null);
  const [lastValidSearchResultC, setLastValidSearchResultC] = useState(null);
  const [lastValidSearchResultD, setLastValidSearchResultD] = useState(null);

  const apiKey = "SbUhzMlpiU94dp9UtJGKlPs59R6DBpGi";

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

  const handleSelectAssetsClick = (event) => {
    event.stopPropagation();
    setShowSelectAssets((prev) => !prev);
  };

  const handleStartDateClick = (event) => {
    event.stopPropagation();
    setShowStartDate((prev) => !prev);
  };

  const handleEndDateClick = (event) => {
    event.stopPropagation();
    setShowEndDate((prev) => !prev);
  };

  const handleIntervalClick = (event) => {
    event.stopPropagation();
    setShowInterval((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRefSelectAssets.current &&
        !wrapperRefSelectAssets.current.contains(event.target)
      ) {
        setShowSelectAssets(false);
      }
    };

    if (showSelectAssets) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSelectAssets]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRefStartDate.current &&
        !wrapperRefStartDate.current.contains(event.target)
      ) {
        setShowStartDate(false);
      }
    };

    if (showStartDate) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStartDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRefEndDate.current &&
        !wrapperRefEndDate.current.contains(event.target)
      ) {
        setShowEndDate(false);
      }
    };

    if (showEndDate) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEndDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRefInterval.current &&
        !wrapperRefInterval.current.contains(event.target)
      ) {
        setShowInterval(false);
      }
    };

    if (showInterval) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInterval]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRefA.current && !wrapperRefA.current.contains(event.target)) {
        setSearchStateA((prevState) => ({ ...prevState, suggestions: [] }));
        setSearchWarningA("Please search for an asset");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRefA]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRefB.current && !wrapperRefB.current.contains(event.target)) {
        setSearchStateB((prevState) => ({ ...prevState, suggestions: [] }));
        setSearchWarningB("Please search for an asset");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRefB]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRefC.current && !wrapperRefC.current.contains(event.target)) {
        setSearchStateC((prevState) => ({ ...prevState, suggestions: [] }));
        setSearchWarningC("Please search for an asset");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRefC]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRefD.current && !wrapperRefD.current.contains(event.target)) {
        setSearchStateD((prevState) => ({ ...prevState, suggestions: [] }));
        setSearchWarningD("Please search for an asset");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRefD]);

  // Handle input change for asset A
  const handleInputChangeA = (e) => {
    const input = e.target.value.trim(); // Trim input value
    setSearchStateA((prevState) => ({
      ...prevState,
      companyName: input,
    })); // Set company name in search state

    if (!input) {
      setSearchStateA((prevState) => ({
        ...prevState,
        suggestions: [],
      })); // Clear suggestions if input is empty
      return;
    }

    fetch(
      `https://financialmodelingprep.com/api/v3/search?query=${input}&limit=5&apikey=${apiKey}`
    ) // Fetch search suggestions
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Handle HTTP error
        }
        return response.json(); // Parse response as JSON
      })
      .then((data) => {
        if (!data) {
          console.error("Error: Data is null"); // Handle null data
          setSearchStateA((prevState) => ({
            ...prevState,
            suggestions: [],
          }));
          setSearchResultA(null);
          setSearchWarningA("No matching company found"); // Clear suggestions
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

        setSearchWarningA("");

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

            setSearchStateA((prevState) => ({
              ...prevState,
              suggestions: filteredSuggestions,
            })); // Set filtered suggestions
          })
          .catch((error) => {
            console.error("Error fetching profiles:", error); // Handle fetch error
            setSearchStateA((prevState) => ({
              ...prevState,
              suggestions: [],
            })); // Clear suggestions
          });
      })
      .catch((error) => {
        console.error("Error fetching suggestions:", error); // Handle fetch error
        setSearchStateA((prevState) => ({
          ...prevState,
          suggestions: [],
        })); // Clear suggestions
      });
  };

  // Handle input change for asset B
  const handleInputChangeB = (e) => {
    const input = e.target.value.trim(); // Trim input value
    setSearchStateB((prevState) => ({
      ...prevState,
      companyName: input,
    })); // Set company name in search state

    if (!input) {
      setSearchStateB((prevState) => ({
        ...prevState,
        suggestions: [],
      })); // Clear suggestions if input is empty
      return;
    }

    fetch(
      `https://financialmodelingprep.com/api/v3/search?query=${input}&limit=5&apikey=${apiKey}`
    ) // Fetch search suggestions
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Handle HTTP error
        }
        return response.json(); // Parse response as JSON
      })
      .then((data) => {
        if (!data) {
          console.error("Error: Data is null"); // Handle null data
          setSearchStateB((prevState) => ({
            ...prevState,
            suggestions: [],
          })); // Clear suggestions
          setSearchResultB(null);
          setSearchWarningB("No matching company found"); // Clear suggestions
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

        setSearchWarningB("");

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

            setSearchStateB((prevState) => ({
              ...prevState,
              suggestions: filteredSuggestions,
            })); // Set filtered suggestions
          })
          .catch((error) => {
            console.error("Error fetching profiles:", error); // Handle fetch error
            setSearchStateB((prevState) => ({
              ...prevState,
              suggestions: [],
            })); // Clear suggestions
          });
      })
      .catch((error) => {
        console.error("Error fetching suggestions:", error); // Handle fetch error
        setSearchStateB((prevState) => ({
          ...prevState,
          suggestions: [],
        })); // Clear suggestions
      });
  };
  const handleInputChangeC = (e) => {
    const input = e.target.value.trim(); // Trim input value
    setSearchStateC((prevState) => ({
      ...prevState,
      companyName: input,
    })); // Set company name in search state

    if (!input) {
      setSearchStateC((prevState) => ({
        ...prevState,
        suggestions: [],
      })); // Clear suggestions if input is empty
      return;
    }

    fetch(
      `https://financialmodelingprep.com/api/v3/search?query=${input}&limit=5&apikey=${apiKey}`
    ) // Fetch search suggestions
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Handle HTTP error
        }
        return response.json(); // Parse response as JSON
      })
      .then((data) => {
        if (!data) {
          console.error("Error: Data is null"); // Handle null data
          setSearchStateC((prevState) => ({
            ...prevState,
            suggestions: [],
          }));
          setSearchResultC(null);
          setSearchWarningC("No matching company found"); // Clear suggestions
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

        setSearchWarningC("");

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

            setSearchStateC((prevState) => ({
              ...prevState,
              suggestions: filteredSuggestions,
            })); // Set filtered suggestions
          })
          .catch((error) => {
            console.error("Error fetching profiles:", error); // Handle fetch error
            setSearchStateC((prevState) => ({
              ...prevState,
              suggestions: [],
            })); // Clear suggestions
          });
      })
      .catch((error) => {
        console.error("Error fetching suggestions:", error); // Handle fetch error
        setSearchStateC((prevState) => ({
          ...prevState,
          suggestions: [],
        })); // Clear suggestions
      });
  };
  const handleInputChangeD = (e) => {
    const input = e.target.value.trim(); // Trim input value
    setSearchStateD((prevState) => ({
      ...prevState,
      companyName: input,
    })); // Set company name in search state

    if (!input) {
      setSearchStateD((prevState) => ({
        ...prevState,
        suggestions: [],
      })); // Clear suggestions if input is empty
      return;
    }

    fetch(
      `https://financialmodelingprep.com/api/v3/search?query=${input}&limit=5&apikey=${apiKey}`
    ) // Fetch search suggestions
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Handle HTTP error
        }
        return response.json(); // Parse response as JSON
      })
      .then((data) => {
        if (!data) {
          console.error("Error: Data is null"); // Handle null data
          setSearchStateD((prevState) => ({
            ...prevState,
            suggestions: [],
          }));
          setSearchResultD(null);
          setSearchWarningD("No matching company found"); // Clear suggestions
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

        setSearchWarningD("");

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

            setSearchStateD((prevState) => ({
              ...prevState,
              suggestions: filteredSuggestions,
            })); // Set filtered suggestions
          })
          .catch((error) => {
            console.error("Error fetching profiles:", error); // Handle fetch error
            setSearchStateD((prevState) => ({
              ...prevState,
              suggestions: [],
            })); // Clear suggestions
          });
      })
      .catch((error) => {
        console.error("Error fetching suggestions:", error); // Handle fetch error
        setSearchStateD((prevState) => ({
          ...prevState,
          suggestions: [],
        })); // Clear suggestions
      });
  };

  // Function to handle click on a suggestion for asset A
  const handleSuggestionClickA = (name, symbol) => {
    setSearchResultA([{ name, symbol }]);
    setLastValidSearchResultA([{ name, symbol }]);
    setSearchStateA({
      ...searchStateA,
      companyName: "",
      suggestions: [], // Clear suggestions
    });
    setShowInputA(false); // Hiding input field
    setShowSearchAgainButtonA(true); // Showing search again button
    setAssetSymbolA(symbol ? symbol : ""); // Setting asset symbol
  };

  // Function to handle click on a suggestion for asset B
  const handleSuggestionClickB = (name, symbol) => {
    setSearchResultB([{ name, symbol }]);
    setLastValidSearchResultB([{ name, symbol }]);
    setSearchStateB({
      ...searchStateB,
      companyName: "",
      suggestions: [], // Clear suggestions
    });
    setShowInputB(false); // Hiding input field
    setShowSearchAgainButtonB(true); // Showing search again button
    setAssetSymbolB(symbol ? symbol : ""); // Setting asset symbol
  };

  const handleSuggestionClickC = (name, symbol) => {
    setSearchResultC([{ name, symbol }]);
    setLastValidSearchResultC([{ name, symbol }]);
    setSearchStateC({
      ...searchStateC,
      companyName: "",
      suggestions: [], // Clear suggestions
    });
    setShowInputC(false); // Hiding input field
    setShowSearchAgainButtonC(true); // Showing search again button
    setAssetSymbolC(symbol ? symbol : ""); // Setting asset symbol
  };
  const handleSuggestionClickD = (name, symbol) => {
    setSearchResultD([{ name, symbol }]);
    setLastValidSearchResultD([{ name, symbol }]);
    setSearchStateD({
      ...searchStateD,
      companyName: "",
      suggestions: [], // Clear suggestions
    });
    setShowInputD(false); // Hiding input field
    setShowSearchAgainButtonD(true); // Showing search again button
    setAssetSymbolD(symbol ? symbol : ""); // Setting asset symbol
  };

  const calculateReturns = (data) => {
    if (data.length < 2) return []; // Ensure there's enough data to compute returns

    // Start mapping from the second element
    const returns = data.slice(1).map((currentClose, index) => {
      const previousClose = data[index]; // index is correct since we sliced the data
      if (previousClose === 0) {
        console.log(`Skipping index ${index + 1}: Previous close is zero`);
        return undefined; // Or you could skip adding this return at all
      }
      const percentageChange =
        ((currentClose - previousClose) / previousClose) * 100;
      return percentageChange;
    });

    // Optionally, filter out undefined entries if previous close was zero
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

  useEffect(() => {
    const fetchAndProcessData = async () => {
      const symbols = [assetSymbolA, assetSymbolB, assetSymbolC, assetSymbolD];
      const setters = [
        setFilteredDataA,
        setFilteredDataB,
        setFilteredDataC,
        setFilteredDataD,
      ];

      const fetchInterval = interval === "Daily" ? "4hour" : interval;

      const formatDate = (date) => {
        return new Date(date).toISOString().split("T")[1];
      };

      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      const dataPromises = symbols.map((symbol, index) => {
        if (!symbol) {
          setters[index]([]); // Set empty data if symbol is not provided
          return Promise.resolve([]);
        }
        return fetch(
          `https://financialmodelingprep.com/api/v3/historical-chart/${fetchInterval}/${symbol}?from=${formattedStartDate}&to=${formattedEndDate}&apikey=${apiKey}`
        )
          .then((response) => response.json())
          .then((data) => {
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
            }

            const returns = data
              ? calculateReturns(data.map((entry) => entry.close))
              : [];

            // Filter out null or undefined returns
            const validReturns = returns.filter(
              (r) => r !== null && r !== undefined
            );

            // Set the specific state for each asset
            setters[index](validReturns);
            setHistoricalDates(data.map((entry) => entry.date));
            return validReturns;
          });
      });

      const allData = await Promise.all(dataPromises);
      const meanReturns = allData.map((r) => calculateMeanReturn(r));
      const volatilities = allData.map((r, index) =>
        calculateVolatility(r, meanReturns[index])
      );
      const correlationMatrix = calculateCorrelationMatrix(allData);

      // Set state for global calculations
      setAssetsReturn(meanReturns);
      setAssetsVol(volatilities);
      setAssetsCorrelationMatrix(correlationMatrix);
    };

    if (
      assetSymbolA &&
      assetSymbolB &&
      assetSymbolC &&
      assetSymbolD &&
      startDate &&
      endDate &&
      interval
    ) {
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
    console.log("Checking filtered data and historical dates:", {
      filteredDataA,
      filteredDataB,
      filteredDataC,
      filteredDataD,
      historicalDates,
    });
    if (!filteredDataA || !filteredDataB || !filteredDataC || !filteredDataD) {
      console.log("No data found");
      return; // Return if necessary data is missing
    }

    if (
      filteredDataA.length <= 0 &&
      filteredDataB.length > 0 &&
      filteredDataC.length > 0 &&
      filteredDataD.length > 0 &&
      historicalDates.length <= 0
    ) {
      setSearchWarningA(
        "Search for a new asset. This one does not have enough data"
      );
      console.log("0");
      setSearchResultA(null);
      setShowSearchAgainButtonA(false);
      setShowInputA(true);
    }
    if (
      filteredDataA.length <= 0 &&
      filteredDataB.length <= 0 &&
      filteredDataC.length > 0 &&
      filteredDataD.length > 0 &&
      historicalDates.length <= 0
    ) {
      console.log("1");
      setSearchWarningA(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningB(
        "Search for a new asset. This one does not have enough data"
      );

      setSearchResultA(null);
      setShowSearchAgainButtonA(false);
      setShowInputA(true);
      setSearchResultB(null);
      setShowSearchAgainButtonB(false);
      setShowInputB(true);
    }
    if (
      filteredDataA.length <= 0 &&
      filteredDataB.length > 0 &&
      filteredDataC.length <= 0 &&
      filteredDataD.length > 0 &&
      historicalDates.length <= 0
    ) {
      console.log("2");
      setSearchWarningA(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningC(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultA(null);
      setShowSearchAgainButtonA(false);
      setShowInputA(true);
      setSearchResultC(null);
      setShowSearchAgainButtonC(false);
      setShowInputC(true);
    }
    if (
      filteredDataA.length <= 0 &&
      filteredDataB.length > 0 &&
      filteredDataC.length > 0 &&
      filteredDataD.length <= 0 &&
      historicalDates.length <= 0
    ) {
      console.log("3");
      setSearchWarningA(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningD(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultA(null);
      setShowSearchAgainButtonA(false);
      setShowInputA(true);
      setSearchResultD(null);
      setShowSearchAgainButtonD(false);
      setShowInputD(true);
    }
    if (
      filteredDataA.length <= 0 &&
      filteredDataB.length <= 0 &&
      filteredDataC.length <= 0 &&
      filteredDataD.length > 0 &&
      historicalDates.length <= 0
    ) {
      console.log("4");
      setSearchWarningA(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningB(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningC(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultA(null);
      setShowSearchAgainButtonA(false);
      setShowInputA(true);
      setSearchResultB(null);
      setShowSearchAgainButtonB(false);
      setShowInputB(true);
      setSearchResultC(null);
      setShowSearchAgainButtonC(false);
      setShowInputC(true);
    }
    if (
      filteredDataA.length <= 0 &&
      filteredDataB.length <= 0 &&
      filteredDataC.length > 0 &&
      filteredDataD.length <= 0 &&
      historicalDates.length <= 0
    ) {
      console.log("5");
      setSearchWarningA(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningB(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningD(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultA(null);
      setShowSearchAgainButtonA(false);
      setShowInputA(true);
      setSearchResultB(null);
      setShowSearchAgainButtonB(false);
      setShowInputB(true);
      setSearchResultD(null);
      setShowSearchAgainButtonD(false);
      setShowInputD(true);
    }
    if (
      filteredDataA.length <= 0 &&
      filteredDataB.length > 0 &&
      filteredDataC.length <= 0 &&
      filteredDataD.length <= 0 &&
      historicalDates.length <= 0
    ) {
      console.log("6");
      setSearchWarningA(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningC(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningD(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultA(null);
      setShowSearchAgainButtonA(false);
      setShowInputA(true);
      setSearchResultC(null);
      setShowSearchAgainButtonC(false);
      setShowInputC(true);
      setSearchResultD(null);
      setShowSearchAgainButtonD(false);
      setShowInputD(true);
    }
    if (
      filteredDataA.length > 0 &&
      filteredDataB.length <= 0 &&
      filteredDataC.length > 0 &&
      filteredDataD.length > 0 &&
      historicalDates.length <= 0
    ) {
      console.log("7");
      setSearchWarningB(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultB(null);
      setShowSearchAgainButtonB(false);
      setShowInputB(true);
    }
    if (
      filteredDataA.length > 0 &&
      filteredDataB.length <= 0 &&
      filteredDataC.length <= 0 &&
      filteredDataD.length > 0 &&
      historicalDates.length < 0
    ) {
      console.log("8");
      setSearchWarningB(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningC(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultB(null);
      setShowSearchAgainButtonB(false);
      setShowInputB(true);
      setSearchResultC(null);
      setShowSearchAgainButtonC(false);
      setShowInputC(true);
    }
    if (
      filteredDataA.length > 0 &&
      filteredDataB.length <= 0 &&
      filteredDataC.length <= 0 &&
      filteredDataD.length <= 0 &&
      historicalDates.length <= 0
    ) {
      console.log("9");
      setSearchWarningB(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningC(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningD(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultB(null);
      setShowSearchAgainButtonB(false);
      setShowInputB(true);
      setSearchResultC(null);
      setShowSearchAgainButtonC(false);
      setShowInputC(true);
      setSearchResultD(null);
      setShowSearchAgainButtonD(false);
      setShowInputD(true);
    }
    if (
      filteredDataA.length > 0 &&
      filteredDataB.length > 0 &&
      filteredDataC.length <= 0 &&
      filteredDataD.length > 0 &&
      historicalDates.length <= 0
    ) {
      console.log("10");
      setSearchWarningC(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultC(null);
      setShowSearchAgainButtonC(false);
      setShowInputC(true);
    }
    if (
      filteredDataA.length > 0 &&
      filteredDataB.length > 0 &&
      filteredDataC.length <= 0 &&
      filteredDataD.length <= 0 &&
      historicalDates.length <= 0
    ) {
      console.log("11");
      setSearchWarningC(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningD(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultC(null);
      setShowSearchAgainButtonC(false);
      setShowInputC(true);
      setSearchResultD(null);
      setShowSearchAgainButtonD(false);
      setShowInputD(true);
    }
    if (
      filteredDataA.length > 0 &&
      filteredDataB.length <= 0 &&
      filteredDataC.length > 0 &&
      filteredDataD.length <= 0 &&
      historicalDates.length <= 0
    ) {
      console.log("12");
      setSearchWarningB(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchWarningD(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultB(null);
      setShowSearchAgainButtonB(false);
      setShowInputB(true);
      setSearchResultD(null);
      setShowSearchAgainButtonD(false);
      setShowInputD(true);
    }
    if (
      filteredDataA.length > 0 &&
      filteredDataB.length > 0 &&
      filteredDataC.length > 0 &&
      filteredDataD.length <= 0 &&
      historicalDates.length <= 0
    ) {
      console.log("13");
      setSearchWarningD(
        "Search for a new asset. This one does not have enough data"
      );
      setSearchResultD(null);
      setShowSearchAgainButtonD(false);
      setShowInputD(true);
    }
    if (
      filteredDataA.length > 0 &&
      filteredDataB.length > 0 &&
      filteredDataC.length > 0 &&
      filteredDataD.length > 0
    ) {
      setButtonNextDisabled(false);
      setSearchResultA(lastValidSearchResultA);
      setSearchResultB(lastValidSearchResultB);
      setSearchResultC(lastValidSearchResultC);
      setSearchResultD(lastValidSearchResultD);
      setShowSearchAgainButtonA(true);
      setShowInputA(false);
      setShowSearchAgainButtonB(true);
      setShowInputB(false);
      setShowSearchAgainButtonC(true);
      setShowInputC(false);
      setShowSearchAgainButtonD(true);
      setShowInputD(false);
    }

    setLineChartData({
      labels: historicalDates,
      datasets: [
        {
          label: assetSymbolA,
          data: filteredDataA,
          fill: false,
          borderColor: "green",
          tension: 0.1,
        },
        {
          label: assetSymbolB,
          data: filteredDataB,
          fill: false,
          borderColor: "blue",
          tension: 0.1,
        },
        {
          label: assetSymbolC,
          data: filteredDataC,
          fill: false,
          borderColor: "pink",
          tension: 0.1,
        },
        {
          label: assetSymbolD,
          data: filteredDataD,
          fill: false,
          borderColor: "purple",
          tension: 0.1,
        },
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
    lastValidSearchResultA,
    lastValidSearchResultB,
    lastValidSearchResultC,
    lastValidSearchResultD,
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
    // Reset relevant states
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
    setSearchWarningA("Please search for an asset");
    setSearchWarningB("Please search for an asset");
    setSearchWarningC("Please search for an asset");
    setSearchWarningD("Please search for an asset");
    setShowInputA(true);
    setShowInputB(true);
    setShowInputC(true);
    setShowInputD(true);
    setShowSearchAgainButtonA(false);
    setShowSearchAgainButtonB(false);
    setShowSearchAgainButtonC(false);
    setShowSearchAgainButtonD(false);
    setStartDate("");
    setEndDate("");
    setAssetSymbolA("");
    setAssetSymbolB("");
    setAssetSymbolC("");
    setAssetSymbolD("");
    setLineChartData({});
    setFilteredDataA([]);
    setFilteredDataB([]);
    setFilteredDataC([]);
    setFilteredDataD([]);
    setButtonNextDisabled(true);
  };

  const handleNextButtonClick = async () => {
    if (showNext === true) {
      setShowNext(false);
      setClickedInfos([]);
      console.log(false);
    } else if (showNext === false) {
      setShowNext(true);
      console.log(true);
    }
  };

  const handleDeleteButtonClick = (index) => {
    setClickedInfos((prevInfos) => prevInfos.filter((_, i) => i !== index));
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
      const portfolioVolatilitySqrt = Math.sqrt(portfolioVolatility);

      const sharpeRatio =
        (portfolioReturn - riskFreeRate) / portfolioVolatilitySqrt;

      return {
        return: portfolioReturn,
        volatility: portfolioVolatilitySqrt,
        sharpeRatio,
      };
    },
    [assetsReturn, assetsVol, assetsCorrelationMatrix, riskFreeRate]
  );

  const optimizePortfolio = useCallback(
    (initialWeights, targetReturn) => {
      const tolerance = 0.00001;
      let currentWeights = initialWeights.slice();
      let learningRate = 0.001;
      let iteration = 0;
      const maxIterations = 1000;

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

      return currentWeights;
    },
    [assetsReturn, assetsVol, assetsCorrelationMatrix]
  );

  const findEfficientFrontier = useCallback(() => {
    const validAssetsReturn = assetsReturn.filter(
      (assetReturn) => assetReturn !== null && assetReturn !== undefined
    );

    if (validAssetsReturn.length === 0) {
      return { portfolios: [], volatilities: [] };
    }

    // Define minimum and maximum returns
    const minReturn = Math.min(...validAssetsReturn);
    const maxReturn = Math.max(...validAssetsReturn);

    // Generate 100 target returns evenly distributed between min and max returns
    const targetReturns = Array.from(
      { length: 100 },
      (_, i) => minReturn + (maxReturn - minReturn) * (i / 99)
    );

    const portfolios = targetReturns.map((targetReturn) => {
      const initialWeights = Array.from(
        { length: validAssetsReturn.length },
        () => 1 / validAssetsReturn.length
      );
      const optimizedWeights = optimizePortfolio(initialWeights, targetReturn);
      return calculatePortfolioMetrics(optimizedWeights);
    });

    // Extract volatilities (standard deviation) of the portfolios
    const volatilities = portfolios.map(
      (portfolio) => portfolio.standardDeviation
    );

    return { portfolios, volatilities };
  }, [assetsReturn, optimizePortfolio, calculatePortfolioMetrics]);

  const generateRandomPortfolios = useCallback(() => {
    // Obtain the efficient frontier portfolios and volatilities
    const { volatilities } = findEfficientFrontier();

    if (volatilities.length === 0) {
      return [];
    }

    // Calculate average volatility or use another metric
    const averageVolatility =
      volatilities.reduce((a, b) => a + b, 0) / volatilities.length;

    // Set default exponents to avoid issues
    const exponentHigh = Math.min(1, averageVolatility / 10) || 1;
    const exponentLow = Math.min(1, averageVolatility / 100) || 1;

    const numPortfolios = 500;
    return Array.from({ length: numPortfolios }, () => {
      // Generate weights with more variability
      const rawWeights = Array.from({ length: assetsReturn.length }, () => {
        const randomValue = Math.random();
        const exponent = randomValue > 0.5 ? exponentHigh : exponentLow;
        return Math.pow(randomValue, exponent);
      });

      const totalWeight = rawWeights.reduce((acc, curr) => acc + curr, 0);
      if (totalWeight === 0 || isNaN(totalWeight)) {
        console.error("Invalid total weight:", totalWeight);
        return { return: NaN, volatility: NaN, sharpeRatio: NaN };
      }

      const normalizedWeights = rawWeights.map(
        (weight) => weight / totalWeight
      );

      return calculatePortfolioMetrics(normalizedWeights);
    });
  }, [assetsReturn, findEfficientFrontier, calculatePortfolioMetrics]);

  useEffect(() => {
    if (riskFreeRate !== null) {
      setMonteCarloPortfolios(generateRandomPortfolios());
      setEfficientFrontierData(findEfficientFrontier());
    }
  }, [riskFreeRate, generateRandomPortfolios, findEfficientFrontier]);

  const calculateBestOutcome = useCallback(
    (percentile) => {
      const sortedReturns = monteCarloPortfolios
        .map((p) => p.return)
        .sort((a, b) => a - b);
      const index = Math.ceil(percentile * sortedReturns.length) - 1;
      return sortedReturns[index];
    },
    [monteCarloPortfolios]
  );

  useEffect(() => {
    const isEfficientFrontierArray = Array.isArray(
      efficientFrontierData.portfolios
    );

    if (chartContainerRef.current && showNext && isEfficientFrontierArray) {
      const formattedEfficientFrontierData =
        efficientFrontierData.portfolios.map((portfolio) => ({
          x: portfolio.volatility,
          y: portfolio.return,
        }));

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
              data: monteCarloPortfolios.map((portfolio) => ({
                x: portfolio.volatility,
                y: portfolio.return,
              })),
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
                  return `Return: ${context.parsed.y.toFixed(
                    2
                  )}%, Volatility: ${context.parsed.x.toFixed(2)}%`;
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
          onClick: (event, elements) => {
            if (elements.length > 0) {
              elements.forEach((element) => {
                const datasetIndex = element.datasetIndex;
                const dataIndex = element.index;
                let clickedPortfolio;

                if (datasetIndex === 1) {
                  // Random Portfolios dataset
                  clickedPortfolio = monteCarloPortfolios[dataIndex];
                } else if (datasetIndex === 0) {
                  // Efficient Frontier dataset
                  clickedPortfolio =
                    efficientFrontierData.portfolios[dataIndex];
                }

                if (clickedPortfolio) {
                  const bestOutcomeReturn = calculateBestOutcome(0.99);
                  const clickedWeights = optimizePortfolio(
                    Array.from(
                      { length: assetsReturn.length },
                      () => 1 / assetsReturn.length
                    ),
                    clickedPortfolio.return
                  ).map((weight) => (weight * 100).toFixed(2));

                  const assetSymbols = [
                    assetSymbolA,
                    assetSymbolB,
                    assetSymbolC,
                    assetSymbolD,
                  ];

                  const portfolioComponents = assetsReturn.map(
                    (assetReturn, index) =>
                      `Asset ${assetSymbols[index]} : ${clickedWeights[index]}%`
                  );

                  const cardInfo = {
                    return: clickedPortfolio.return.toFixed(2),
                    volatility: clickedPortfolio.volatility.toFixed(2),
                    bestOutcomeReturn: (bestOutcomeReturn * 100).toFixed(2),
                    portfolioComponents,
                  };

                  console.log("Clicked Portfolio Information", cardInfo);
                  setClickedInfos((prevInfos) => [...prevInfos, cardInfo]);
                }
              });
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
    optimizePortfolio,
    assetsReturn,
    calculateBestOutcome,
    showNext,
    assetSymbolA,
    assetSymbolB,
    assetSymbolC,
    assetSymbolD,
  ]);

  return (
    <div className="dashboard">
      <div className="page-title">
        {/* Link to home */}
        <Link to="/" className="custom-link">
          <h2>Placeholder</h2>
        </Link>
      </div>
      <div className="container-middle">
        <div>
          {!showNext ? (
            <div>
              <div className="controls">
                {/* Buttons to show/hide content */}
                <button
                  ref={wrapperRefSelectAssets}
                  onClick={handleSelectAssetsClick}
                >
                  Select assets
                </button>
                <button
                  ref={wrapperRefStartDate}
                  onClick={handleStartDateClick}
                >
                  Start date
                </button>
                <button ref={wrapperRefEndDate} onClick={handleEndDateClick}>
                  End date
                </button>
                <button ref={wrapperRefInterval} onClick={handleIntervalClick}>
                  Interval
                </button>
              </div>
              <div className="chart-container">
                <div>
                  {showSelectAssets && (
                    <div
                      ref={wrapperRefSelectAssets}
                      className={`select-assets-content ${
                        showSelectAssets ? "visible" : ""
                      }`}
                    >
                      {/* Asset A search input */}
                      {showInputA && (
                        <div ref={wrapperRefA}>
                          <input
                            type="text"
                            value={searchStateA.companyName}
                            onChange={handleInputChangeA}
                            placeholder="Enter company name"
                          />
                          {/* Display search suggestions */}
                          {searchStateA.suggestions.length > 0 && (
                            <div className="suggestion-dropdown">
                              <ul>
                                {searchStateA.suggestions.map((item) => (
                                  <li
                                    key={item.symbol}
                                    onClick={() =>
                                      handleSuggestionClickA(
                                        item.name,
                                        item.symbol
                                      )
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
                      {/* Show search again button for Asset A */}
                      {showSearchAgainButtonA && (
                        <button
                          onClick={() => {
                            setShowInputA(true);
                            setShowSearchAgainButtonA(false);
                            setSearchResultA(null);
                            setSearchWarningA("Please search for an asset");
                          }}
                        >
                          Search Again
                        </button>
                      )}
                      {/* Display search results or warning for Asset A */}
                      {searchResultA && searchResultA.length > 0 ? (
                        <div>
                          <h2>Search Results:</h2>
                          <ul>
                            {searchResultA.map((item) => (
                              <li key={item.symbol}>
                                <strong>Name:</strong> {item.name}
                                <strong>Symbol:</strong> {item.symbol}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>{searchWarningA}</p>
                      )}
                      {/* Asset B search input */}
                      {showInputB && (
                        <div ref={wrapperRefB}>
                          <input
                            type="text"
                            value={searchStateB.companyName}
                            onChange={handleInputChangeB}
                            placeholder="Enter company name"
                          />
                          {/* Display search suggestions */}
                          {searchStateB.suggestions.length > 0 && (
                            <div className="suggestion-dropdown">
                              <ul>
                                {searchStateB.suggestions.map((item) => (
                                  <li
                                    key={item.symbol}
                                    onClick={() =>
                                      handleSuggestionClickB(
                                        item.name,
                                        item.symbol
                                      )
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
                      {/* Show search again button for Asset B */}
                      {showSearchAgainButtonB && (
                        <button
                          onClick={() => {
                            setShowInputB(true);
                            setShowSearchAgainButtonB(false);
                            setSearchResultB(null);
                            setSearchWarningB("Please search for an asset");
                          }}
                        >
                          Search Again
                        </button>
                      )}
                      {/* Display search results or warning for Asset B */}
                      {searchResultB && searchResultB.length > 0 ? (
                        <div>
                          <h2>Search Results:</h2>
                          <ul>
                            {searchResultB.map((item) => (
                              <li key={item.symbol}>
                                <strong>Name:</strong> {item.name}
                                <strong>Symbol:</strong> {item.symbol}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>{searchWarningB}</p>
                      )}
                      {/* Asset C search input */}
                      {showInputC && (
                        <div ref={wrapperRefC}>
                          <input
                            type="text"
                            value={searchStateC.companyName}
                            onChange={handleInputChangeC}
                            placeholder="Enter company name"
                          />
                          {/* Display search suggestions */}
                          {searchStateC.suggestions.length > 0 && (
                            <div className="suggestion-dropdown">
                              <ul>
                                {searchStateC.suggestions.map((item) => (
                                  <li
                                    key={item.symbol}
                                    onClick={() =>
                                      handleSuggestionClickC(
                                        item.name,
                                        item.symbol
                                      )
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
                      {/* Show search again button for Asset C */}
                      {showSearchAgainButtonC && (
                        <button
                          onClick={() => {
                            setShowInputC(true);
                            setShowSearchAgainButtonC(false);
                            setSearchResultC(null);
                            setSearchWarningC("Please search for an asset");
                          }}
                        >
                          Search Again
                        </button>
                      )}
                      {/* Display search results or warning for Asset C */}
                      {searchResultC && searchResultC.length > 0 ? (
                        <div>
                          <h2>Search Results:</h2>
                          <ul>
                            {searchResultC.map((item) => (
                              <li key={item.symbol}>
                                <strong>Name:</strong> {item.name}
                                <strong>Symbol:</strong> {item.symbol}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>{searchWarningC}</p>
                      )}
                      {/* Asset D search input */}
                      {showInputD && (
                        <div ref={wrapperRefD}>
                          <input
                            type="text"
                            value={searchStateD.companyName}
                            onChange={handleInputChangeD}
                            placeholder="Enter company name"
                          />
                          {/* Display search suggestions */}
                          {searchStateD.suggestions.length > 0 && (
                            <div className="suggestion-dropdown">
                              <ul>
                                {searchStateD.suggestions.map((item) => (
                                  <li
                                    key={item.symbol}
                                    onClick={() =>
                                      handleSuggestionClickD(
                                        item.name,
                                        item.symbol
                                      )
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
                      {/* Show search again button for Asset D */}
                      {showSearchAgainButtonD && (
                        <button
                          onClick={() => {
                            setShowInputD(true);
                            setShowSearchAgainButtonD(false);
                            setSearchResultD(null);
                            setSearchWarningD("Please search for an asset");
                          }}
                        >
                          Search Again
                        </button>
                      )}
                      {/* Display search results or warning for Asset D */}
                      {searchResultD && searchResultD.length > 0 ? (
                        <div>
                          <h2>Search Results:</h2>
                          <ul>
                            {searchResultD.map((item) => (
                              <li key={item.symbol}>
                                <strong>Name:</strong> {item.name}
                                <strong>Symbol:</strong> {item.symbol}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>{searchWarningD}</p>
                      )}
                    </div>
                  )}
                  {showStartDate && (
                    <div
                      ref={wrapperRefStartDate}
                      className="start-date-content visible"
                    >
                      <p>Please select a start date for the portfolio</p>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        placeholderText="Select start date"
                        maxDate={yesterday}
                        isClearable
                      />
                    </div>
                  )}
                  {showEndDate && (
                    <div
                      ref={wrapperRefEndDate}
                      className="end-date-content visible"
                    >
                      <p>Please select an end date for the portfolio</p>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        placeholderText="Select end date"
                        maxDate={today}
                        isClearable
                      />
                    </div>
                  )}
                </div>
                <div>
                  {showInterval && (
                    <div
                      ref={wrapperRefInterval}
                      className="interval-content visible"
                    >
                      <p>Please select an interval for the portfolio</p>
                      <div>
                        {" "}
                        <select
                          value={interval}
                          onChange={(e) => setInterval(e.target.value)}
                        >
                          <option value="Interval">Interval</option>
                          <option value="1m">1 Minute</option>
                          <option value="5m">5 Minutes</option>
                          <option value="15m">15 Minutes</option>
                          <option value="30m">30 Minutes</option>
                          <option value="1hour">1 Hour</option>
                          <option value="4hour">4 Hour</option>
                          <option value="Daily">Daily</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="return-chart">
                    {Object.keys(lineChartData).length > 0 && (
                      <Line data={lineChartData} options={options} />
                    )}
                  </div>
                  <div className="buttons-container">
                    <button
                      onClick={handleClearButtonClick}
                      className="btn clear"
                    >
                      Clear
                    </button>
                    {buttonNextDisabled ? (
                      <button
                        disabled={buttonNextDisabled}
                        className="btn next"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleNextButtonClick}
                        className="btn next"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="monte-carlo-chart">
              <div className="chart-container-monte-carlo">
                <canvas
                  ref={chartContainerRef}
                  width="400"
                  height="400"
                ></canvas>
                <div className="btn-back-container">
                  <button className="btn back" onClick={handleNextButtonClick}>
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
                      <button className="btn save">Save</button>
                      <button className="btn buy">Buy</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Profile information and navigation */}
      <div className="profile">
        <div className="username">{username}</div>
        <img src={portrait} alt=" "></img>
      </div>
      {/* Navigation links */}
      <div className="containers-left">
        {/* Dashboard links */}
        <div className="first-container">
          <Link to="/dashboard" className="custom-link">
            <h3 className="first-container-text">Dashboard</h3>
          </Link>
        </div>
        {/* Investment-related links */}
        <div className="second-container">
          {/* Highlighted "Invest" link */}
          <Link to="/dashboard/invest" className="custom-link">
            <h4
              className="second-container-text"
              style={{ backgroundColor: "rgb(161, 161, 161)" }}
            >
              Invest
            </h4>
          </Link>
          <Link to="/dashboard/watchlist" className="custom-link">
            <h4 className="second-container-text">Watchlist</h4>
          </Link>
          <Link to="/dashboard/portfolios" className="custom-link">
            <h4 className="second-container-text">Portfolios</h4>
          </Link>
        </div>
        {/* Profile and logout links */}
        <div className="third-container">
          <Link to="/dashboard/profile" className="custom-link">
            <h4 className="third-container-text">Profile</h4>
          </Link>
          <h4 className="third-container-text" onClick={toggleModal}>
            Log out
          </h4>
        </div>
        {/* Logout confirmation modal */}
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

// Function to handle saving data for a single asset portfolio
// const handleSavedDataOneAsset = async () => {
//   const firstAssetName =
//     searchResultA.length > 0 ? searchResultA[0].name : "";
//   const data = {
//     assets: 1,
//     firstAsset: firstAssetName,
//   };
//   setSavedData([data]);

//   try {
//     const response = await axios.post(
//       "http://localhost:3002/save-data-portfolio",
//       {
//         username: username,
//         savedData: savedData,
//       }
//     );
//     if (response.status === 200) {
//       console.log("Data saved successfully");
//     }
//   } catch (error) {
//     console.error("Error saving risk array:", error.message);
//   }
// };

// Function to handle saving data for a two asset portfolio
// const handleSavedDataTwoAssets = async () => {
//   const firstAssetName =
//     searchResultA.length > 0 ? searchResultA[0].name : "";
//   const secondAssetName =
//     searchResultA.length > 0 ? searchResultB[0].name : "";
//   const data = {
//     assets: 2,
//     firstAsset: firstAssetName,
//     secondAsset: secondAssetName,
//   };
//   setSavedData([data]);

//   try {
//     const response = await axios.post(
//       "http://localhost:3002/save-data-portfolio",
//       {
//         username: username,
//         savedData: savedData,
//       }
//     );
//     if (response.status === 200) {
//       console.log("Data saved successfully");
//     }
//   } catch (error) {
//     console.error("Error saving risk array:", error.message);
//   }
// };

// Fetch search results for asset A
// useEffect(() => {
//   if (!searchStateA.hasSearched || !searchStateA.companyName) return; // Return if search not performed or company name empty

//   fetch(searchApiUrl) // Fetching data from API
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`); // Handling HTTP error
//       }
//       return response.json(); // Parsing response as JSON
//     })
//     .then((data) => {
//       if (!data) {
//         console.error("Error: Data is null"); // Handling null data
//         setSearchResultA(null); // Setting search result to null
//         setSearchWarningB("No matching company found."); // Setting search warning
//         return;
//       }

//       const foundItem = data.find((item) => {
//         if (!item || !item.name) return false;
//         return item.name
//           .toLowerCase()
//           .includes(searchStateA.companyName.toLowerCase()); // Checking for matching company name
//       });

//       setSearchResultA(foundItem ? [foundItem] : []); // Setting search result
//       setAssetSymbolA(foundItem ? foundItem.symbol : ""); // Setting asset symbol
//       setSearchStateA({
//         ...searchStateA,
//         hasSearched: false,
//       }); // Resetting search state
//       setSearchWarningA(""); // Clearing search warning
//     })
//     .catch((error) => {
//       console.error("Error fetching data:", error); // Handling fetch error
//       setSearchResultA(null); // Setting search result to null
//     });
// }, [searchApiUrl, searchStateA]); // Dependencies for useEffect hook

// Fetch search results for asset B
// useEffect(() => {
//   if (!searchStateB.hasSearched || !searchStateB.companyName) return; // Return if search not performed or company name empty

//   fetch(searchApiUrl) // Fetching data from API
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`); // Handling HTTP error
//       }
//       return response.json(); // Parsing response as JSON
//     })
//     .then((data) => {
//       if (!data) {
//         console.error("Error: Data is null"); // Handling null data
//         setSearchResultB(null); // Setting search result to null
//         setSearchWarningB("No matching company found."); // Setting search warning
//         return;
//       }

//       const foundItem = data.find((item) => {
//         if (!item || !item.name) return false;
//         return item.name
//           .toLowerCase()
//           .includes(searchStateB.companyName.toLowerCase()); // Checking for matching company name
//       });

//       setSearchResultB(foundItem ? [foundItem] : []); // Setting search result
//       setAssetSymbolB(foundItem ? foundItem.symbol : ""); // Setting asset symbol
//       setSearchStateB({
//         ...searchStateB,
//         hasSearched: false,
//       }); // Resetting search state
//       setSearchWarningB(""); // Clearing search warning
//     })
//     .catch((error) => {
//       console.error("Error fetching data:", error); // Handling fetch error
//       setSearchResultA(null); // Setting search result to null
//     });
// }, [searchApiUrl, searchStateB]); // Dependencies for useEffect hook
