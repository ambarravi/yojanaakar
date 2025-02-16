import React, { useState } from "react";
import Sidebar from "./Sidebar";

import "../styles/OrganizerLandingPage.css";

function OrganizerLandingPage({ user, signOut }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="org-dashboard-page">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar
        user={user}
        signOut={signOut}
        className={isSidebarCollapsed ? "collapsed" : ""}
      />
      <div
        className={`org-landing-container ${
          isSidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <h1 className="org-landing-page-title">Welcome</h1>
        {/* Main Content */}

        <h2>Welcome to Tikto Organizer Dashboard</h2>
        <p>Select an option from the sidebar.</p>
      </div>
    </div>
  );
}

export default OrganizerLandingPage;
