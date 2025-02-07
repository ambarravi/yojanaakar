import React, { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

import "./styles/AdminSidebar.css";

const Sidebar = ({ className }) => {
  const { user, loading, signOut } = useContext(AuthContext); // Access user from AuthContext
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/"); // Redirect to the home page after sign out
  };

  return (
    <div className={`sidebar bg-light d-flex flex-column vh-100 ${className}`}>
      <div style={{ padding: "2% 0", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "60px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#0056b3",
          }}
        >
          tikto
        </h1>
        <hr style={{ borderColor: "#0056b3", borderWidth: "1px" }} />
        {!loading ? (
          user ? (
            <h6 className="text-primary" style={{ margin: 0 }}>
              Welcome, {user.firstName}!
            </h6>
          ) : (
            <h6 className="text-secondary" style={{ margin: 0 }}>
              Welcome, Guest!
            </h6>
          )
        ) : (
          <h6 className="text-secondary" style={{ margin: 0 }}>
            Loading...
          </h6>
        )}
        <hr style={{ borderColor: "#0056b3", borderWidth: "1px" }} />
      </div>
      <ul className="nav flex-column">
        <li className="nav-item">
          <button
            className="nav-link text-dark"
            onClick={() => navigate("/admin-events")}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <i className="bi bi-table"></i> Manage Events
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link text-dark"
            onClick={() => navigate("/admin-manage-users")}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <i className="bi bi-plus-square"></i> Manage Users
          </button>
        </li>

        <li className="nav-item">
          <button
            className="nav-link text-dark"
            onClick={() => navigate("/admin-dashboard")}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <i className="bi bi-speedometer2"></i> Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link text-dark"
            onClick={() => navigate("/admin-master")}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <i className="bi bi-person-circle"></i> Add Master
          </button>
        </li>

        {/* Sign out button */}
        <li className="nav-item">
          <button
            className="nav-link text-dark"
            onClick={handleLogout}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <i className="bi bi-box-arrow-right"></i> Sign Out
          </button>
        </li>
        <hr style={{ borderColor: "#0056b3", borderWidth: "1px" }} />
      </ul>
    </div>
  );
};

export default Sidebar;
