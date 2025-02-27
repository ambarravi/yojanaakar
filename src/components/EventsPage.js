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
  faInfoCircle,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";

// Import images explicitly from src/assets/images/
import heroImage from "../assets/images/Tikto_BG_web_5.png";
import event1Image from "../assets/images/event1.jpg";
import event2Image from "../assets/images/event2.jpg";
import event3Image from "../assets/images/event3.jpg";
import event4Image from "../assets/images/event4.jpg";
import event5Image from "../assets/images/event5.jpg";

const events = [
  {
    id: 1,
    title: "Tech Innovators Conference 2024",
    description:
      "Explore the latest trends in technology with leading innovators and entrepreneurs.",
    city: "New York",
    date: "Sat 16 - Sun 17",
    image: event1Image,
    address: "123 Innovation St, Manhattan, NY 10001",
  },
  {
    id: 2,
    title: "LA Food & Wine Festival",
    description:
      "A culinary celebration featuring top chefs, exquisite wines, and live music.",
    city: "Los Angeles",
    date: "Sun 18 - Mon 19",
    image: event2Image,
    address: "456 Gourmet Ave, Los Angeles, CA 90012",
  },
  {
    id: 3,
    title: "Chicago Marathon 2024",
    description:
      "Join thousands of runners in one of the world’s most scenic marathon routes.",
    city: "Chicago",
    date: "Mon 20 - Tue 21",
    image: event3Image,
    address: "789 Runner Blvd, Chicago, IL 60604",
  },
  {
    id: 4,
    title: "Houston Space Expo",
    description:
      "Discover the future of space exploration with NASA experts and interactive exhibits.",
    city: "Houston",
    date: "Tue 22 - Wed 23",
    image: event4Image,
    address: "101 Cosmic Drive, Houston, TX 77058",
  },
  {
    id: 5,
    title: "New York Jazz Festival",
    description:
      "Celebrate the best of jazz with performances by world-renowned artists.",
    city: "New York",
    date: "Wed 24 - Thu 25",
    image: event5Image,
    address: "202 Melody Park, Brooklyn, NY 11201",
  },
];

function EventsPage() {
  const navigate = useNavigate();

  const handleOrganizerSignIn = () => {
    sessionStorage.setItem("tempRole", "organizer");
    localStorage.setItem("local_tempRole", "organizer");
    navigate("/organizer-landing");
  };

  return (
    <div className="events-page">
      <header className="events-header">
        <div className="container">
          <View className="header-content">
            <Heading level={1} className="logo">
              tikto
            </Heading>
            <nav className="nav-links">
              <Link to="/#" className="custom-link">
                <FontAwesomeIcon icon={faDownload} /> Download App
              </Link>
              <Link
                to="/organizer-landing"
                onClick={handleOrganizerSignIn}
                className="custom-link"
              >
                <FontAwesomeIcon icon={faUserTie} /> Organizer Sign In
              </Link>
              <Link to="/#" className="custom-link">
                <FontAwesomeIcon icon={faEnvelope} /> Contact Us
              </Link>
              <Link to="/#" className="custom-link">
                <FontAwesomeIcon icon={faInfoCircle} /> About Us
              </Link>
              <Link to="/#" className="custom-link">
                <FontAwesomeIcon icon={faCrown} /> Subscription
              </Link>
            </nav>
          </View>
        </div>
      </header>

      <main className="container">
        <section className="hero-section">
          <img src={heroImage} alt="Event Hero" className="hero-image" />
        </section>

        <section className="events-content">
          <h2 className="section-title">Ongoing Events</h2>
          <div className="event-box-container">
            {events.map((event) => (
              <Link
                to={`/event/${event.id}`}
                key={event.id}
                className="event-box"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="event-image"
                />
                <div className="event-details">
                  <p className="event-date">{event.date}</p>
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-location">
                    {event.address}, {event.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="footer-text">© 2025 tikto. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default EventsPage;
