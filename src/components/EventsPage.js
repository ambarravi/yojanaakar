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
  faMobile,
} from "@fortawesome/free-solid-svg-icons";

// Import images explicitly from src/assets/images/
import heroImage from "../assets/images/Tikto_BG_web_5.png";
// Import app screenshot images
import appScreenshot1 from "../assets/images/event1.jpg";
import appScreenshot2 from "../assets/images/event2.jpg";
import appScreenshot3 from "../assets/images/event3.jpg";

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
              <a href="#download-app" className="nav-link">
                <FontAwesomeIcon icon={faDownload} /> Download App
              </a>
              <a href="#how-it-works" className="nav-link">
                <FontAwesomeIcon icon={faUserTie} /> How It Works
              </a>
              <a href="#contact-us" className="nav-link">
                <FontAwesomeIcon icon={faEnvelope} /> Contact Us
              </a>
              <Link
                to="/organizer-landing"
                onClick={handleOrganizerSignIn}
                className="nav-link"
              >
                <FontAwesomeIcon icon={faCrown} /> Organizer Sign In
              </Link>
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
                <h3>Personalized Event Discovery</h3>
                <p>
                  Install the Tikties mobile app to find events tailored to your
                  profile. Whether you're a student or a professional, Tikties
                  connects you with affiliated college or organization events
                  that match your interests. Explore workshops, hackathons,
                  meetups, and more—all in one place!
                </p>
              </div>
              <div className="card">
                <h3>Register & Connect</h3>
                <p>
                  Sign up for events in just one tap and connect with attendees,
                  organizers, and speakers from your college or professional
                  network. Stay informed with event updates and exclusive
                  community interactions.
                </p>
              </div>
              <div className="card">
                <h3>Attend, Engage & Share Feedback</h3>
                <p>
                  Seamlessly check in, participate in discussions, and receive
                  real-time event updates. After attending, share your reviews
                  and feedback to improve future events and help others discover
                  great experiences.
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
              <div className="card">
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
              </div>
              <div className="card">
                <div className="app-card">
                  <img
                    src={appScreenshot2}
                    alt="App Screenshot 2"
                    className="app-screenshot"
                    width="280"
                    height="500"
                  />
                  <p>Registration & Networking</p>
                </div>
              </div>
              <div className="card">
                <div className="app-card">
                  <img
                    src={appScreenshot3}
                    alt="App Screenshot 3"
                    className="app-screenshot"
                    width="280"
                    height="500"
                  />
                  <p>Review & Feedback</p>
                </div>
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
