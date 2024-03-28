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
  });
  const [searchStateB, setSearchStateB] = useState({
    companyName: "",
    hasSearched: false,
  });
  const [searchResultA, setSearchResultA] = useState(null);
  const [searchResultB, setSearchResultB] = useState(null);
  const [savedData, setSavedData] = useState([]);
  const [savedPortfolioBalanceReturnA, setSavedPortfolioBalanceReturnA] =
    useState("");
  const [savedPortfolioBalanceReturnB, setSavedPortfolioBalanceReturnB] =
    useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);

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

  const apiKey = "SbUhzMlpiU94dp9UtJGKlPs59R6DBpGi";
  const searchApiUrl = `https://financialmodelingprep.com/api/v3/stock/list?apikey=${apiKey}`;

  useEffect(() => {
    if (!searchStateA.hasSearched || !searchStateA.companyName) return;

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
          setSearchResultA(null);
          return;
        }

        const foundItem = data.find((item) => {
          if (!item || !item.name) return false;
          return item.name
            .toLowerCase()
            .includes(searchStateA.companyName.toLowerCase());
        });

        setSearchResultA(foundItem ? [foundItem] : []);
        setAssetSymbolA(foundItem ? foundItem.symbol : "");
        setSearchStateA({
          ...searchStateA,
          hasSearched: false,
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setSearchResultA(null);
      });
  }, [searchApiUrl, searchStateA]);

  useEffect(() => {
    if (!searchStateB.hasSearched || !searchStateB.companyName) return;

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
          setSearchResultA(null);
          return;
        }

        const foundItem = data.find((item) => {
          if (!item || !item.name) return false;
          return item.name
            .toLowerCase()
            .includes(searchStateB.companyName.toLowerCase());
        });

        setSearchResultB(foundItem ? [foundItem] : []);
        setAssetSymbolB(foundItem ? foundItem.symbol : "");
        setSearchStateB({
          ...searchStateB,
          hasSearched: false,
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setSearchResultA(null);
      });
  }, [searchApiUrl, searchStateB]);

  const handleSearchA = () => {
    setSearchStateA({
      ...searchStateA,
      hasSearched: true,
    });
    setShowSearchInput(true);
  };

  const handleSearchB = () => {
    setSearchStateB({
      ...searchStateB,
      hasSearched: true,
    });
    setShowSearchInput(true);
  };

  const handleButtonAssetsClick = (buttonNumber) => {
    setSelectedButton(buttonNumber);
    setBalanceInput("");
    setRiskInputA("");
    setRiskInputB("");
    setBalanceReturn(0);
  };

  const fromDate = "2023-10-10";
  const toDate = "2023-12-10";

  useEffect(() => {
    if (!assetSymbolA) return;
    const histroyApiUrlA = `https://financialmodelingprep.com/api/v3/historical-chart/4hour/${assetSymbolA}?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    console.log(histroyApiUrlA);
    fetch(histroyApiUrlA)
      .then((response) => response.json())
      .then((data) => {
        const filtered = data.filter((item) => {
          const date = new Date(item.date);
          return date.getHours() === 15;
        });

        setFilteredDataA(filtered);
        console.log(filtered);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [assetSymbolA, fromDate, toDate]);

  useEffect(() => {
    if (!assetSymbolB) return;
    const histroyApiUrlB = `https://financialmodelingprep.com/api/v3/historical-chart/4hour/${assetSymbolB}?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    console.log(histroyApiUrlB);
    fetch(histroyApiUrlB)
      .then((response) => response.json())
      .then((data) => {
        const filtered = data.filter((item) => {
          const date = new Date(item.date);
          return date.getHours() === 15;
        });

        setFilteredDataB(filtered);
        console.log(filtered);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [assetSymbolB, fromDate, toDate]);

  const handleSubmitOneAsset = async () => {
    console.log(filteredDataA.map((item) => item.close));
    const balance = Number(balanceInput);
    let riskA = riskValueA;

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

    try {
      await axios.post("http://localhost:3002/save-risk", {
        username: username,
        riskValueA: riskA,
      });
      setRiskValueA(riskA);
    } catch (error) {
      console.error("Error saving risk value:", error.message);
    }

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

  const handleSubmitTwoAssets = async () => {
    const balance = Number(balanceInput);
    let riskA = 0;
    let riskB = 0;

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

  const calculateDailyReturns = (closes) => {
    return closes.slice(1).map((close, index) => {
      const previousClose = closes[index];
      return ((close - previousClose) / previousClose) * 100;
    });
  };

  const calculateMeanReturn = (array) => {
    const sum = array.reduce((acc, returnVal) => acc + returnVal, 0);
    return sum / array.length;
  };

  const calculateDeviations = (array, mean) => {
    return array.map((returnVal) => returnVal - mean);
  };

  const calculateCovariance = (array1, array2) => {
    const n = array1.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += array1[i] * array2[i];
    }
    return sum / (n - 1);
  };

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
    if (isLoggedIn) {
      getRiskValueA(username).then((riskValueA) => {
        setRiskValueA(riskValueA || 0);
      });
      getRiskValueB(username).then((riskValueB) => {
        setRiskValueB(riskValueB || 0);
      });
    }
  }, [isLoggedIn, username]);

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
        <Link to="/" className="custom-link">
          <h2>Placeholder</h2>
        </Link>
      </div>
      <div className="container-middle">
        <div>
          <button onClick={() => handleButtonAssetsClick(1)}>Button 1</button>
          <button onClick={() => handleButtonAssetsClick(2)}>Button 2</button>
          {selectedButton && <p>Selected Button: {selectedButton}</p>}
        </div>
        {selectedButton === 1 && (
          <div>
            <input
              type="text"
              value={searchStateA.companyName}
              onChange={(e) =>
                setSearchStateA({
                  ...searchStateA,
                  companyName: e.target.value,
                })
              }
              placeholder="Enter company name"
            />
            <button onClick={handleSearchA}>Search</button>
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
              <p>No matching company found.</p>
            )}
            {showSearchInput && (
              <div>
                <div className="balance-value">{`Your Balance: ${balanceInput}`}</div>
                <div className="balance-warning">{balanceWarning}</div>
                <div className="risk-value">{`Your Risk: ${riskValueA}`}</div>
                <div className="risk-warning">{riskWarning}</div>
                <input
                  type="input"
                  placeholder="Balance for Asset A"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Risk for Asset A"
                  value={riskValueA}
                  onChange={(e) => setRiskValueA(e.target.value)}
                />

                <button
                  className="submit-button"
                  onClick={handleSubmitOneAsset}
                >
                  Submit
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

        {selectedButton === 2 && (
          <div>
            <input
              type="text"
              value={searchStateA.companyName}
              onChange={(e) =>
                setSearchStateA({
                  ...searchStateA,
                  companyName: e.target.value,
                })
              }
              placeholder="Enter company name"
            />
            <button onClick={handleSearchA}>Search</button>
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
              <p>No matching company found.</p>
            )}
            <input
              type="text"
              value={searchStateB.companyName}
              onChange={(e) =>
                setSearchStateB({
                  ...searchStateB,
                  companyName: e.target.value,
                })
              }
              placeholder="Enter company name"
            />
            <button onClick={handleSearchB}>Search</button>
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
              <p>No matching company found.</p>
            )}
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
            <button className="submit-button" onClick={handleSubmitTwoAssets}>
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
