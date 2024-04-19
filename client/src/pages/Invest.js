import React, { useState, useEffect } from "react";
import portrait from "../imgs/default-pp.jpg";
import axios from "axios";
import "../Dashboard.css";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardInvest() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState("");
  const [riskValueA, setRiskValueA] = useState("");
  const [riskValueB, setRiskValueB] = useState("");
  const navigate = useNavigate();
  const [balanceWarning, setBalanceWarning] = useState("");
  const [riskWarning, setRiskWarning] = useState("");
  const [selectedButton, setSelectedButton] = useState(null);
  const [balanceInput, setBalanceInput] = useState("");
  const [riskInputA, setRiskInputA] = useState("");
  const [riskInputB, setRiskInputB] = useState("");
  const [balanceReturn, setBalanceReturn] = useState("");
  const [filteredDataA, setFilteredDataA] = useState([]);
  const [filteredDataB, setFilteredDataB] = useState([]);
  const [assetSymbolA, setAssetSymbolA] = useState("");
  const [assetSymbolB, setAssetSymbolB] = useState("");
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
  const [searchResultA, setSearchResultA] = useState(null);
  const [searchResultB, setSearchResultB] = useState(null);
  const [savedData, setSavedData] = useState([]);
  const [savedPortfolioBalanceReturnA, setSavedPortfolioBalanceReturnA] =
    useState("");
  const [savedPortfolioBalanceReturnB, setSavedPortfolioBalanceReturnB] =
    useState("");
  const [searchWarningA, setSearchWarningA] = useState(
    "Please search for an asset"
  );
  const [searchWarningB, setSearchWarningB] = useState(
    "Please search for an asset"
  );
  const [showInputA, setShowInputA] = useState(true);
  const [showInputB, setShowInputB] = useState(true);
  const [showSearchAgainButtonA, setShowSearchAgainButtonA] = useState(false);
  const [showSearchAgainButtonB, setShowSearchAgainButtonB] = useState(false);

  const apiKey = "SbUhzMlpiU94dp9UtJGKlPs59R6DBpGi";
  const searchApiUrl = `https://financialmodelingprep.com/api/v3/stock/list?apikey=${apiKey}`;

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

  // Fetch search results for asset A
  useEffect(() => {
    if (!searchStateA.hasSearched || !searchStateA.companyName) return; // Return if search not performed or company name empty

    fetch(searchApiUrl) // Fetching data from API
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Handling HTTP error
        }
        return response.json(); // Parsing response as JSON
      })
      .then((data) => {
        if (!data) {
          console.error("Error: Data is null"); // Handling null data
          setSearchResultA(null); // Setting search result to null
          setSearchWarningB("No matching company found."); // Setting search warning
          return;
        }

        const foundItem = data.find((item) => {
          if (!item || !item.name) return false;
          return item.name
            .toLowerCase()
            .includes(searchStateA.companyName.toLowerCase()); // Checking for matching company name
        });

        setSearchResultA(foundItem ? [foundItem] : []); // Setting search result
        setAssetSymbolA(foundItem ? foundItem.symbol : ""); // Setting asset symbol
        setSearchStateA({
          ...searchStateA,
          hasSearched: false,
        }); // Resetting search state
        setSearchWarningA(""); // Clearing search warning
      })
      .catch((error) => {
        console.error("Error fetching data:", error); // Handling fetch error
        setSearchResultA(null); // Setting search result to null
      });
  }, [searchApiUrl, searchStateA]); // Dependencies for useEffect hook

  // Fetch search results for asset B
  useEffect(() => {
    if (!searchStateB.hasSearched || !searchStateB.companyName) return; // Return if search not performed or company name empty

    fetch(searchApiUrl) // Fetching data from API
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Handling HTTP error
        }
        return response.json(); // Parsing response as JSON
      })
      .then((data) => {
        if (!data) {
          console.error("Error: Data is null"); // Handling null data
          setSearchResultB(null); // Setting search result to null
          setSearchWarningB("No matching company found."); // Setting search warning
          return;
        }

        const foundItem = data.find((item) => {
          if (!item || !item.name) return false;
          return item.name
            .toLowerCase()
            .includes(searchStateB.companyName.toLowerCase()); // Checking for matching company name
        });

        setSearchResultB(foundItem ? [foundItem] : []); // Setting search result
        setAssetSymbolB(foundItem ? foundItem.symbol : ""); // Setting asset symbol
        setSearchStateB({
          ...searchStateB,
          hasSearched: false,
        }); // Resetting search state
        setSearchWarningB(""); // Clearing search warning
      })
      .catch((error) => {
        console.error("Error fetching data:", error); // Handling fetch error
        setSearchResultA(null); // Setting search result to null
      });
  }, [searchApiUrl, searchStateB]); // Dependencies for useEffect hook

  // Handle search for asset A
  const handleSearchA = () => {
    setSearchStateA({
      ...searchStateA,
      hasSearched: true,
    }); // Setting search state
    setShowInputA(false); // Hiding input field
    setShowSearchAgainButtonA(true); // Showing search again button
  };

  // Handle search for asset B
  const handleSearchB = () => {
    setSearchStateB({
      ...searchStateB,
      hasSearched: true,
    }); // Setting search state
    setShowInputB(false); // Hiding input field
    setShowSearchAgainButtonB(true); // Showing search again button
  };

  // Handle input change for asset A
  const handleInputChangeA = (e) => {
    const input = e.target.value; // Getting input value
    setSearchStateA((prevState) => ({
      ...prevState,
      companyName: input,
    })); // Setting company name in search state

    if (input.trim() === "") {
      setSearchStateA((prevState) => ({
        ...prevState,
        suggestions: [],
      })); // Clearing suggestions if input is empty
      return;
    }

    fetch(
      `https://financialmodelingprep.com/api/v3/search?query=${input}&limit=5&apikey=${apiKey}`
    ) // Fetching search suggestions
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Handling HTTP error
        }
        return response.json(); // Parsing response as JSON
      })
      .then((data) => {
        if (!data) {
          console.error("Error: Data is null"); // Handling null data
          setSearchStateA((prevState) => ({
            ...prevState,
            suggestions: [],
          })); // Clearing suggestions
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

            setSearchStateA((prevState) => ({
              ...prevState,
              suggestions: filteredSuggestions,
            })); // Setting filtered suggestions
          })
          .catch((error) => {
            console.error("Error fetching profiles:", error); // Handling fetch error
            setSearchStateA((prevState) => ({
              ...prevState,
              suggestions: [],
            })); // Clearing suggestions
          });
      })
      .catch((error) => {
        console.error("Error fetching suggestions:", error); // Handling fetch error
        setSearchStateA((prevState) => ({
          ...prevState,
          suggestions: [],
        })); // Clearing suggestions
      });
  };

  // Handle input change for asset B
  const handleInputChangeB = (e) => {
    const input = e.target.value; // Getting input value
    setSearchStateB((prevState) => ({
      ...prevState,
      companyName: input,
    })); // Setting company name in search state

    if (input.trim() === "") {
      setSearchStateB((prevState) => ({
        ...prevState,
        suggestions: [],
      })); // Clearing suggestions if input is empty
      return;
    }

    fetch(
      `https://financialmodelingprep.com/api/v3/search?query=${input}&limit=5&apikey=${apiKey}`
    ) // Fetching search suggestions
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Handling HTTP error
        }
        return response.json(); // Parsing response as JSON
      })
      .then((data) => {
        if (!data) {
          console.error("Error: Data is null"); // Handling null data
          setSearchStateB((prevState) => ({
            ...prevState,
            suggestions: [],
          })); // Clearing suggestions
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

            setSearchStateB((prevState) => ({
              ...prevState,
              suggestions: filteredSuggestions,
            })); // Setting filtered suggestions
          })
          .catch((error) => {
            console.error("Error fetching suggestions:", error); // Handling fetch error
            setSearchStateB((prevState) => ({
              ...prevState,
              suggestions: [],
            })); // Clearing suggestions
          });
      });
  };

  const handleButtonAssetsClick = (buttonNumber) => {
    setSelectedButton(buttonNumber); // Set selected button number
    setBalanceInput(""); // Clear balance input
    setRiskInputA(""); // Clear risk input for asset A
    setRiskInputB(""); // Clear risk input for asset B
    setBalanceReturn(0); // Reset balance return
  };

  // Function to handle click on a suggestion for asset A
  const handleSuggestionClickA = (name) => {
    setSearchStateA({
      ...searchStateA,
      companyName: name, // Update selected company name for asset A
      suggestions: [], // Clear suggestions
    });
  };

  // Function to handle click on a suggestion for asset B
  const handleSuggestionClickB = (name) => {
    setSearchStateB({
      ...searchStateB,
      companyName: name, // Update selected company name for asset B
      suggestions: [], // Clear suggestions
    });
  };

  // Define start and end dates for historical data retrieval
  const fromDate = "2023-10-10";
  const toDate = "2023-12-10";

  // Effect hook to fetch historical data for asset A when its symbol changes
  useEffect(() => {
    if (!assetSymbolA) return; // Return if asset symbol A is not set
    const histroyApiUrlA = `https://financialmodelingprep.com/api/v3/historical-chart/4hour/${assetSymbolA}?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    console.log(histroyApiUrlA);
    fetch(histroyApiUrlA)
      .then((response) => response.json())
      .then((data) => {
        // Filter data to include only closing prices at 3 PM each day
        const filtered = data.filter((item) => {
          const date = new Date(item.date);
          return date.getHours() === 15;
        });
        setFilteredDataA(filtered); // Set filtered data for asset A
        console.log(filtered);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [assetSymbolA, fromDate, toDate]);

  useEffect(() => {
    if (!assetSymbolB) return; // Return if asset symbol B is not set
    const histroyApiUrlB = `https://financialmodelingprep.com/api/v3/historical-chart/4hour/${assetSymbolB}?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    console.log(histroyApiUrlB);
    fetch(histroyApiUrlB)
      .then((response) => response.json())
      .then((data) => {
        // Filter data to include only closing prices at 3 PM each day
        const filtered = data.filter((item) => {
          const date = new Date(item.date);
          return date.getHours() === 15;
        });
        setFilteredDataB(filtered); // Set filtered data for asset B
        console.log(filtered);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [assetSymbolB, fromDate, toDate]);

  // Function to handle submission when only one asset is selected
  const handleSubmitOneAsset = async () => {
    console.log(filteredDataA.map((item) => item.close));
    const balance = Number(balanceInput);
    const riskA = 10;

    // Validate balance
    if (isNaN(balance) || balance <= 0) {
      setBalanceWarning("Please insert a valid balance value for Asset A.");
      return;
    } else {
      setBalanceWarning("");
    }

    // Validate riskA
    if (isNaN(riskA) || riskA < 1 || riskA > 10) {
      setRiskWarning(
        "Please insert a risk value between 1 and 10 for Asset A."
      );
      return;
    } else {
      setRiskWarning("");
    }
    // Calculate portfolio returns and display results
    const closesA = filteredDataA.map((item) => item.close);

    const returnsA = calculateDailyReturns(closesA);

    const meanReturnA = calculateMeanReturn(returnsA);

    const deviationsA = calculateDeviations(returnsA, returnsA);

    const covarianceA = calculateCovariance(deviationsA, deviationsA);

    let bestReturnHigherRisk = {
      portfolioReturn: -Infinity,
      portfolioVariance: -Infinity,
      weights: { weightA: 0 },
    };

    for (let weightA = 1; weightA <= 10; weightA += 0.5) {
      const totalWeight = weightA;
      const normalizedWeightA = weightA / totalWeight;

      const portfolioReturn = normalizedWeightA * meanReturnA;

      const portfolioVariance = normalizedWeightA ** 2 * (riskInputA / 10) ** 2;

      if (
        portfolioReturn > bestReturnHigherRisk.portfolioReturn &&
        portfolioVariance > bestReturnHigherRisk.portfolioVariance
      ) {
        bestReturnHigherRisk = {
          portfolioReturn,
          portfolioVariance,
          weights: {
            weightA: Math.min(
              Math.max(Math.round(normalizedWeightA * 20) / 2, 1),
              10
            ),
          },
        };
      }
    }

    const userWeightA = riskA;

    console.log("Mean Return A:", meanReturnA);
    console.log("Covariance between Asset A and Asset B:", covarianceA);
    console.log("Best Weights for Higher Return:", {
      weightA: bestReturnHigherRisk.weights.weightA,
    });
    console.log("Your weights:", {
      weightA: userWeightA,
    });

    const portfolioReturn = userWeightA * meanReturnA;
    console.log(
      `Portfolio Return based on your weight: ${parseFloat(
        portfolioReturn.toFixed(2)
      )}%`
    );

    const portfolioBalanceReturn =
      Number(balanceInput) + (balanceInput * portfolioReturn) / 100;

    setBalanceReturn(portfolioBalanceReturn);
    setSavedPortfolioBalanceReturnA(portfolioBalanceReturn);

    const portfolioReturnBasedOnBestWeights =
      bestReturnHigherRisk.weights.weightA * meanReturnA;
    console.log(
      `Portfolio Return based on best weights: ${parseFloat(
        portfolioReturnBasedOnBestWeights.toFixed(2)
      )}%`
    );

    const portfolioVariance =
      bestReturnHigherRisk.weights.weightA ** 2 * (riskInputA / 10) ** 2;
    console.log("Portfolio Variance:", portfolioVariance);
  };

  // Function to handle submission when two assets are selected
  const handleSubmitTwoAssets = async () => {
    const balance = Number(balanceInput);
    let riskA = 0;
    let riskB = 0;

    // Validate balance input and risk inputs for both assets
    if (riskValueA && !isNaN(parseFloat(riskValueA))) {
      riskA = parseFloat(riskValueA);
    }

    if (riskValueB && !isNaN(parseFloat(riskValueB))) {
      riskB = parseFloat(riskValueB);
    }

    // Validate balance
    if (isNaN(balance) || balance <= 0) {
      setBalanceWarning("Please insert a valid balance value for Asset A.");
      return;
    } else {
      setBalanceWarning("");
    }

    // Validate riskA
    if (isNaN(riskA) || riskA < 1 || riskA > 10) {
      setRiskWarning(
        "Please insert a risk value between 1 and 10 for Asset A."
      );
      return;
    } else {
      setRiskWarning("");
    }

    // Validate riskB
    if (isNaN(riskB) || riskB < 1 || riskB > 10) {
      setRiskWarning(
        "Please insert a risk value between 1 and 10 for Asset B."
      );
      return;
    } else {
      setRiskWarning("");
    }

    // Saving risk values for both assets
    try {
      await axios.post("http://localhost:3002/save-risk", {
        username: username,
        riskValueA: riskA,
        riskValueB: riskB,
      });
      setRiskValueA(riskA);
      setRiskValueB(riskB);
    } catch (error) {
      console.error("Error saving risk value:", error.message);
    }

    // Calculate portfolio returns and display results
    const closesA = filteredDataA.map((item) => item.close);
    const closesB = filteredDataB.map((item) => item.close);

    const returnsA = calculateDailyReturns(closesA);
    const returnsB = calculateDailyReturns(closesB);

    const minDays = Math.min(returnsA.length, returnsB.length);
    const truncatedReturnsA = returnsA.slice(0, minDays);
    const truncatedReturnsB = returnsB.slice(0, minDays);

    const meanReturnA = calculateMeanReturn(truncatedReturnsA);
    const meanReturnB = calculateMeanReturn(truncatedReturnsB);

    const deviationsA = calculateDeviations(truncatedReturnsA, meanReturnA);
    const deviationsB = calculateDeviations(truncatedReturnsB, meanReturnB);

    const covarianceAB = calculateCovariance(deviationsA, deviationsB);

    let bestReturnHigherRisk = {
      portfolioReturn: -Infinity,
      portfolioVariance: -Infinity,
      weights: { weightA: 0, weightB: 0 },
    };

    for (let weightA = 1; weightA <= 10; weightA += 0.5) {
      for (let weightB = 1; weightB <= 10; weightB += 0.5) {
        const totalWeight = weightA + weightB;
        const normalizedWeightA = weightA / totalWeight;
        const normalizedWeightB = weightB / totalWeight;

        const portfolioReturn =
          normalizedWeightA * meanReturnA + normalizedWeightB * meanReturnB;

        const portfolioVariance =
          normalizedWeightA ** 2 * (riskInputB / 10) ** 2 +
          normalizedWeightB ** 2 * (riskInputB / 10) ** 2 +
          2 * normalizedWeightA * normalizedWeightB * covarianceAB;

        if (
          portfolioReturn > bestReturnHigherRisk.portfolioReturn &&
          portfolioVariance > bestReturnHigherRisk.portfolioVariance
        ) {
          bestReturnHigherRisk = {
            portfolioReturn,
            portfolioVariance,
            weights: {
              weightA: Math.min(
                Math.max(Math.round(normalizedWeightA * 20) / 2, 1),
                10
              ),
              weightB: Math.min(
                Math.max(Math.round(normalizedWeightB * 20) / 2, 1),
                10
              ),
            },
          };
        }
      }
    }

    const userWeightA = (riskA / 10) * 10;
    const userWeightB = (riskB / 10) * 10;

    console.log("Mean Return A:", meanReturnA);
    console.log("Mean Return B:", meanReturnB);
    console.log("Covariance between Asset A and Asset B:", covarianceAB);
    console.log("Best Weights for Higher Return:", {
      weightA: bestReturnHigherRisk.weights.weightA,
      weightB: bestReturnHigherRisk.weights.weightB,
    });
    console.log("Your weights:", {
      weightA: userWeightA,
      weightB: userWeightB,
    });

    const portfolioReturn =
      userWeightA * meanReturnA + userWeightB * meanReturnB;
    console.log(
      `Portfolio Return based on your weight: ${parseFloat(
        portfolioReturn.toFixed(2)
      )}%`
    );

    const portfolioBalanceReturn =
      Number(balanceInput) + (balanceInput * portfolioReturn) / 100;

    setBalanceReturn(portfolioBalanceReturn);
    setSavedPortfolioBalanceReturnB(portfolioBalanceReturn);

    const portfolioReturnBasedOnBestWeights =
      bestReturnHigherRisk.weights.weightA * meanReturnA +
      bestReturnHigherRisk.weights.weightB * meanReturnB;
    console.log(
      `Portfolio Return based on best weights: ${parseFloat(
        portfolioReturnBasedOnBestWeights.toFixed(2)
      )}%`
    );

    const portfolioVariance =
      bestReturnHigherRisk.weights.weightA ** 2 * (riskInputA / 10) ** 2 +
      bestReturnHigherRisk.weights.weightB ** 2 * (riskInputB / 10) ** 2 +
      2 *
        bestReturnHigherRisk.weights.weightA *
        bestReturnHigherRisk.weights.weightB *
        covarianceAB;
    console.log("Portfolio Variance:", portfolioVariance);
  };

  // Function to calculate daily returns given an array of closing prices
  const calculateDailyReturns = (closes) => {
    return closes.slice(1).map((close, index) => {
      const previousClose = closes[index];
      return ((close - previousClose) / previousClose) * 100;
    });
  };

  // Function to calculate the mean return of an array of returns
  const calculateMeanReturn = (array) => {
    const sum = array.reduce((acc, returnVal) => acc + returnVal, 0);
    return sum / array.length;
  };

  // Function to calculate deviations from the mean for each return in an array
  const calculateDeviations = (array, mean) => {
    return array.map((returnVal) => returnVal - mean);
  };

  // Function to calculate covariance between two arrays of returns
  const calculateCovariance = (array1, array2) => {
    const n = array1.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += array1[i] * array2[i];
    }
    return sum / (n - 1);
  };

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

  // Effect hook to fetch risk values for assets A and B when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      getRiskValueA(username).then((riskValueA) => {
        setRiskValueA(riskValueA || 0);
      });
      getRiskValueB(username).then((riskValueB) => {
        setRiskValueB(riskValueB || 0);
      });
    }
  }, [isLoggedIn, username]);

  // Function to fetch risk value for asset A from the server
  const getRiskValueA = async (username) => {
    try {
      const response = await axios.post("http://localhost:3002/get-risk", {
        username: username,
      });

      if (response.status === 200) {
        console.log("Risk value fetched successfully:", response.data.riskA);
        return response.data.riskA;
      }
    } catch (error) {
      console.error("Error fetching risk value:", error.message);
    }
  };

  // Function to fetch risk value for asset B from the server
  const getRiskValueB = async (username) => {
    try {
      const response = await axios.post("http://localhost:3002/get-risk", {
        username: username,
      });

      if (response.status === 200) {
        console.log("Risk value fetched successfully:", response.data.riskB);
        return response.data.riskB;
      }
    } catch (error) {
      console.error("Error fetching risk value:", error.message);
    }
  };

  // Function to handle saving data for a single asset portfolio
  const handleSavedDataOneAsset = async () => {
    const firstAssetName =
      searchResultA.length > 0 ? searchResultA[0].name : "";
    const data = {
      assets: 1,
      balanceInput: balanceInput,
      riskInputA: riskValueA,
      riskInputB: 0,
      balanceResult: savedPortfolioBalanceReturnA,
      firstAsset: firstAssetName,
    };
    setSavedData([data]);

    try {
      const response = await axios.post(
        "http://localhost:3002/save-data-portfolio",
        {
          username: username,
          savedData: savedData,
        }
      );
      if (response.status === 200) {
        console.log("Data saved successfully");
      }
    } catch (error) {
      console.error("Error saving risk array:", error.message);
    }
  };

  // Function to handle saving data for a two asset portfolio
  const handleSavedDataTwoAssets = async () => {
    const firstAssetName =
      searchResultA.length > 0 ? searchResultA[0].name : "";
    const secondAssetName =
      searchResultA.length > 0 ? searchResultB[0].name : "";
    const data = {
      assets: 2,
      balanceInput: balanceInput,
      riskInputA: riskValueA,
      riskInputB: riskValueB,
      balanceResult: savedPortfolioBalanceReturnB,
      firstAsset: firstAssetName,
      secondAsset: secondAssetName,
    };
    setSavedData([data]);

    try {
      const response = await axios.post(
        "http://localhost:3002/save-data-portfolio",
        {
          username: username,
          savedData: savedData,
        }
      );
      if (response.status === 200) {
        console.log("Data saved successfully");
      }
    } catch (error) {
      console.error("Error saving risk array:", error.message);
    }
  };

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
          {/* Buttons to select one or two assets */}
          <button onClick={() => handleButtonAssetsClick(1)}>One Asset</button>
          <button onClick={() => handleButtonAssetsClick(2)}>Two Assets</button>
          <p></p>
        </div>
        {/* Render content based on selected button */}
        {selectedButton === 1 && (
          <div>
            {/* Asset A search input */}
            {showInputA && (
              <>
                <input
                  type="text"
                  value={searchStateA.companyName}
                  onChange={handleInputChangeA}
                  placeholder="Enter company name"
                />
                <button onClick={handleSearchA}>Search</button>
                {/* Display search suggestions */}
                {searchStateA.suggestions.length > 0 && (
                  <div>
                    <h2>Search Suggestions:</h2>
                    <ul>
                      {searchStateA.suggestions.map((item) => (
                        <li
                          key={item.symbol}
                          onClick={() =>
                            handleSuggestionClickA(item.name, item.symbol)
                          }
                        >
                          <strong>Name:</strong> {item.name}
                          <strong>Symbol:</strong> {item.symbol}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
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
            {/* Display search results or warnings for Asset A */}
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
            {/* Render balance input and buttons for Asset A */}
            {searchWarningA === "" && (
              <div>
                <div className="balance-value">{`Your Balance: ${balanceInput}`}</div>
                <div className="balance-warning">{balanceWarning}</div>
                <input
                  type="input"
                  placeholder="Balance for Asset A"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                />
                <button
                  className="submit-button"
                  onClick={handleSubmitOneAsset}
                >
                  Calculate
                </button>
                <button
                  className="submit-button"
                  onClick={handleSavedDataOneAsset}
                >
                  Save
                </button>
                <div>{balanceReturn}</div>
              </div>
            )}
          </div>
        )}
        {/* Render content for two assets */}
        {selectedButton === 2 && (
          <div>
            {/* Asset A search input */}
            {showInputA && (
              <>
                <input
                  type="text"
                  value={searchStateA.companyName}
                  onChange={handleInputChangeA}
                  placeholder="Enter company name"
                />
                <button onClick={handleSearchA}>Search</button>
                {/* Display search suggestions */}
                {searchStateA.suggestions.length > 0 && (
                  <div>
                    <h2>Search Suggestions:</h2>
                    <ul>
                      {searchStateA.suggestions.map((item) => (
                        <li
                          key={item.symbol}
                          onClick={() =>
                            handleSuggestionClickA(item.name, item.symbol)
                          }
                        >
                          <strong>Name:</strong> {item.name}
                          <strong>Symbol:</strong> {item.symbol}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
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
              <>
                <input
                  type="text"
                  value={searchStateB.companyName}
                  onChange={handleInputChangeB}
                  placeholder="Enter company name"
                />
                <button onClick={handleSearchB}>Search</button>
                {/* Display search suggestions */}
                {searchStateB.suggestions.length > 0 && (
                  <div>
                    <h2>Search Suggestions:</h2>
                    <ul>
                      {searchStateB.suggestions.map((item) => (
                        <li
                          key={item.symbol}
                          onClick={() =>
                            handleSuggestionClickB(item.name, item.symbol)
                          }
                        >
                          <strong>Name:</strong> {item.name}
                          <strong>Symbol:</strong> {item.symbol}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
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
            {/* Display search results or warning for Asset A */}
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
            {searchWarningA === "" && searchWarningB === "" && (
              <div>
                <div className="balance-value">{`Your Balance: ${balanceInput}`}</div>
                <div className="balance-warning">{balanceWarning}</div>
                <div className="risk-value">{`Your first Risk: ${riskValueA}`}</div>
                <div className="risk-value">{`Your second Risk: ${riskValueB}`}</div>
                <div className="risk-warning">{riskWarning}</div>
                <input
                  type="input"
                  placeholder="Balance for Asset A"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Risk for Asset B"
                  value={riskValueA}
                  onChange={(e) => setRiskValueA(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Risk for Asset B"
                  value={riskValueB}
                  onChange={(e) => setRiskValueB(e.target.value)}
                />
                <button
                  className="submit-button"
                  onClick={handleSubmitTwoAssets}
                >
                  Submit
                </button>
                <button
                  className="submit-button"
                  onClick={handleSavedDataTwoAssets}
                >
                  Save
                </button>
                <div>{balanceReturn}</div>
              </div>
            )}
          </div>
        )}
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
