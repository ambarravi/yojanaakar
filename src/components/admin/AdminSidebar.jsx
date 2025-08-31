import React, { useContext } from "react";
import "bootstrap-icons/font/bootstrap-icons.css"; // Keep Bootstrap icons
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./styles/AdminSidebar.css";
import logoImage from "../../assets/images/tikties_logo.png"; //../assets/images/tikties_logo.png";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  // Changed to accept isOpen and toggleSidebar props
  const { user, loading, signOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    sessionStorage.clear();
    localStorage.clear();
    await signOut({ global: true });
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          <img
            src={logoImage}
            alt="Logo"
            className="logo-image"
            style={{ height: "40px", objectFit: "contain" }}
          />
        </div>
        <hr />
        {!loading ? (
          user ? (
            <p className="sidebar-user">Welcome, {user.firstName}!</p>
          ) : (
            <p className="sidebar-user">Welcome, Guest!</p>
          )
        ) : (
          <p className="sidebar-user">Loading...</p>
        )}
        <hr />
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <button onClick={() => navigate("/admin-events")}>
              <i className="bi bi-table"></i> Manage Events
            </button>
          </li>
          <li>
            <button onClick={() => navigate("/admin-manage-users")}>
              <i className="bi bi-plus-square"></i> Manage Users
            </button>
          </li>
          <li>
            <button onClick={() => navigate("/admin-dashboard")}>
              <i className="bi bi-speedometer2"></i> Dashboard
            </button>
          </li>
          <li>
            <button onClick={() => navigate("/admin-master")}>
              <i className="bi bi-person-circle"></i> Add Master
            </button>
          </li>
          <li>
            <button onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Sign Out
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
