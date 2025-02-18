import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchAuthSession, signOut } from "@aws-amplify/auth";

import "../styles/Sidebar.css";

const Sidebar = ({ className }) => {
  const { user, loading } = useContext(AuthContext); // Access user from AuthContext
  const navigate = useNavigate();

  const handleHostEventClick = (e) => {
    e.preventDefault(); // Prevent the default Link behavior
    // Navigate with the state
    sessionStorage.setItem("fromSidebar", true);
    navigate("/host-event", { state: { fromSidebar: true } });
  };

  const handleLogout = async () => {
    // const signOutUrl = `https://eventmgmt.auth.eu-west-1.amazoncognito.com/logout?client_id=eventmgmt&logout_uri=${encodeURIComponent(
    //   window.location.origin
    // )}`;
    await signOut({ global: true });

    // await signOut();

    sessionStorage.clear(); // Clear session data
    localStorage.clear(); // Clear local storage tokens
    console.log(await fetchAuthSession()); // Should return an empty session
    // window.location.href = signOutUrl; // Redirect to Cognito's logout URL
    window.location.href = "/";
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
          <Link to="/organizer-landing" className="nav-link text-dark">
            <i className="bi bi-house-door"></i> Home
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="nav-link text-dark"
            to="/host-event" // Just add the destination here for default fallback
            onClick={handleHostEventClick}
          >
            <i className="bi bi-plus-square"></i> Host Event
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/manage-events" className="nav-link text-dark">
            <i className="bi bi-table"></i> Manage Events
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/dashboard" className="nav-link text-dark">
            <i className="bi bi-speedometer2"></i> Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/host-profile" className="nav-link text-dark">
            <i className="bi bi-person-circle"></i> Profile
          </Link>
        </li>

        <li className="nav-item">
          <Link
            to="/signout"
            className="nav-link text-dark"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i> Sign Out
          </Link>
        </li>
        <hr style={{ borderColor: "#0056b3", borderWidth: "1px" }} />
      </ul>
    </div>
  );
};

export default Sidebar;
