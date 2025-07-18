import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button, Card, Text } from "@aws-amplify/ui-react";
import "../styles/GlobalStyles.css"; // Your global styles for other elements

// Mock data for demonstration
const eventDetails = [
  {
    id: 1,
    title: "Event 1",
    date: "2024-12-01",
    presenter: "John Doe",
    presentationMode: "Oral",
    organizer: "Organizer A",
    time: "10:00 AM",
    venue: "Hall 1, New York",
    bannerImage: "https://via.placeholder.com/150",
    description: "An exciting event about technology and innovation.",
    seats: 100,
    fees: "Paid",
    contactNumber: "123-456-7890",
    publishDate: "2024-11-01",
    specialInstructions: "Please arrive 15 minutes early.",
  },
  // Add more mock events as needed
];

function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Find the event by ID
  const event = eventDetails.find((e) => e.id === parseInt(eventId, 10));

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="container">
      {/* Filter Bar (Header) */}
      <div className="filter-bar">
        <Link to="/landing" className="filter-link">
          Back
        </Link>
      </div>

      <div className="event-details-content">
        {/* Left Container */}
        <div className="details-box">
          <Card className="event-details-card">
            <Text className="event-details-title">Event Details</Text>
            <table className="event-details-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Date:</strong>
                  </td>
                  <td>{event.date}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Presenter:</strong>
                  </td>
                  <td>{event.presenter}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Presentation Mode:</strong>
                  </td>
                  <td>{event.presentationMode}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Organizer:</strong>
                  </td>
                  <td>{event.organizer}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Time:</strong>
                  </td>
                  <td>{event.time}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Venue:</strong>
                  </td>
                  <td>{event.venue}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right Container */}
        <div className="details-box">
          <Card className="event-details-card">
            <Text className="event-details-title">Additional Information</Text>
            <table className="event-details-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Description:</strong>
                  </td>
                  <td>{event.description}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Seats:</strong>
                  </td>
                  <td>{event.seats}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Fees:</strong>
                  </td>
                  <td>{event.fees}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Contact Number:</strong>
                  </td>
                  <td>{event.contactNumber}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Publish Date:</strong>
                  </td>
                  <td>{event.publishDate}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Special Instructions:</strong>
                  </td>
                  <td>{event.specialInstructions}</td>
                </tr>
              </tbody>
            </table>
            <Button
              onClick={() => navigate(`/buyticket/${event.id}`)}
              style={{ marginTop: "20px", width: "100%" }}
            >
              Register
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EventDetailsPage;
