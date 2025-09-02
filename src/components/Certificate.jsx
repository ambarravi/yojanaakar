import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "../styles/Certificate.css";
import { fetchEventDetailsByOrgID } from "../api/eventApi";

function Certificate({ user, signOut }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEventID, setSelectedEventID] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch events from API
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const result = await fetchEventDetailsByOrgID();
      console.log("API Response:", result.items); // Debug API data
      // Filter events for Published status and today/tomorrow
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const filteredEvents = result.items.filter((event) => {
        const eventDate = new Date(event.EventDate);
        return (
          event.EventStatus === "Published" &&
          (eventDate.toDateString() === today.toDateString() ||
            eventDate.toDateString() === tomorrow.toDateString())
        );
      });

      console.log("filteredEvents", filteredEvents);
      setEvents(filteredEvents);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Unable to load events. Please try again later.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventChange = (e) => {
    setSelectedEventID(e.target.value);
  };

  return (
    <div className="scanner-page">
      <button
        className="sidebar-toggle md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle Sidebar"
      >
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`scanner-content ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        <h2 className="scanner-title">Issue Certificate</h2>
        {error && <p className="error-message">{error}</p>}
        {isLoading && <p>Loading events...</p>}
        <div className="scanner-event-details">
          <label htmlFor="event-select" className="scanner-event-label">
            Select Event:
          </label>
          <select
            id="event-select"
            value={selectedEventID}
            onChange={handleEventChange}
            className="scanner-event-select"
            aria-label="Select Event"
            disabled={isLoading}
          >
            <option value="">-- Select an event --</option>
            {events.map((event) => (
              <option key={event.EventID} value={event.EventID}>
                {event.EventTitle}
              </option>
            ))}
          </select>
        </div>
      </main>
    </div>
  );
}

export default Certificate;
