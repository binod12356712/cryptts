import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import Countdown from "./Countdown";
import "./PredictionDetails.css";
import logo1 from "./logoResult.png";
import Login from "./Login";
import SignupModal from "./SignupModal";
import logo3 from "./logo3.png";
import "@fortawesome/fontawesome-free/css/all.min.css";

const cryptoNameToSymbol = {
  ethereum: "ETH",
  bitcoin: "BTC",
  // Add more mappings as needed
};

const PredictionDetails = () => {
  const { predictionId } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [logoBase64, setLogoBase64] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef();
  const mainContentRef = useRef();
  const downloadButtonRef = useRef();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const uid = localStorage.getItem("userId");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await axios.get(
          `https://trcnfx.com/api/prediction/${predictionId}`
        );
        setPrediction(response.data);

        const symbol = response.data.symbol.toLowerCase();
        const logoResponse = await axios.get(
          `https://pro-api.coingecko.com/api/v3/coins/${symbol}`,
          {
            headers: {
              "X-Cg-Pro-Api-Key": "CG-abdEKxm7HXgBnnG2D2eexnmq",
            },
          }
        );
        const imageUrl = logoResponse.data.image.large;
        const imageResponse = await axios.get(
          "https://trcnfx.com/api/fetch-image",
          {
            params: { imageUrl },
          }
        );
        setLogoBase64(`data:image/jpeg;base64,${imageResponse.data.image}`);
      } catch (error) {
        console.error("Error fetching prediction:", error);
      }
    };

    fetchPrediction();
  }, [predictionId]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const captureScreenshot = useCallback(async () => {
    if (mainContentRef.current && logoLoaded) {
      downloadButtonRef.current.style.display = "none";
      const canvas = await html2canvas(mainContentRef.current);
      downloadButtonRef.current.style.display = "block";

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "delivery_report.png";
      link.click();
    }
  }, [logoLoaded]);

  const handleLogoLoad = () => {
    setLogoLoaded(true);
  };

  const handleLogoError = () => {
    console.error("Error loading logo.");
  };

  if (!prediction) {
    return <div>Loading...</div>;
  }

  const symbol =
    cryptoNameToSymbol[prediction.symbol.toLowerCase()] ||
    prediction.symbol.toUpperCase();

  const isProfit = prediction.result && prediction.result.success;
  const profitLossAmount = prediction.result
    ? isProfit
      ? prediction.result.profit
      : prediction.amount
    : 0;

  const profitLossClass = isProfit ? "profit" : "loss";
  const profitLossMessage = prediction.result
    ? isProfit
      ? `Profit ${profitLossAmount} USDT`
      : `Loss ${profitLossAmount} USDT`
    : "Pending";

  return (
    <div className="container">
      <header>
        <div
          className="title-container"
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
          }}
        >
          <button
            className="back-button"
            onClick={() => navigate(-1)}
            style={{
              marginRight: "10px",
              fontSize: "24px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "white",
            }}
          >
            &#8592;
          </button>
          <h1>My Transaction</h1>
          <button className="menu-button" onClick={toggleMenu}>
            &#9776;
          </button>
        </div>
      </header>

      <div
        id="sidebar"
        className={`sidebar ${isMenuOpen ? "open" : ""}`}
        ref={sidebarRef}
      >
        <div className="sidebar-header">
          <img src={logo3} alt="logo" />
          <p>
            <b>UID: {uid}</b>
          </p>
        </div>

        <div className="functions">
          <ul>
            <li>
              <Link to="/wallet" className="link">
                <i className="fas fa-wallet"></i> Wallet
              </Link>
            </li>
            <li>
              <Link to="/tradepage">
                <i className="fas fa-exchange-alt"></i> Trade
              </Link>
            </li>
            <li>
              <Link to="/result">
                <i className="fas fa-chart-line"></i> Result
              </Link>
            </li>
            <li>
              <Link to="/transaction">
                <i className="fas fa-pen"></i> Transactions
              </Link>
            </li>
            <li>
              <Link to="/terms">
                <i className="fas fa-book"></i> Privacy Policy
              </Link>
            </li>
            <li>
              <button
                className="link"
                onClick={() => navigate("/profit-stats")}
              >
                <i className="fas fa-chart-bar"></i> Profit Statistics
              </button>
            </li>
            {/* <li>
              <button className="link" onClick={() => navigate("/helpLoan")}>
                <i className="fas fa-book"></i> Help Loan
              </button>
            </li> */}
            <li>
              <button className="link" onClick={() => navigate("/contactUs")}>
                <i className="fas fa-phone"></i> Contact Us
              </button>
            </li>
          </ul>
          <div className="more-options">
            <ul>
              {isLoggedIn ? (
                <li>
                  <Link to="/settings">
                    <i className="fa-solid fa-gear"></i> Settings
                  </Link>
                </li>
              ) : (
                <li>
                  <button onClick={() => setShowLoginModal(true)}>
                    <i className="fa-solid fa-person"></i> Login
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={captureScreenshot}
          ref={downloadButtonRef}
          style={{
            padding: "10px",
            fontSize: "16px",
            cursor: "pointer",
            background: "none",
            border: "none",
            marginTop: "30px",
          }}
          disabled={!logoLoaded}
        >
          <i className="fas fa-download" style={{ fontSize: "24px" }}></i>
        </button>
      </div>

      <div
        className="main-content"
        ref={mainContentRef}
        // style={{ padding: "20px" }}
      >
        <div className="prediction-details">
          <h1 className="report-title" style={{ color: "black" }}>
            Delivery Report
          </h1>
          <hr className="underline" />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <img
              src={logo1}
              alt="logo"
              style={{ height: "100px", width: "140px" }}
            />
          </div>

          <div className="report-header">
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={logoBase64}
                alt={`${symbol} logo`}
                className="logo-top-left"
                onLoad={handleLogoLoad}
                onError={handleLogoError}
              />
              <div style={{ marginLeft: "10px" }}>
                <span className="symbol" style={{ fontSize: "15px" }}>
                  {symbol}/USDT
                </span>
                <div
                  className="symbol-timestamp"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <span className="timestamp">
                    {new Date(prediction.predictedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="content">
            <div>
              <p className="label">
                Purchase Amount{" "}
                <span className="value">{prediction.amount} USDT</span>
              </p>
              <p className="label">
                Direction{" "}
                <span className={`value ${prediction.direction}`}>
                  {prediction.direction === "up" ? "Bullish" : "Bearish"}
                </span>
              </p>
              <p className="label">
                Purchase Price{" "}
                <span className="value">{prediction.currentPrice} USD</span>
              </p>
              <p className="label">
                Contract{" "}
                <span className="value">{prediction.deliveryTime}s</span>
              </p>
              <p className={`label ${profitLossClass}`}>
                {isProfit ? "Profit" : "Loss"}{" "}
                <span
                  className="value"
                  style={{ color: isProfit ? "green" : "red" }}
                >
                  {isProfit ? "+" : "-"}
                  {profitLossAmount} USDT
                </span>
              </p>
              <p className="label">
                Delivery Time{" "}
                <span className="value" style={{ marginLeft: "50px" }}>
                  {new Date(
                    new Date(prediction.predictedAt).getTime() +
                      prediction.deliveryTime * 1000
                  ).toLocaleString()}
                </span>
              </p>
              {profitLossMessage === "Pending" && (
                <p className="label">
                  Time Left{" "}
                  <Countdown
                    deliveryTime={prediction.deliveryTime}
                    predictedAt={prediction.predictedAt}
                  />
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} />}
      {showSignupModal && (
        <SignupModal closeModal={() => setShowSignupModal(false)} />
      )}
    </div>
  );
};

export default PredictionDetails;
