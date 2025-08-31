import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./AdminSidebar";
import "../admin/styles/BookingDetails.css";
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
import { fetchBookingDetailsEventID } from "../../api/eventApi";

function BookingDetails({ user, signOut }) {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("eventID from UI", eventId);
        const response = await fetchBookingDetailsEventID(eventId);

        console.log("Response from Booking", response);
        if (!response.records || response.records.length === 0) {
          throw new Error("No booking details found");
        }

        const data = response;
        setBookings(data.records || []);
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
    <div className="Booking_details-page">
      {isLoading && (
        <div className={`Booking_loading-overlay ${isLoading ? "active" : ""}`}>
          <div className="Booking_spinner"></div>
        </div>
      )}
      <button className="Booking_sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`Booking_content ${
          isSidebarOpen ? "Booking_sidebar-open" : ""
        }`}
        style={{
          marginLeft: isSidebarOpen ? "260px" : "260px",
          width: isSidebarOpen ? "calc(100% - 260px)" : "calc(100% - 260px)",
          paddingLeft:
            isSidebarOpen && window.innerWidth <= 767 ? "0.75rem" : undefined,
        }}
      >
        <h2 className="Booking_title">Booking Details</h2>

        {/* Error Message */}
        {error && (
          <div
            style={{
              color: "#dc2626",
              textAlign: "center",
              marginBottom: "1rem",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {/* Event Details Section */}
        <div className="Booking_event-details">
          <h3 className="Booking_subtitle">Event Details</h3>
          <div className="Booking_event-details-grid">
            <p>
              <strong>
                <FontAwesomeIcon icon={faIdBadge} /> Event ID:
              </strong>
            </p>
            <p>{eventDetails?.ReadableEventID || "N/A"}</p>
            <p>
              <strong>
                <FontAwesomeIcon icon={faCalendarAlt} /> Event Name:
              </strong>
            </p>
            <p>{eventDetails?.EventTitle || "N/A"}</p>
            <p>
              <strong>
                <FontAwesomeIcon icon={faCalendarAlt} /> Event Date & Time:
              </strong>
            </p>
            <p>{formatDateTime(eventDetails?.EventDate)}</p>
          </div>
        </div>

        {/* Booking Details Section */}
        <h3 className="Booking_subtitle">Booking Details</h3>
        <div className="Booking_stats">
          <div className="Booking_stat-card">
            <FontAwesomeIcon icon={faChair} size="lg" color="#374151" />
            <p>
              <strong>{eventDetails?.Seats || 0}</strong>
            </p>
            <p>Total Seats</p>
          </div>
          <div className="Booking_stat-card">
            <FontAwesomeIcon icon={faTicketAlt} size="lg" color="#374151" />
            <p>
              <strong>{eventDetails?.ReservedSeats || 0}</strong>
            </p>
            <p>Seats Reserved</p>
          </div>
          <div className="Booking_stat-card">
            <FontAwesomeIcon icon={faUsers} size="lg" color="#374151" />
            <p>
              <strong>{eventDetails?.SeatsBooked || 0}</strong>
            </p>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="Booking_table-wrapper">
          <table className="Booking_table">
            <thead>
              <tr>
                <th scope="col">Sr.No.</th>
                <th scope="col">Booking Name</th>
                <th scope="col">Tickets Booked</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking, index) => (
                  <tr key={booking.BookingID}>
                    <td>{index + 1}</td>
                    <td>{booking.BookingName || "N/A"}</td>
                    <td>{booking.SeatsBooked || 0}</td>
                    <td>{booking.BookingEmail || "N/A"}</td>
                    <td>{booking.BookingContact || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="Booking_footer-buttons">
          <button
            className="Booking_footer-btn"
            onClick={handleBack}
            aria-label="Go back to previous page"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          <button
            className="Booking_footer-btn Booking_print-btn"
            onClick={handlePrint}
            aria-label="Print booking details"
          >
            <FontAwesomeIcon icon={faPrint} /> Print
          </button>
        </div>
      </main>
    </div>
  );
}

export default BookingDetails;
