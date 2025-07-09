import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/ManageEvent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPrint,
  faIdBadge,
  faCalendarAlt,
  faChair,
  faTicketAlt,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { fetchBookingDetailsEventID } from "../api/eventApi";

function BookingDetails({ user, signOut }) {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMobile = window.innerWidth <= 767;

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("eventID from UI", eventId);
        const response = await fetchBookingDetailsEventID(eventId);
        console.log("Response from Booking", response);
        if (!response.records || response.records.length === 0) {
          throw new Error("Failed to fetch booking details");
        }
        console.log("Response from Booking", response.records);
        const data = response;
        setBookings(data.records || []);
        console.log(data.records[0]?.EventDetails);
        setEventDetails(data.records[0]?.EventDetails || null);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Unable to load booking details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [eventId]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
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

  const handleBack = () => {
    navigate(-1);
  };

  const handlePrint = () => {
    window.print();
  };

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
      <button className="sidebar-toggle" onClick={toggleSidebar}>
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
        <h2 className="events-title">Booking Details</h2>

        {error && (
          <div
            style={{
              color: "red",
              textAlign: "center",
              marginBottom: "1rem",
              fontSize: isMobile ? "0.75rem" : "1rem",
            }}
          >
            {error}
          </div>
        )}

        <div
          className="event-details"
          style={{ padding: isMobile ? "0.5rem" : "0.75rem" }}
        >
          <h3 className="booking-subtitle">Event Details</h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "0.5rem",
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                flex: isMobile ? "1 1 100px" : "1 1 200px",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              }}
            >
              <strong>
                <FontAwesomeIcon icon={faIdBadge} /> Event ID:
              </strong>
              <p>{eventDetails?.ReadableEventID || "N/A"}</p>
            </div>
            <div
              style={{
                flex: isMobile ? "1 1 100px" : "1 1 200px",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              }}
            >
              <strong>
                <FontAwesomeIcon icon={faCalendarAlt} /> Event Name:
              </strong>
              <p>{eventDetails?.EventTitle || "N/A"}</p>
            </div>
            <div
              style={{
                flex: isMobile ? "1 1 100px" : "1 1 200px",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              }}
            >
              <strong>
                <FontAwesomeIcon icon={faCalendarAlt} /> Event Date & Time:
              </strong>
              <p>{formatDateTime(eventDetails?.EventDate)}</p>
            </div>
          </div>
        </div>

        <h3 className="booking-subtitle">Booking Statistics</h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "0.5rem",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              flex: isMobile ? "1 1 100px" : "1 1 150px",
              background: "#ffffff",
              padding: isMobile ? "0.5rem" : "1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              fontSize: isMobile ? "0.75rem" : "0.875rem",
            }}
          >
            <FontAwesomeIcon icon={faChair} size="lg" color="#374151" />
            <p>
              <strong>{eventDetails?.Seats || 0}</strong>
            </p>
            <p>Total Seats</p>
          </div>
          <div
            style={{
              flex: isMobile ? "1 1 100px" : "1 1 150px",
              background: "#ffffff",
              padding: isMobile ? "0.5rem" : "1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              fontSize: isMobile ? "0.75rem" : "0.875rem",
            }}
          >
            <FontAwesomeIcon icon={faTicketAlt} size="lg" color="#374151" />
            <p>
              <strong>{eventDetails?.ReservedSeats || 0}</strong>
            </p>
            <p>Seats Reserved</p>
          </div>
          <div
            style={{
              flex: isMobile ? "1 1 100px" : "1 1 150px",
              background: "#ffffff",
              padding: isMobile ? "0.5rem" : "1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              fontSize: isMobile ? "0.75rem" : "0.875rem",
            }}
          >
            <FontAwesomeIcon icon={faUsers} size="lg" color="#374151" />
            <p>
              <strong>{eventDetails?.SeatsBooked || 0}</strong>
            </p>
            <p>Total Bookings</p>
          </div>
        </div>

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
                  style={{
                    width: isMobile ? "8%" : "10%",
                    padding: isMobile ? "0.3rem" : "0.75rem",
                  }}
                >
                  Sr.No.
                </th>
                <th
                  scope="col"
                  style={{
                    width: isMobile ? "25%" : "25%",
                    padding: isMobile ? "0.3rem" : "0.75rem",
                  }}
                >
                  Booking Name
                </th>
                <th
                  scope="col"
                  style={{
                    width: isMobile ? "12%" : "15%",
                    padding: isMobile ? "0.3rem" : "0.75rem",
                  }}
                >
                  Tickets Booked
                </th>
                <th
                  scope="col"
                  style={{
                    width: isMobile ? "25%" : "25%",
                    padding: isMobile ? "0.3rem" : "0.75rem",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  Email
                </th>
                <th
                  scope="col"
                  style={{
                    width: isMobile ? "25%" : "25%",
                    padding: isMobile ? "0.3rem" : "0.75rem",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: isMobile ? "1rem" : "2rem",
                    }}
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking, index) => (
                  <tr key={booking.BookingID}>
                    <td style={{ padding: isMobile ? "0.3rem" : "0.75rem" }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: isMobile ? "0.3rem" : "0.75rem" }}>
                      {booking.BookingName || "N/A"}
                    </td>
                    <td style={{ padding: isMobile ? "0.3rem" : "0.75rem" }}>
                      {booking.SeatsBooked || 0}
                    </td>
                    <td
                      style={{
                        padding: isMobile ? "0.3rem" : "0.75rem",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {booking.BookingEmail || "N/A"}
                    </td>
                    <td
                      style={{
                        padding: isMobile ? "0.3rem" : "0.75rem",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {booking.BookingContact || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
            onClick={handleBack}
            aria-label="Go back to previous page"
            style={{
              fontSize: isMobile ? "0.65rem" : "0.875rem",
              padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          <button
            className="footer-btn"
            onClick={handlePrint}
            aria-label="Print booking details"
            style={{
              fontSize: isMobile ? "0.65rem" : "0.875rem",
              padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
            }}
          >
            <FontAwesomeIcon icon={faPrint} /> Print
          </button>
        </div>
      </main>
    </div>
  );
}

export default BookingDetails;
