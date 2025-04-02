import React from "react";
import { useNavigate } from "react-router-dom";
import { Heading, View } from "@aws-amplify/ui-react";
import "../styles/Events.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faUserTie,
  faEnvelope,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";

// Import images explicitly from src/assets/images/
import heroImage from "../assets/images/Tikto_BG_web_5.png";

function EventsPage() {
  const navigate = useNavigate();

  const handleOrganizerSignIn = () => {
    sessionStorage.setItem("tempRole", "organizer");
    localStorage.setItem("local_tempRole", "organizer");
    navigate("/organizer-landing");
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="container">
          <View className="header-content">
            <Heading level={1} className="logo">
              Tikti
            </Heading>
            <nav className="nav-links">
              <Link to="/#" className="nav-link">
                <FontAwesomeIcon icon={faDownload} /> Download App
              </Link>
              <Link
                to="/organizer-landing"
                onClick={handleOrganizerSignIn}
                className="nav-link"
              >
                <FontAwesomeIcon icon={faUserTie} /> Organizer Sign In
              </Link>
              <Link to="/#" className="nav-link">
                <FontAwesomeIcon icon={faEnvelope} /> Contact Us
              </Link>
              <Link to="/#" className="nav-link">
                <FontAwesomeIcon icon={faCrown} /> Subscription
              </Link>
            </nav>
          </View>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <img src={heroImage} alt="Hero" className="hero-image" />
        </section>

        <section className="how-it-works-section">
          <div className="container">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Learn More about how our website works
            </p>
            <div className="cards-container">
              <div
                className="card"
                style={{ backgroundColor: "#e3f2fd", color: "#1e3a8a" }}
              >
                <h3>Event Discovery</h3>
                <p>Browse events across cities and categories easily.</p>
              </div>
              <div className="card">
                <h3>Easy Booking</h3>
                <p>Reserve your spot with secure and fast transactions.</p>
              </div>
              <div className="card">
                <h3>Organizer Tools</h3>
                <p>Manage events, tickets, and attendees efficiently.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="business-listing-section">
          <div className="container">
            <h2 className="section-title">
              Do you want to add your business listing with us?
            </h2>
            <p className="section-description">
              Join Tikti to list your events and reach a wider audience. Contact
              us for more details!
            </p>
            <Link to="/#" className="custom-button">
              Get Started
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="footer-text">© 2025 Tikti. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default EventsPage;
