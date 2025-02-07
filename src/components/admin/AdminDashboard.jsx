import React, { useState } from "react";
import Sidebar from "./AdminSidebar";
import "./styles/AdminManageEvent.css";
import "./styles/AdminSidebar.css";

function AdminEventDetails({ user, signOut }) {
  //const navigate = useNavigate(); // Initialize navigate for routing
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // If still loading, show a loading spinner or message

  return (
    <div className="organizer-profile-page">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar
        user={user}
        signOut={signOut}
        className={isSidebarCollapsed ? "collapsed" : ""}
      />
    </div>
  );
}

export default AdminEventDetails;
