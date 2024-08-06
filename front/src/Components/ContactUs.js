import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../wallet/WalletDashboard.css"; // Reuse the CSS file for styling
import logo3 from "./logo3.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Login from "./Login"; // Import the Login component
import SignupModal from "./SignupModal"; // Import the SignupModal component
import axios from "axios";
import { useTheme } from "../ThemeContext"; // Import ThemeContext

export default function ContactUs() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef();
  const userId = localStorage.getItem("_id"); // Get the MongoDB userId
  const uid = localStorage.getItem("userId"); // Get the 7-digit uid
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://trcnfx.com/api/contact", {
        title,
        description,
        userId,
        uid,
      });
      alert("Form submitted successfully");
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };

  return (
    <div className="container">
      <header style={{ backgroundColor: "var(--primary-color)" }}>
        <div
          className="title-container"
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
          }}
        >
          <h1>
            <Link to="/">TrustCoinFX</Link>
          </h1>
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
          {isLoggedIn && (
            <p>
              Verified{" "}
              <i className="fas fa-check-circle" style={{ color: "white" }}></i>
            </p>
          )}
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

      <div className="main-content">
        <div className="banner">
          <h2>Contact Us</h2>
          <p>
            We're here to help! If you have any questions or need assistance,
            contact us anytime.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              style={{
                border: "1px solid black",
                width: "100%",
                height: "80px",
              }}
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="submit-button"
            style={{ backgroundColor: "#4caf50", color: "white" }}
          >
            Submit
          </button>
        </form>
      </div>

      {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} />}
      {showSignupModal && (
        <SignupModal closeModal={() => setShowSignupModal(false)} />
      )}
    </div>
  );
}
