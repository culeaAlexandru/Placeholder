import React, { useState } from "react";
import portrait from "../imgs/default-pp.jpg";
import "../Dashboard.css";
import { Link } from "react-router-dom";

export default function DashboardInvest() {
  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
  };

  if (modal) {
    document.body.classList.add("active-modal");
  } else {
    document.body.classList.remove("active-modal");
  }
  const [account, setAccount] = useState({
    balance: 0,
    risk: 0,
  });

  const [balanceInput, setBalanceInput] = useState("");
  const [riskInput, setRiskInput] = useState("");

  const displayAccountValue = function (property) {
    return `Your ${property}: ${account[property]}`;
  };

  const handleSubmit = () => {
    if (Number(balanceInput) === 0 && account.balance === 0) {
      alert(
        `Please insert a valid balance value. Your balance value is: ${account.balance}`
      );
    } else {
      setAccount((prevAccount) => ({
        ...prevAccount,
        balance: prevAccount.balance + Number(balanceInput),
      }));
    }

    if (Number(riskInput) === 0 && account.risk === 0) {
      alert(
        `Please insert a valid risk value. Your risk value is: ${account.risk}`
      );
    } else if (
      (Number(riskInput) > 10 && account.risk === 0) ||
      (Number(riskInput) < 1 && account.risk === 0)
    ) {
      alert(
        `Please add a risk value between 1 and 10. Your risk value is: ${account.risk}`
      );
    } else {
      setAccount((prevAccount) => ({
        ...prevAccount,
        risk: prevAccount.risk + Number(riskInput),
      }));
    }

    setBalanceInput("");
    setRiskInput("");
  };

  const nextDays = function (day) {
    let valuesPerDay = [];
    if (account.risk > 0 && account.balance > 0) {
      for (let i = 0; i < day; i++) {
        valuesPerDay.push(Math.floor(Math.random() * day + 1));
      }

      for (const values of valuesPerDay) {
        if (values > 5) {
          setAccount((prevAccount) => ({
            ...prevAccount,
            balance: prevAccount.balance + values * 10,
          }));
        } else if (values < 5) {
          setAccount((prevAccount) => ({
            ...prevAccount,
            balance: prevAccount.balance - values * 10,
          }));
        }
      }
    } else if (
      account.risk > 0 &&
      (account.balance === 0 || account.balance < 0)
    ) {
      alert(
        `Please insert a valid balance value. Your balance value is: ${account.balance}`
      );
    } else if (
      account.balance > 0 &&
      (account.risk === 0 || account.risk < 0)
    ) {
      alert(
        `Please insert a valid risk value. Your risk value is: ${account.risk}`
      );
    } else {
      alert(`Please insert a valid balance value. Your balance value is: ${account.balance}
Please insert a valid risk value. Your risk value is: ${account.risk}`);
    }
  };

  const pastDays = function (day) {
    let valuesPerPastDays = [];
    for (let i = 0; i < day; i++) {
      valuesPerPastDays.push(Math.floor(Math.random() * day + 1));
    }

    let averageValues =
      valuesPerPastDays.reduce((acc, value) => acc + value, 0) / day;

    alert(
      `The average value of the past ${day} days is: ${averageValues.toFixed(
        2
      )}`
    );
  };

  return (
    <div className="dashboard">
      <div className="page-title">
        <Link to="/loggedin" className="custom-link">
          <h2>Placeholder</h2>
        </Link>
      </div>
      <div className="container-middle">
        <div className="balance-value">{displayAccountValue("balance")}</div>
        <div className="risk-value">{displayAccountValue("risk")}</div>
        <input
          type="input"
          placeholder="Balance"
          value={balanceInput}
          onChange={(e) => setBalanceInput(e.target.value)}
        />
        <input
          type="input"
          placeholder="Risk"
          value={riskInput}
          onChange={(e) => setRiskInput(e.target.value)}
        />
        <button className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
        <button className="next-day-button" onClick={() => nextDays(1)}>
          Next Day
        </button>
        <button className="next-7-days" onClick={() => nextDays(7)}>
          Next 7 Days
        </button>
        <button className="past-7-days" onClick={() => pastDays(7)}>
          Past 7 Days
        </button>
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
            <h4 className="second-container-text">Porfolios</h4>
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
