import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/Subscription.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

// Mock API function to fetch current subscription (replace with actual API call)
const fetchCurrentSubscription = async () => {
  return {
    plan: "Free",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "Active",
  };
};

function Subscription({ user, signOut }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const isMobile = window.innerWidth <= 767;

  // Mock subscription plans data
  const subscriptionPlans = [
    {
      name: "Free",
      price: "$0",
      duration: "Forever",
      features: [
        "Host up to 1 event/month",
        "Basic event analytics",
        "Email support",
        "Up to 50 attendees/event",
      ],
    },
    {
      name: "3 Month",
      price: "$99",
      duration: "3 Months",
      features: [
        "Host up to 5 events/month",
        "Advanced event analytics",
        "Priority email support",
        "Up to 200 attendees/event",
        "Custom event branding",
      ],
    },
    {
      name: "6 Month",
      price: "$179",
      duration: "6 Months",
      features: [
        "Host up to 10 events/month",
        "Advanced event analytics",
        "Priority email & chat support",
        "Up to 500 attendees/event",
        "Custom event branding",
        "Integration with ticketing platforms",
      ],
    },
    {
      name: "Annual",
      price: "$299",
      duration: "12 Months",
      features: [
        "Unlimited events",
        "Full event analytics suite",
        "24/7 phone & email support",
        "Unlimited attendees/event",
        "Custom event branding",
        "Integration with ticketing platforms",
        "Dedicated account manager",
      ],
    },
  ];

  const fetchSubscription = async () => {
    setIsLoading(true);
    try {
      const result = await fetchCurrentSubscription();
      setCurrentSubscription(result);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSelectPlan = (plan) => {
    navigate(`/checkout/${plan.name.toLowerCase()}`);
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
      <button className="sidebar-toggle md:hidden" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`events-content ${isSidebarOpen ? "sidebar-open" : ""}`}
        style={{
          maxWidth: "100%",
          padding: isMobile ? "0.5rem" : "0.75rem",
          paddingTop: isMobile ? "3rem" : "0.75rem",
        }}
      >
        <h2 className="events-title">Manage Subscription</h2>

        <div className="subscription-details">
          <h3 className="booking-subtitle">Current Subscription</h3>
          {currentSubscription && (
            <div className="current-plan-info">
              <div className="current-plan-header">
                <h4 className="current-plan-title">
                  {currentSubscription.plan} Plan
                </h4>
              </div>
              <div className="current-plan-details">
                <div className="current-plan-item">
                  <span className="current-plan-label">Status:</span>
                  <span className="current-plan-value">
                    {currentSubscription.status}
                  </span>
                </div>
                <div className="current-plan-item">
                  <span className="current-plan-label">Start Date:</span>
                  <span className="current-plan-value">
                    {currentSubscription.startDate}
                  </span>
                </div>
                <div className="current-plan-item">
                  <span className="current-plan-label">End Date:</span>
                  <span className="current-plan-value">
                    {currentSubscription.endDate}
                  </span>
                </div>
              </div>
            </div>
          )}

          <h3 className="booking-subtitle subscription-section-spacing">
            Available Plans
          </h3>
          <div className="subscription-grid">
            {subscriptionPlans.map((plan, index) => (
              <div key={index} className="subscription-card">
                <h4 className="plan-name">{plan.name}</h4>
                <p className="plan-price">{plan.price}</p>
                <p className="plan-duration">{plan.duration}</p>
                <ul className="feature-list">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="feature-item">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="feature-icon"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="button-container">
                  <button
                    className="select-plan-btn"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={currentSubscription?.plan === plan.name}
                  >
                    {currentSubscription?.plan === plan.name
                      ? "Current Plan"
                      : "Select Plan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Subscription;
