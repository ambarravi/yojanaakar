import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/OrganizerLandingPage.css"; // Unified CSS file
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@700&display=swap"
  rel="stylesheet"
></link>;

function OrganizerLandingPage({ user, signOut }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Changed to isSidebarOpen for clarity

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-page">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`dashboard-content ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        <header className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome to Tikties Organizer Dashboard
          </h1>
        </header>
        <section className="dashboard-main">
          <p>Select an option from the sidebar to get started.</p>
          {/* Placeholder for future content */}
        </section>
      </main>
    </div>
  );
}

export default OrganizerLandingPage;
