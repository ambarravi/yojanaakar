import React from "react";
import { useNavigate } from "react-router-dom";
import { View } from "@aws-amplify/ui-react";
import "../styles/Events.css";
//import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faUserTie,
  faEnvelope,
  faCrown,
  faMobile,
} from "@fortawesome/free-solid-svg-icons";

// Import images explicitly from src/assets/images/
import heroImage from "../assets/images/Tikto_BG.png";
import logoImage from "../assets/images/tikties_logo.png";
// Import app screenshot images
import appScreenshot1 from "../assets/images/Phone_frame_home.png";
import appScreenshot2 from "../assets/images/Phone_frame_Event_Details.png";
import appScreenshot3 from "../assets/images/Phone_frame_QRCode.png";
import appScreenshot4 from "../assets/images/Phone_frame_Booking_History.png";
import appScreenshot5 from "../assets/images/Phone_frame_Feedback.png";

function EventsPage() {
  const navigate = useNavigate();

  const handleOrganizerSignIn = () => {
    sessionStorage.setItem("tempRole", "organizer");
    localStorage.setItem("local_tempRole", "organizer");
    navigate("/organizer-landing");

    // //  sessionStorage.setItem("tempRole", "organizer");
    // //  localStorage.setItem("local_tempRole", "organizer");
    // const domain = process.env.REACT_APP_COGNITO_OAUTH_DOMAIN;
    // const clientId = process.env.REACT_APP_POOL_CLIENT_ID;
    // const redirectUri = process.env.REACT_APP_COGNITO_REDIRECT_SIGN_IN;

    // const loginUrl = `https://${domain}/login?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`;
    // // const loginUrl = `https://${domain}/oauth2/authorize?identity_provider=Google&response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    // //   redirectUri
    // // )}&scope=email+openid+profile`;

    // window.location.href = loginUrl;
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="container">
          <View className="header-content">
            <div className="logo">
              <img
                src={logoImage}
                alt="Logo"
                className="logo-image"
                style={{ height: "40px", objectFit: "contain" }}
              />
            </div>
            <nav className="nav-links">
              <a href="#download-app" className="nav-link">
                <FontAwesomeIcon icon={faDownload} /> Download App
              </a>
              <a href="#how-it-works" className="nav-link">
                <FontAwesomeIcon icon={faUserTie} /> How It Works
              </a>
              <a href="#contact-us" className="nav-link">
                <FontAwesomeIcon icon={faEnvelope} /> Contact Us
              </a>
              {/* <Link
                to="/organizer-landing"
                onClick={handleOrganizerSignIn}
                className="nav-link organizer-signin"
              >
                <FontAwesomeIcon icon={faCrown} /> Organizer Sign In
              </Link> */}

              <button
                onClick={handleOrganizerSignIn}
                className="nav-link organizer-signin"
              >
                <FontAwesomeIcon icon={faCrown} /> Organizer Sign In
              </button>
            </nav>
          </View>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <img src={heroImage} alt="Hero" className="hero-image" />
        </section>

        <section id="how-it-works" className="how-it-works-section">
          <div className="container">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Discover the key features of Tikties and how they help you easily
              explore, register, and engage with events personalized for you.
            </p>
            <div className="cards-container">
              <div
                className="card"
                style={{ backgroundColor: "#e3f2fd", color: "#1e3a8a" }}
              >
                <h3>
                  <span style={{ color: "#F97316", fontWeight: "bold" }}>
                    Discover
                  </span>{" "}
                  Events That Matter
                </h3>

                <p>
                  Explore events curated just for you with the Tikties mobile
                  app. Whether you're a student or a working professional, find
                  workshops, seminars, hackathons, and meetups that match your
                  interests — all in one place!
                </p>
              </div>
              <div
                className="card"
                style={{ backgroundColor: "#e3f2fd", color: "#1e3a8a" }}
              >
                <h3>
                  <span style={{ color: "#F97316", fontWeight: "bold" }}>
                    One-Tap
                  </span>{" "}
                  Event Access
                </h3>
                <p>
                  Sign up for events in one tap and start building connections
                  instantly. Engage with organizers, attendees, and speakers
                  from your academic or corporate community. Stay updated with
                  announcements and event news!
                </p>
              </div>
              <div
                className="card"
                style={{ backgroundColor: "#e3f2fd", color: "#1e3a8a" }}
              >
                <h3>
                  {" "}
                  Experience{" "}
                  <span style={{ color: "#F97316", fontWeight: "bold" }}>
                    Engage
                  </span>{" "}
                  Evolve
                </h3>

                <p>
                  Attend events seamlessly, participate in live discussions, and
                  provide valuable feedback after the session. Help shape future
                  events while discovering exciting new experiences within your
                  network!
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="download-app" className="download-app-section">
          <div className="container">
            <h2 className="section-title">Download App</h2>
            <p className="section-description">
              Experience Tikties on the go! Download our mobile app to stay
              connected with events, manage registrations, and engage with your
              community anytime, anywhere.
            </p>
            <div className="cards-container">
              <div className="app-card">
                <img
                  src={appScreenshot1}
                  alt="App Screenshot 1"
                  className="app-screenshot"
                  width="280"
                  height="500"
                />
                <p>Event Discovery</p>
              </div>

              <div className="app-card">
                <img
                  src={appScreenshot2}
                  alt="App Screenshot 2"
                  className="app-screenshot"
                  width="280"
                  height="500"
                />
                <p>Event Details </p>
              </div>

              <div className="app-card">
                <img
                  src={appScreenshot3}
                  alt="App Screenshot 3"
                  className="app-screenshot"
                  width="280"
                  height="500"
                />
                <p>Ticket (QR Code)</p>
              </div>
            </div>

            <div className="cards-container">
              <div className="app-card">
                <img
                  src={appScreenshot4}
                  alt="App Screenshot 4"
                  className="app-screenshot"
                  width="280"
                  height="500"
                />
                <p>Download / Share Ticket and Events</p>
              </div>

              <div className="app-card">
                <img
                  src={appScreenshot5}
                  alt="App Screenshot 5"
                  className="app-screenshot"
                  width="280"
                  height="500"
                />
                <p>Review and Feedback </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-us" className="business-listing-section">
          <div className="container">
            <h2 className="section-title">
              Want to Host Your Event on Tikties?
            </h2>
            <p className="section-description">
              Reach the right audience by listing your event on Tikties. Engage
              attendees, manage registrations, and promote your event
              effortlessly.
            </p>
            <p className="section-description">
              As part of our launch, we’re offering a **Free Plan** for event
              hosting with certain limits. Take advantage of this limited-time
              offer to showcase your event to a wide audience at no cost!
            </p>
            <div className="contact-info">
              <p>
                <FontAwesomeIcon icon={faMobile} /> Mobile: +91-9860719197
              </p>
              <p>
                <FontAwesomeIcon icon={faEnvelope} /> Email:support@tikties.com
              </p>
            </div>
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
