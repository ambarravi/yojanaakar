import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, TextField, SelectField, Flex } from "@aws-amplify/ui-react";
import "../styles/GlobalStyles.css"; // Your global styles for other elements

const mockEventDetails = {
  "event-1": { pricePerTicket: 50, title: "Music Concert" },
  "event-2": { pricePerTicket: 30, title: "Comedy Show" },
  "event-3": { pricePerTicket: 20, title: "Tech Conference" },
};

function BuyTicketPage() {
  const { eventId } = useParams();

  const [eventData, setEventData] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const eventDetails = mockEventDetails["event-" + eventId];
    if (eventDetails) {
      setEventData(eventDetails);
    } else {
      console.error("Invalid eventId or event not found.");
    }
  }, [eventId]);

  // Update the total price whenever selectedTickets or eventData changes
  useEffect(() => {
    if (eventData) {
      setTotalPrice(eventData.pricePerTicket * selectedTickets);
    }
  }, [selectedTickets, eventData]);

  const handleTicketChange = (e) => {
    const tickets = parseInt(e.target.value, 10);
    setSelectedTickets(tickets);
  };

  const handlePurchase = () => {
    alert(
      "Purchase successful! Seats have been allocated. Your tickets have been sent to the registered email ID."
    );
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="filter-bar">
        <Link
          to="/landing"
          className="filter-link"
          style={{ textDecoration: "none", fontSize: "1rem" }}
        >
          Back to Events
        </Link>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ display: "flex", gap: "20px" }}>
        {/* Left Column: Contact Form */}
        <div
          style={{
            flex: 2,
            borderRight: "2px solid #ccc",
            paddingRight: "20px",
          }}
        >
          <Card style={{ padding: "20px" }}>
            <form
              className="buy-ticket-form"
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div class="ongoing-event">Contact Information</div>

              <Flex direction="row" gap="20%">
                <TextField
                  label="First name"
                  placeholder="Enter your first name"
                  required
                  style={{ flex: 1 }}
                />
                <TextField
                  label="Last name"
                  placeholder="Enter your last name"
                  required
                  style={{ flex: 1 }}
                />
              </Flex>

              <Flex direction="row" gap="20%">
                <TextField
                  label="Email Address"
                  placeholder="Enter your email"
                  type="email"
                  required
                  style={{ flex: 1 }}
                />
                <TextField
                  label="Phone number"
                  placeholder="Enter your phone number"
                  type="tel"
                  required
                  style={{ flex: 1 }}
                />
              </Flex>

              <h3>Ticket Details</h3>
              <SelectField
                label="No of Tickets"
                placeholder="Select number of tickets"
                value={selectedTickets}
                onChange={handleTicketChange}
                required
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </SelectField>
            </form>
          </Card>
        </div>

        {/* Right Column: Banner and Order Summary */}
        <div style={{ flex: 1, paddingLeft: "20px" }}>
          <Card style={{ marginBottom: "20px", padding: 0 }}>
            <img
              src="https://via.placeholder.com/300x150" // Replace with your actual banner image URL
              alt="Event Banner"
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
          </Card>

          <Card style={{ padding: "20px" }}>
            <h3>Order Summary</h3>
            <hr />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span>Price for Ticket</span>
              <span>₹{eventData?.pricePerTicket || 0}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span>No of Tickets ({selectedTickets})</span>
              <span>₹{eventData?.pricePerTicket * selectedTickets || 0}</span>
            </div>
            <hr />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
              }}
            >
              <span>Total Amount</span>
              <span>₹{totalPrice}</span>
            </div>
            <hr />

            {/* Buy Button under Order Summary */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button style={{ width: "50%" }} onClick={handlePurchase}>
                Buy Now
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BuyTicketPage;
