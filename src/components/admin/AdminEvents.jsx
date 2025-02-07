import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./AdminSidebar";
import "./styles/AdminManageEvent.css";
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
} from "@fortawesome/free-solid-svg-icons"; // Import icons
import { fetchAllEventDetails } from "../../api/adminApi";
import { updateEventStatus } from "../../api/eventApi";

function AdminEvents({ user, signOut }) {
  const navigate = useNavigate(); // Initialize navigate for routing
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const eventsPerPage = 5;

  // Fetch event details on page load
  useEffect(() => {
    let role = sessionStorage.getItem("userRole");
    if (role) {
      console.log(`User role is: ${role}`);
    } else {
      role = fetchUser();
      sessionStorage.setItem("userRole", role);
    }

    fetchEvents();
  }, []);

  const fetchUser = async () => {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;

    if (!idToken) {
      console.error("ID token not found");
      return;
    }

    let userRole = idToken.payload["custom:role"];
    return userRole;
  };

  const fetchEvents = async () => {
    try {
      const result = await fetchAllEventDetails();
      //  let result = { items: [] };

      console.log(result.items);
      setEvents(result.items); // Assuming `result` aligns with the `events` object structure
      setIsLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false); // Set loading to false once data is fetched
    }
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // const handleEditEvent = (eventId) => {
  //   navigate(`/admin-event-details`, { state: { eventId } }); // Pass eventId via state
  // };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);

    return new Intl.DateTimeFormat("en-US", {
      weekday: "long", // Thursday
      year: "numeric", // 2025
      month: "short", // Feb
      day: "numeric", // 6
      hour: "2-digit", // 10
      minute: "2-digit", // 04
      hour12: true, // AM/PM format
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
    const isValidAction = validateEventAction(event.EventStatus, action);

    if (!isValidAction) return; // If validation fails, do not proceed

    // Ask for user confirmation
    const userConfirmed = window.confirm(
      `Are you sure you want to ${action} this event?`
    );
    if (!userConfirmed) return; // If user cancels, do nothing

    let newStatus;

    // Determine the new status based on the action
    switch (action) {
      case "Edit":
        // Edit doesn't change status, so just navigate to the event edit page
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
    setIsLoading(true); // Show loading overlay
    // Now, send EventID and newStatus to the backend API
    try {
      const response = await updateEventStatus(event.EventID, newStatus);
      console.log(response);
      if (response.statusCode === 200) {
        alert(`Event status updated to: ${newStatus}`);
        // You can optionally refresh the event list or navigate elsewhere
        fetchEvents();
      } else {
        alert("Failed to update event status.");
      }
    } catch (error) {
      console.error("Error updating event status:", error);
      alert("There was an error updating the event status.");
    } finally {
      setIsLoading(false); // Hide loading overlay after API call
    }
  };

  const validateEventAction = (status, action) => {
    const role = sessionStorage.getItem("userRole"); // Get role here
    const allowedActions = {
      AwaitingApproval: ["Edit", "Delete", "UnderReview", "Approve"],
      UnderReview: ["Edit", "Delete", "Approve"],
      Approved: ["Publish", "Delete", "Edit"],
      Published: ["Edit"], // Default case for non-admin users
      Cancelled: ["Edit"],
    };

    // If the user is an Admin, allow event cancellation after Publish
    if (role === "Admin") {
      allowedActions.Published.push("Cancel");
    }

    // Check if the action is allowed for the current status
    if (!allowedActions[status]?.includes(action)) {
      alert(
        `Action ${action} is not allowed in the current event status: ${status}`
      );
      return false; // If action is not allowed
    }

    // Specific checks for Edit action based on status
    if (action === "Edit") {
      if (status === "Approved") {
        alert(
          "Event is Approved. Further edits will require re-approval from Admin."
        );
        return false;
      } else if (status === "Published") {
        alert("Event is Published. You can only view event details.");
        return false;
      } else if (status === "Cancelled") {
        alert("Event is Cancelled. You can only view event details.");
        return false;
      }
    }

    return true; // Action is allowed
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
      {isLoading && <div className="loading-overlay">Loading...</div>}
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
        <h1 className="admin-page-title">Admin Manage Events</h1>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="loading-indicator">
            <p>Loading events...</p>
            {/* You can replace this with a spinner or any other visual indicator */}
          </div>
        ) : (
          <table className="events-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("id")}>SrNo</th>
                <th onClick={() => handleSort("eventId")}>Event ID</th>
                <th onClick={() => handleSort("name")}>Event Name</th>
                <th onClick={() => handleSort("dateTime")}>DateTime</th>
                <th onClick={() => handleSort("status")}>Status</th>
                <th onClick={() => handleSort("seats")}>Seats</th>
                <th
                  style={{
                    width: "5%",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("ticketsBooked")}
                >
                  Tickets Booked
                </th>
                <th
                  style={{
                    width: "30%",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.map((event, index) => (
                <tr key={event.id}>
                  <td>{(currentPage - 1) * eventsPerPage + index + 1}</td>
                  <td>{event.ReadableEventID}</td>
                  <td>{event.EventTitle}</td>
                  <td>{formatDateTime(event.EventDate)}</td>
                  <td>{event.Status}</td>
                  <td>{event.Seats}</td>
                  <td>{event.TicketsBooked}</td>
                  <td>
                    <button
                      className="manage-btn publish-btn"
                      title="Approve  Event"
                      onClick={() => handleActionButtonClick(event, "Approve")}
                    >
                      <FontAwesomeIcon icon={faThumbsUp} />
                    </button>
                    <button
                      className="manage-btn reject-btn"
                      title="Reject  Event"
                      onClick={() => handleActionButtonClick(event, "Reject")}
                    >
                      <FontAwesomeIcon icon={faThumbsDown} />
                    </button>

                    <button
                      className="manage-btn edit-btn"
                      title="Edit Event Details"
                      onClick={() => handleActionButtonClick(event, "Edit")}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                    <button
                      className="manage-btn cancel-btn"
                      title="Cancel Event"
                      onClick={() => handleActionButtonClick(event, "Cancel")}
                    >
                      <FontAwesomeIcon icon={faStopCircle} />
                    </button>
                    <button
                      className="manage-btn delete-btn"
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
        )}
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

export default AdminEvents;
