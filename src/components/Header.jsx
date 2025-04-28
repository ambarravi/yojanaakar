import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Header = ({ signOut }) => {
  const { user } = useContext(AuthContext);

  return (
    <header
      className="text-white d-flex justify-content-between align-items-center p-3"
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 100,
        background: "linear-gradient(90deg, #cce5ff, #99ccff)",
      }}
    >
      <div className="d-flex align-items-center">
        <h4
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2rem",
            fontWeight: "500",
            margin: 0,
            color: "var(--amplify-colors-font-primary)",
          }}
        >
          Tikties
        </h4>
      </div>
      <nav>
        <ul className="nav">
          <li className="nav-item">
            <Link to="/contact-us" className="nav-link text-muted">
              <i className="bi bi-envelope"></i> Contact Us
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about-us" className="nav-link text-muted">
              <i className="bi bi-info-circle"></i> About Us
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/help" className="nav-link text-muted">
              <i className="bi bi-question-circle"></i> Help
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/subscription" className="nav-link text-muted">
              <i className="bi bi-person-badge"></i> Subscription
            </Link>
          </li>
          {user && (
            <li className="nav-item">
              <button className="nav-link btn text-muted" onClick={signOut}>
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
