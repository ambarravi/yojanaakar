import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/ManageEvent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faArrowLeft,
  faArrowRight,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons"; // Import icons
import { fetchEventDetailsByOrgID } from "../api/eventApi";

function ManageEvents({ user, signOut }) {
  const navigate = useNavigate(); // Initialize navigate for routing
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState([]);

  const eventsPerPage = 5;

  // Fetch event details on page load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result = await fetchEventDetailsByOrgID();
        console.log(result.items);
        setEvents(result.items); // Assuming `result` aligns with the `events` object structure
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleEditEvent = (eventId) => {
    navigate(`/host-event`, { state: { eventId } }); // Pass eventId via state
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (sortConfig.direction === "asc") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    } else {
      return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
    }
  });

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.ceil(events.length / eventsPerPage);

  return (
    <div className="organizer-profile-page">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar
        user={user}
        signOut={signOut}
        className={isSidebarCollapsed ? "collapsed" : ""}
      />
      <div
        className={`organizer-profile-container ${
          isSidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <h1 className="org-page-title">Manage Events</h1>
        <table className="events-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("id")}>SrNo</th>
              <th onClick={() => handleSort("eventId")}>Event ID</th>
              <th onClick={() => handleSort("name")}>Event Name</th>
              <th onClick={() => handleSort("dateTime")}>DateTime</th>
              <th onClick={() => handleSort("status")}>Status</th>
              <th onClick={() => handleSort("status")}>Seats</th>
              <th
                style={{ width: "5%", textAlign: "center", cursor: "pointer" }}
                onClick={() => handleSort("ticketsBooked")}
              >
                Tickets Booked
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEvents.map((event, index) => (
              <tr key={event.id}>
                <td>{(currentPage - 1) * eventsPerPage + index + 1}</td>
                <td>{event.ReadableEventID}</td>
                <td>{event.EventTitle}</td>
                <td>{event.EventDate}</td>
                <td>{event.Status}</td>
                <td>{event.Seats}</td>
                <td>{event.TicketsBooked}</td>
                <td>
                  <button className="btn publish-btn" title="Publish Event">
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                  <button
                    className="btn edit-btn"
                    title="Edit Event Details"
                    onClick={() => handleEditEvent(event.EventID)} // Pass Event ID
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="btn delete-btn" title="Delete Event">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button
            className="btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              color: currentPage === 1 ? "gray" : "#1565C0",
              fontSize: "18px",
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> {/* Previous icon */}
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              color: currentPage === totalPages ? "gray" : "#1565C0",
              fontSize: "18px",
            }}
          >
            <FontAwesomeIcon icon={faArrowRight} /> {/* Next icon */}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageEvents;
