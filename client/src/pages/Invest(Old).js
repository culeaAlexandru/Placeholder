import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interval, setInterval] = useState("4hour"); // Default interval set to 4 hour
  const [lineChartData, setLineChartData] = useState({});
  const [filteredDataA, setFilteredDataA] = useState([]);
  const [filteredDataB, setFilteredDataB] = useState([]);
  const [filteredDataC, setFilteredDataC] = useState([]);
  const [filteredDataD, setFilteredDataD] = useState([]);
  const [buttonNextDisabled, setButtonNextDisabled] = useState(false);
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

  const assetsReturns = useMemo(() => [0.1, 0.15, 0.2], []);
  const assetsVols = useMemo(() => [0.1, 0.2, 0.25], []);
  const assetsCorrelationMatrix = useMemo(
    () => [
      [1.0, 0.3, 0.2],
      [0.3, 1.0, 0.5],
      [0.2, 0.5, 1.0],
    ],
    []
  );

  const [monteCarloPortfolios, setMonteCarloPortfolios] = useState([]);
  const [efficientFrontierData, setEfficientFrontierData] = useState([]);
  const [riskFreeRate, setRiskFreeRate] = useState(null);

  const apiKey = "VHfZ1hD7PgRzcghHku0BmQ4ki5erDFjN";

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

  const handleSelectAssetsClick = () => {
    setShowSelectAssets(!showSelectAssets);
    setShowStartDate(false);
    setShowEndDate(false);
    setShowInterval(false);
  };

  const handleStartDateClick = () => {
    setShowStartDate(!showStartDate);
    setShowSelectAssets(false);
    setShowEndDate(false);
    setShowInterval(false);
  };

  const handleEndDateClick = () => {
    setShowEndDate(!showEndDate);
    setShowSelectAssets(false);
    setShowStartDate(false);
    setShowInterval(false);
  };

  const handleIntervalClick = () => {
    setShowInterval(!showInterval);
    setShowSelectAssets(false);
    setShowStartDate(false);
    setShowEndDate(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRefSelectAssets.current &&
        !wrapperRefSelectAssets.current.contains(event.target)
      ) {
        setShowSelectAssets(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRefSelectAssets]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRefStartDate.current &&
        !wrapperRefStartDate.current.contains(event.target)
      ) {
        setShowStartDate(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRefStartDate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRefEndDate.current &&
        !wrapperRefEndDate.current.contains(event.target)
      ) {
        setShowEndDate(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRefEndDate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRefInterval.current &&
        !wrapperRefInterval.current.contains(event.target)
      ) {
        setShowInterval(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRefInterval]);

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
    setSearchStateB({
      ...searchStateB,
      companyName: name,
      suggestions: [], // Clear suggestions
    });
    setShowInputB(false); // Hiding input field
    setShowSearchAgainButtonB(true); // Showing search again button
    setAssetSymbolB(symbol ? symbol : ""); // Setting asset symbol
  };

  const handleSuggestionClickC = (name, symbol) => {
    setSearchResultC([{ name, symbol }]);
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
    setSearchStateD({
      ...searchStateD,
      companyName: "",
      suggestions: [], // Clear suggestions
    });
    setShowInputD(false); // Hiding input field
    setShowSearchAgainButtonD(true); // Showing search again button
    setAssetSymbolD(symbol ? symbol : ""); // Setting asset symbol
  };

  // Effect hook to fetch historical data for asset A when its symbol changes
  useEffect(() => {
    if (!assetSymbolA || !startDate || !endDate) return; // Return if asset symbol A is not set
    const histroyApiUrlA = `https://financialmodelingprep.com/api/v3/historical-chart/${interval}/${assetSymbolA}?from=${startDate}&to=${endDate}&apikey=${apiKey}`;
    console.log(histroyApiUrlA);
    fetch(histroyApiUrlA)
      .then((response) => response.json())
      .then((data) => {
        setFilteredDataA(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [assetSymbolA, interval, startDate, endDate]);

  useEffect(() => {
    if (!assetSymbolB || !startDate || !endDate) return; // Return if asset symbol A is not set
    const histroyApiUrlB = `https://financialmodelingprep.com/api/v3/historical-chart/${interval}/${assetSymbolB}?from=${startDate}&to=${endDate}&apikey=${apiKey}`;
    console.log(histroyApiUrlB);
    fetch(histroyApiUrlB)
      .then((response) => response.json())
      .then((data) => {
        setFilteredDataB(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [assetSymbolB, interval, startDate, endDate]);

  // Effect hook to fetch historical data for asset A when its symbol changes
  useEffect(() => {
    if (!assetSymbolC || !startDate || !endDate) return; // Return if asset symbol A is not set
    const histroyApiUrlC = `https://financialmodelingprep.com/api/v3/historical-chart/${interval}/${assetSymbolC}?from=${startDate}&to=${endDate}&apikey=${apiKey}`;
    console.log(histroyApiUrlC);
    fetch(histroyApiUrlC)
      .then((response) => response.json())
      .then((data) => {
        setFilteredDataC(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [assetSymbolC, interval, startDate, endDate]);

  useEffect(() => {
    if (!assetSymbolD || !startDate || !endDate) return; // Return if asset symbol A is not set
    const histroyApiUrlD = `https://financialmodelingprep.com/api/v3/historical-chart/${interval}/${assetSymbolD}?from=${startDate}&to=${endDate}&apikey=${apiKey}`;
    console.log(histroyApiUrlD);
    fetch(histroyApiUrlD)
      .then((response) => response.json())
      .then((data) => {
        setFilteredDataD(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [assetSymbolD, interval, startDate, endDate]);

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
    if (!filteredDataA && !filteredDataB && !filteredDataC && !filteredDataD)
      return; // Return if necessary data is missing

    const chartLabelA = filteredDataA.map((data) => data.date);
    const chartDataA = filteredDataA.map((data, index) => {
      if (index === 0) return 0; // Return 0 for the first data point since there's no previous data point to compare with
      const previousClose = filteredDataA[index - 1].close;
      return ((data.close - previousClose) / previousClose) * 100; // Calculate percentage change
    });

    const chartDataB = filteredDataB.map((data, index) => {
      if (index === 0) return 0; // Return 0 for the first data point since there's no previous data point to compare with
      const previousClose = filteredDataB[index - 1].close;
      return ((data.close - previousClose) / previousClose) * 100; // Calculate percentage change
    });

    const chartDataC = filteredDataC.map((data, index) => {
      if (index === 0) return 0; // Return 0 for the first data point since there's no previous data point to compare with
      const previousClose = filteredDataC[index - 1].close;
      return ((data.close - previousClose) / previousClose) * 100; // Calculate percentage change
    });

    const chartDataD = filteredDataD.map((data, index) => {
      if (index === 0) return 0; // Return 0 for the first data point since there's no previous data point to compare with
      const previousClose = filteredDataD[index - 1].close;
      return ((data.close - previousClose) / previousClose) * 100; // Calculate percentage change
    });

    console.log(chartDataA);
    console.log(chartDataB);
    console.log(chartDataC);
    console.log(chartDataD);

    setLineChartData({
      labels: chartLabelA,
      datasets: [
        {
          label: assetSymbolA,
          data: chartDataA,
          fill: false,
          borderColor: "green",
          tension: 0.1,
        },
        {
          label: assetSymbolB,
          data: chartDataB,
          fill: false,
          borderColor: "blue",
          tension: 0.1,
        },
        {
          label: assetSymbolC,
          data: chartDataC,
          fill: false,
          borderColor: "pink",
          tension: 0.1,
        },
        {
          label: assetSymbolD,
          data: chartDataD,
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
    setShowNext(true);
  };

  useEffect(() => {
    const cachedRate = sessionStorage.getItem("riskFreeRate");
    if (cachedRate) {
      setRiskFreeRate(parseFloat(cachedRate));
      console.log("cache");
    } else {
      async function fetchRiskFreeRate() {
        const apiKey = "M4H1P0NX0B015FR8";
        const url = `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=monthly&maturity=3month&apikey=${apiKey}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data["data"] && data["data"].length > 0) {
            const latestRate = parseFloat(data["data"].slice(-1)[0]["value"]);
            sessionStorage.setItem("riskFreeRate", latestRate);
            setRiskFreeRate(latestRate);
            console.log("not cache");
          } else {
            console.error("Unexpected API response format:", data);
          }
        } catch (error) {
          console.error("Error fetching risk-free rate:", error);
        }
      }
      fetchRiskFreeRate();
    }
  }, []);

  const calculatePortfolioMetrics = useCallback(
    (weights) => {
      if (riskFreeRate === null) return null;

      const portfolioReturn = weights.reduce(
        (acc, weight, index) => acc + weight * assetsReturns[index],
        0
      );
      let portfolioVolatility = 0;
      for (let i = 0; i < weights.length; i++) {
        for (let j = 0; j < weights.length; j++) {
          portfolioVolatility +=
            weights[i] *
            weights[j] *
            assetsVols[i] *
            assetsVols[j] *
            assetsCorrelationMatrix[i][j];
        }
      }
      const portfolioVolatilitySqrt = Math.sqrt(portfolioVolatility);
      const sharpeRatio =
        (portfolioReturn - riskFreeRate) / portfolioVolatilitySqrt;

      return {
        return: portfolioReturn,
        volatility: portfolioVolatilitySqrt,
        sharpeRatio: sharpeRatio,
      };
    },
    [assetsReturns, assetsVols, assetsCorrelationMatrix, riskFreeRate]
  );

  const generateRandomPortfolios = useCallback(() => {
    const numPortfolios = 100;
    return Array.from({ length: numPortfolios }, () => {
      const weights = Array.from({ length: assetsReturns.length }, () =>
        Math.random()
      );
      const totalWeight = weights.reduce((acc, curr) => acc + curr, 0);
      const normalizedWeights = weights.map((weight) => weight / totalWeight);
      return calculatePortfolioMetrics(normalizedWeights);
    });
  }, [assetsReturns, calculatePortfolioMetrics]);

  const optimizePortfolio = useCallback(
    (initialWeights, targetReturn) => {
      const tolerance = 0.0001;
      let currentWeights = initialWeights.slice();
      let learningRate = 0.01;
      let iteration = 0;
      const maxIterations = 10000;

      const calculateReturn = (weights) => {
        return weights.reduce(
          (acc, weight, index) => acc + weight * assetsReturns[index],
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
              assetsVols[i] *
              assetsVols[j] *
              assetsCorrelationMatrix[i][j];
          }
        }
        return variance;
      };

      const objectiveFunction = (weights) => {
        const portReturn = calculateReturn(weights);
        const portVariance = calculateVariance(weights);
        const penalty = 100 * (portReturn - targetReturn) ** 2;
        return portVariance + penalty;
      };

      const calculateGradient = (weights) => {
        return weights.map((_, index) => {
          const weightPlus = [...weights];
          weightPlus[index] += 0.0001;
          return (
            (objectiveFunction(weightPlus) - objectiveFunction(weights)) /
            0.0001
          );
        });
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

        currentWeights = updateWeights(currentWeights, gradients);

        const change = currentWeights.reduce(
          (acc, weight, i) => acc + Math.abs(weight - initialWeights[i]),
          0
        );
        if (change < tolerance) {
          break;
        }

        iteration++;
      }

      return currentWeights;
    },
    [assetsReturns, assetsVols, assetsCorrelationMatrix]
  );

  const findEfficientFrontier = useCallback(() => {
    const targetReturns = Array.from(
      { length: 50 },
      (_, i) => 0.05 + i * 0.005
    );
    return targetReturns.map((targetReturn) => {
      const initialWeights = Array.from(
        { length: assetsReturns.length },
        () => 1 / assetsReturns.length
      );
      const optimizedWeights = optimizePortfolio(initialWeights, targetReturn);
      return calculatePortfolioMetrics(optimizedWeights);
    });
  }, [assetsReturns, optimizePortfolio, calculatePortfolioMetrics]);

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
    if (chartContainerRef.current && showNext) {
      const formattedEfficientFrontierData = efficientFrontierData.map(
        (portfolio) => ({
          x: portfolio.volatility,
          y: portfolio.return,
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
              data: monteCarloPortfolios.map((portfolio) => ({
                x: portfolio.volatility,
                y: portfolio.return,
              })),
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              pointRadius: 5,
            },
          ],
        },
        options: {
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const clickedIndex = elements[0].index;
              const clickedPortfolio = monteCarloPortfolios[clickedIndex];
              console.log(
                `Expected Return: ${clickedPortfolio.return.toFixed(2)}%`
              );
              console.log(
                `Risk (CVaR 1%): ${clickedPortfolio.volatility.toFixed(2)}%`
              );

              const bestOutcomeReturn = calculateBestOutcome(0.99);
              console.log(
                `Best outcome (CVaR 99%): ${(bestOutcomeReturn * 100).toFixed(
                  2
                )}%`
              );

              const clickedWeights = optimizePortfolio(
                Array.from(
                  { length: assetsReturns.length },
                  () => 1 / assetsReturns.length
                ),
                clickedPortfolio.return
              ).map((weight) => (weight * 100).toFixed(2));

              console.log(
                `Portfolio components: Asset 1 ${clickedWeights[0]}%, Asset 2 ${clickedWeights[1]}%, Asset 3 ${clickedWeights[2]}%`
              );
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Volatility (Standard Deviation)",
              },
              beginAtZero: true,
            },
            y: {
              title: {
                display: true,
                text: "Expected Return",
              },
              beginAtZero: true,
            },
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
    assetsReturns.length,
    calculateBestOutcome,
    showNext,
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
                <button onClick={handleSelectAssetsClick}>Select assets</button>
                <button onClick={handleStartDateClick}>Start date</button>
                <button onClick={handleEndDateClick}>End date</button>
                <button onClick={handleIntervalClick}>Interval</button>
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
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                  )}
                  {showEndDate && (
                    <div
                      ref={wrapperRefEndDate}
                      className="end-date-content visible"
                    >
                      <p>Please select an end date for the portfolio</p>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
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
                          <option value="1m">1 Minute</option>
                          <option value="5m">5 Minutes</option>
                          <option value="15m">15 Minutes</option>
                          <option value="30m">30 Minutes</option>
                          <option value="1hour">1 Hour</option>
                          <option value="4hour">4 Hour</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    {Object.keys(lineChartData).length > 0 && (
                      <Line data={lineChartData} options={options} />
                    )}
                  </div>
                  <button onClick={handleClearButtonClick}>Clear</button>
                  {!buttonNextDisabled ? (
                    <button
                      disabled={buttonNextDisabled}
                      onClick={handleNextButtonClick}
                    >
                      Next
                    </button>
                  ) : (
                    <button onClick={handleNextButtonClick}>Next</button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="monte-carlo-chart">
              <canvas ref={chartContainerRef} width="400" height="400"></canvas>
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
