import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./AdminSidebar";
import "../../styles/ManageEvent.css"; // Updated to use ManageEvent.css ManageEvent.css
import { fetchAuthSession } from "@aws-amplify/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faArrowLeft,
  faArrowRight,
  faStopCircle,
  faInfoCircle,
  faThumbsUp,
  faThumbsDown,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { fetchAllEventDetails } from "../../api/adminApi";
import { updateEventStatus } from "../../api/eventApi";

function AdminEvents({ user, signOut }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const eventsPerPage = 5;

  useEffect(() => {
    let role = sessionStorage.getItem("userRole");
    if (!role) {
      fetchUser().then((fetchedRole) => {
        role = fetchedRole;
        sessionStorage.setItem("userRole", role);
      });
    }
    fetchEvents();
  }, []);

  const fetchUser = async () => {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    if (!idToken) {
      console.error("ID token not found");
      return null;
    }
    return idToken.payload["custom:role"];
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAllEventDetails();
      setEvents(result.items);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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
        navigate(`/admin-event-details`, { state: { eventId: event.EventID } });
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
      case "Approve":
        newStatus = "Approved";
        break;
      case "Reject":
        newStatus = "UnderReview";
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

  const handleViewBookingDetails = (eventId) => {
    navigate(`/showAdminBookingDetails/${eventId}`);
  };

  const validateEventAction = (status, action) => {
    let effectiveAction = action;
    if (action === "Reject") {
      effectiveAction = "UnderReview";
    }
    const role = sessionStorage.getItem("userRole");
    const allowedActions = {
      AwaitingApproval: ["Edit", "Delete", "UnderReview", "Approve"],
      UnderReview: ["Edit", "Delete", "Approve"],
      Approved: ["Publish", "Delete", "Edit"],
      Published: ["Edit"],
      Cancelled: ["Edit"],
    };
    if (role === "Admin") {
      allowedActions.Published.push("Cancel");
    }
    if (!allowedActions[status]?.includes(effectiveAction)) {
      alert(`Action ${action} is not allowed in status: ${status}`);
      return false;
    }
    if (action === "Edit") {
      if (status === "Approved") {
        alert("Event is Approved. Edits require re-approval.");
        return true;
      } else if (status === "Published" || status === "Cancelled") {
        alert(`Event is ${status}. You can only view details.`);
        return true;
      }
    }
    return true;
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
    <div className="admin-events-page">
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
        <h2 className="events-title">Admin Manage Events</h2>

        {/* Events Table Section */}
        <div className="event-details">
          <h3 className="booking-subtitle">Event List</h3>
          <div className="table-wrapper">
            <table className="events-table">
              <thead>
                <tr>
                  <th scope="col" onClick={() => handleSort("id")}>
                    Sr.No.
                  </th>
                  <th scope="col" onClick={() => handleSort("ReadableEventID")}>
                    Event ID
                  </th>
                  <th scope="col" onClick={() => handleSort("EventTitle")}>
                    Event Name
                  </th>
                  <th scope="col" onClick={() => handleSort("EventDate")}>
                    Date & Time
                  </th>
                  <th scope="col" onClick={() => handleSort("EventStatus")}>
                    Status
                  </th>
                  <th scope="col" onClick={() => handleSort("Seats")}>
                    Seats
                  </th>
                  <th scope="col" onClick={() => handleSort("TicketsBooked")}>
                    Tickets Booked
                  </th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEvents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No events found.
                    </td>
                  </tr>
                ) : (
                  currentEvents.map((event, index) => (
                    <tr key={event.id}>
                      <td>{(currentPage - 1) * eventsPerPage + index + 1}</td>
                      <td>{event.ReadableEventID}</td>
                      <td>{event.EventTitle}</td>
                      <td>{formatDateTime(event.EventDate)}</td>
                      <td>{event.Status}</td>
                      <td>{event.Seats}</td>
                      <td>{event.TicketsBooked}</td>
                      <td className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          title="View Booking Details"
                          onClick={() =>
                            handleViewBookingDetails(event.EventID)
                          }
                          aria-label="View booking details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="action-btn approve-btn"
                          title="Approve Event"
                          onClick={() =>
                            handleActionButtonClick(event, "Approve")
                          }
                          aria-label="Approve event"
                        >
                          <FontAwesomeIcon icon={faThumbsUp} />
                        </button>
                        <button
                          className="action-btn reject-btn"
                          title="Reject Event"
                          onClick={() =>
                            handleActionButtonClick(event, "Reject")
                          }
                          aria-label="Reject event"
                        >
                          <FontAwesomeIcon icon={faThumbsDown} />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          title="Edit Event Details"
                          onClick={() => handleActionButtonClick(event, "Edit")}
                          aria-label="Edit event"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                        <button
                          className="action-btn cancel-btn"
                          title="Cancel Event"
                          onClick={() =>
                            handleActionButtonClick(event, "Cancel")
                          }
                          aria-label="Cancel event"
                        >
                          <FontAwesomeIcon icon={faStopCircle} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Delete Event"
                          onClick={() =>
                            handleActionButtonClick(event, "Delete")
                          }
                          aria-label="Delete event"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="footer-buttons">
          <button
            className="footer-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="footer-btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdminEvents;
