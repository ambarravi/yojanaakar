import React, { useState, useEffect } from "react";
import Sidebar from "./AdminSidebar";
import "./styles/AdminManageEvent.css";
import "./styles/AdminSidebar.css";

function AdminEventDetails({ user, signOut }) {
  //const navigate = useNavigate(); // Initialize navigate for routing
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true); // State to track loading
  const [data, setData] = useState(null); // State for storing data

  // Simulate fetching data or performing async operations
  // useEffect(() => {
  //   setTimeout(() => {
  //     setData("Admin content loaded successfully!");
  //     setLoading(false); // Set loading to false when content is ready
  //   }, 2000);
  // }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // Define the styles after the render logic
  const spinnerStyle = {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 2s linear infinite",
    margin: "auto",
    display: "block",
  };

  const spinnerContainerStyle = {
    textAlign: "center",
    marginTop: "100px",
  };

  const contentStyle = {
    textAlign: "center",
    marginTop: "20px",
  };

  // If still loading, show a loading spinner or message
  if (loading) {
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

  // Render actual page content once loading is finished
  return (
    <div style={contentStyle}>
      <h1>{data}</h1>
      <p>Here is the admin-specific content or dashboard!</p>
    </div>
  );
}

export default AdminEventDetails;
