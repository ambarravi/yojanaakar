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
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { fetchEventDetailsByOrgID, updateEventStatus } from "../api/eventApi";

function ManageEvents({ user, signOut }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const eventsPerPage = 5;
  const isMobile = window.innerWidth <= 767;

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

  const handleViewBookingDetails = (eventId) => {
    navigate(`/showBookingDetails/${eventId}`);
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
    <div
      className="manage-events-page"
      style={{ maxWidth: "100%", overflowX: "hidden" }}
    >
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <button className="sidebar-toggle md:hidden" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`events-content ${isSidebarOpen ? "sidebar-open" : ""}`}
        style={{
          maxWidth: "100%",
          padding: isMobile ? "0.5rem" : "0.75rem",
          paddingTop: isMobile ? "2.5rem" : "0.75rem",
        }}
      >
        <h2 className="events-title">Manage Events</h2>

        <div
          className="event-details"
          style={{ padding: isMobile ? "0.5rem" : "0.75rem" }}
        >
          <h3 className="booking-subtitle">Event List</h3>
          <div
            className="table-wrapper"
            style={{ maxWidth: "100%", overflowX: "auto" }}
          >
            <table
              className="events-table"
              style={{
                width: "100%",
                maxWidth: "100%",
                fontSize: isMobile ? "0.65rem" : "0.875rem",
              }}
            >
              <thead>
                <tr>
                  <th
                    scope="col"
                    onClick={() => handleSort("id")}
                    style={{
                      width: isMobile ? "8%" : "5%",
                      padding: isMobile ? "0.3rem" : "0.75rem",
                    }}
                  >
                    Sr.No.
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("ReadableEventID")}
                    style={{
                      width: isMobile ? "12%" : "10%",
                      padding: isMobile ? "0.3rem" : "0.75rem",
                    }}
                  >
                    Event ID
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("EventTitle")}
                    style={{
                      width: isMobile ? "25%" : "20%",
                      padding: isMobile ? "0.3rem" : "0.75rem",
                    }}
                  >
                    Event Name
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("EventDate")}
                    style={{
                      width: isMobile ? "20%" : "15%",
                      padding: isMobile ? "0.3rem" : "0.75rem",
                      maxWidth: isMobile ? "auto" : "150px",
                    }}
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("EventStatus")}
                    style={{
                      width: isMobile ? "15%" : "10%",
                      padding: isMobile ? "0.3rem" : "0.75rem",
                    }}
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("Seats")}
                    style={{
                      width: isMobile ? "0%" : "10%",
                      padding: isMobile ? "0.3rem" : "0.75rem",
                      display: isMobile ? "none" : "table-cell",
                    }}
                  >
                    Seats
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("TicketsBooked")}
                    style={{
                      width: isMobile ? "0%" : "10%",
                      padding: isMobile ? "0.3rem" : "0.75rem",
                      display: isMobile ? "none" : "table-cell",
                    }}
                  >
                    Tickets Booked
                  </th>
                  <th
                    scope="col"
                    style={{
                      width: isMobile ? "20%" : "20%",
                      padding: isMobile ? "0.3rem" : "0.75rem",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEvents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: isMobile ? "0.5rem" : "0.75rem",
                      }}
                    >
                      No events found.
                    </td>
                  </tr>
                ) : (
                  currentEvents.map((event, index) => (
                    <tr key={event.id}>
                      <td style={{ padding: isMobile ? "0.3rem" : "0.75rem" }}>
                        {(currentPage - 1) * eventsPerPage + index + 1}
                      </td>
                      <td style={{ padding: isMobile ? "0.3rem" : "0.75rem" }}>
                        {event.ReadableEventID}
                      </td>
                      <td style={{ padding: isMobile ? "0.3rem" : "0.75rem" }}>
                        {event.EventTitle}
                      </td>
                      <td style={{ padding: isMobile ? "0.3rem" : "0.75rem" }}>
                        {formatDateTime(event.EventDate)}
                      </td>
                      <td style={{ padding: isMobile ? "0.3rem" : "0.75rem" }}>
                        {event.EventStatus}
                      </td>
                      <td
                        style={{
                          padding: isMobile ? "0.3rem" : "0.75rem",
                          display: isMobile ? "none" : "table-cell",
                        }}
                      >
                        {event.Seats}
                      </td>
                      <td
                        style={{
                          padding: isMobile ? "0.3rem" : "0.75rem",
                          display: isMobile ? "none" : "table-cell",
                        }}
                      >
                        {event.TicketsBooked}
                      </td>
                      <td
                        className="action-buttons"
                        style={{
                          display: "flex",
                          gap: "0.2rem !important",
                          justifyContent: "center",
                          flexWrap: "nowrap !important",
                          minWidth: "auto !important",
                          overflow: "visible !important",
                          padding: isMobile ? "0.3rem" : "0.75rem",
                        }}
                      >
                        <button
                          className="action-btn view-btn"
                          title="View Booking Details"
                          onClick={() =>
                            handleViewBookingDetails(event.EventID)
                          }
                          aria-label="View booking details"
                          style={{
                            width: isMobile ? "0.9rem" : "1rem",
                            height: isMobile ? "0.9rem" : "1rem",
                            padding: "0",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faEye}
                            style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                          />
                        </button>
                        <button
                          className="action-btn publish-btn"
                          title="Publish Event"
                          onClick={() =>
                            handleActionButtonClick(event, "Publish")
                          }
                          aria-label="Publish event"
                          style={{
                            width: isMobile ? "0.9rem" : "1rem",
                            height: isMobile ? "0.9rem" : "1rem",
                            padding: "0",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                          />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          title="Edit Event Details"
                          onClick={() => handleActionButtonClick(event, "Edit")}
                          aria-label="Edit event"
                          style={{
                            width: isMobile ? "0.9rem" : "1rem",
                            height: isMobile ? "0.9rem" : "1rem",
                            padding: "0",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faEdit}
                            style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                          />
                        </button>
                        <button
                          className="action-btn cancel-btn"
                          title="Cancel Event"
                          onClick={() =>
                            handleActionButtonClick(event, "Cancel")
                          }
                          aria-label="Cancel event"
                          style={{
                            width: isMobile ? "0.9rem" : "1rem",
                            height: isMobile ? "0.9rem" : "1rem",
                            padding: "0",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faStopCircle}
                            style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                          />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Delete Event"
                          onClick={() =>
                            handleActionButtonClick(event, "Delete")
                          }
                          aria-label="Delete event"
                          style={{
                            width: isMobile ? "0.9rem" : "1rem",
                            height: isMobile ? "0.9rem" : "1rem",
                            padding: "0",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className="footer-buttons"
          style={{
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "0.5rem" : "0.75rem",
          }}
        >
          <button
            className="footer-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            style={{
              fontSize: isMobile ? "0.65rem" : "0.875rem",
              padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Previous
          </button>
          <span
            className="pagination-info"
            style={{ fontSize: isMobile ? "0.65rem" : "0.875rem" }}
          >
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="footer-btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            aria-label="Next page"
            style={{
              fontSize: isMobile ? "0.65rem" : "0.875rem",
              padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
            }}
          >
            Next <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default ManageEvents;
