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
  faStopCircle,
} from "@fortawesome/free-solid-svg-icons";
import { fetchEventDetailsByOrgID, updateEventStatus } from "../api/eventApi";

function ManageEvents({ user, signOut }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Changed to isSidebarOpen
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const eventsPerPage = 5;

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const result = await fetchEventDetailsByOrgID();
      setEvents(result.items);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const validateEventAction = (status, action) => {
    const allowedActions = {
      AwaitingApproval: ["Edit", "Delete", "UnderReview"],
      UnderReview: ["Edit", "Delete", "Approve"],
      Approved: ["Publish", "Delete", "Edit"],
      Published: ["Edit"],
      Cancelled: ["Edit"],
    };
    if (!allowedActions[status]?.includes(action)) {
      alert(`Action ${action} is not allowed in status: ${status}`);
      return false;
    }
    if (action === "Edit") {
      if (status === "Approved") {
        alert("Event is Approved. Edits will require re-approval.");
        return true;
      } else if (status === "Published" || status === "Cancelled") {
        alert(`Event is ${status}. You can only view details.`);
        return true;
      }
    }
    return true;
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const handleActionButtonClick = async (event, action) => {
    if (!validateEventAction(event.EventStatus, action)) return;
    const userConfirmed = window.confirm(
      `Are you sure you want to ${action} this event?`
    );
    if (!userConfirmed) return;

    let newStatus;
    switch (action) {
      case "Edit":
        sessionStorage.setItem("fromSidebar", false);
        navigate(`/host-event`, { state: { eventId: event.EventID } });
        return;
      case "Delete":
        newStatus = "Deleted";
        break;
      case "Publish":
        newStatus = "Published";
        break;
      case "Cancel":
        newStatus = "Cancelled";
        break;
      default:
        console.log("Unknown action");
        return;
    }
    setIsLoading(true);
    try {
      const response = await updateEventStatus(event.EventID, newStatus);
      if (response.statusCode === 200) {
        alert(`Event status updated to: ${newStatus}`);
        fetchEvents();
      } else {
        alert("Failed to update event status.");
      }
    } catch (error) {
      console.error("Error updating event status:", error);
      alert("Error updating event status.");
    } finally {
      setIsLoading(false);
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    return a[sortConfig.key] > b[sortConfig.key] ? direction : -direction;
  });

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  return (
    <div className="manage-events-page">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main className={`events-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <h1 className="events-title">Manage Events</h1>
        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("id")}>SrNo</th>
                <th onClick={() => handleSort("ReadableEventID")}>Event ID</th>
                <th onClick={() => handleSort("EventTitle")}>Event Name</th>
                <th onClick={() => handleSort("EventDate")}>Date & Time</th>
                <th onClick={() => handleSort("EventStatus")}>Status</th>
                <th onClick={() => handleSort("Seats")}>Seats</th>
                <th onClick={() => handleSort("TicketsBooked")}>
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
                  <td>{formatDateTime(event.EventDate)}</td>
                  <td>{event.EventStatus}</td>
                  <td>{event.Seats}</td>
                  <td>{event.TicketsBooked}</td>
                  <td className="action-buttons">
                    <button
                      className="action-btn publish-btn"
                      title="Publish Event"
                      onClick={() => handleActionButtonClick(event, "Publish")}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                    <button
                      className="action-btn edit-btn"
                      title="Edit Event Details"
                      onClick={() => handleActionButtonClick(event, "Edit")}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="action-btn cancel-btn"
                      title="Cancel Event"
                      onClick={() => handleActionButtonClick(event, "Cancel")}
                    >
                      <FontAwesomeIcon icon={faStopCircle} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      title="Delete Event"
                      onClick={() => handleActionButtonClick(event, "Delete")}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default ManageEvents;
