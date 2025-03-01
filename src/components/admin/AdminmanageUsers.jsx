import React, { useState } from "react";
import Sidebar from "./AdminSidebar";
import "./styles/AdminManageEvent.css"; // Renamed for clarity

function AdminmanageUsers({ user, signOut }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-dashboard-page">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar
        user={user}
        signOut={signOut}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <main
        className={`dashboard-content ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        <h1 className="dashboard-title">Admin : Manager Users </h1>
        <p>
          Welcome to the Admin Dashboard. Select an option from the sidebar to
          proceed.
        </p>
      </main>
    </div>
  );
}

export default AdminmanageUsers;
