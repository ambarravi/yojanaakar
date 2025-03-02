import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchAuthSession, signOut } from "@aws-amplify/auth";
import "../styles/Sidebar.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Sidebar = ({ user: propUser, signOut: propSignOut, isOpen }) => {
  const { loading: contextLoading } = useContext(AuthContext); // Rename to avoid conflict
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user details from sessionStorage or AuthSession
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Check sessionStorage first
        const cachedUser = sessionStorage.getItem("userDetails");
        if (cachedUser) {
          const parsedUser = JSON.parse(cachedUser);
          setUserDetails(parsedUser);
          setLoading(false);
          return;
        }

        // If no firstName in propUser or cached data, fetch from AuthSession
        if (!propUser?.firstName && !propUser?.given_name) {
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken;
          if (idToken) {
            const userData = {
              username: idToken.payload["sub"],
              given_name: idToken.payload["given_name"],
              firstName: idToken.payload["custom:firstName"], // If using custom attribute
              email: idToken.payload["email"],
              role: idToken.payload["custom:role"],
            };
            setUserDetails(userData);
            sessionStorage.setItem("userDetails", JSON.stringify(userData)); // Cache it
          }
        } else {
          setUserDetails(propUser); // Use propUser if it has firstName
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserDetails(propUser || { username: "Guest" }); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [propUser]);

  const handleHostEventClick = (e) => {
    e.preventDefault();
    sessionStorage.setItem("fromSidebar", true);
    navigate("/host-event", { state: { fromSidebar: true } });
  };

  const handleLogout = async () => {
    try {
      if (propSignOut) {
        await propSignOut();
      } else {
        sessionStorage.clear();
        localStorage.clear();
        await signOut({ global: true });
      }
    
      console.log(await fetchAuthSession());
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  console.log("Sidebar - Loading:", loading, "User Details:", userDetails);

  const displayName =
    userDetails?.given_name ||
    userDetails?.firstName ||
    userDetails?.username ||
    "Guest";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-logo">tikto</h1>
        <hr />
        {loading || contextLoading ? (
          <p className="sidebar-user">Loading...</p>
        ) : (
          <p className="sidebar-user">Welcome, {displayName}!</p>
        )}
        <hr />
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/organizer-landing">
              <i className="bi bi-house-door"></i> Home
            </Link>
          </li>
          <li>
            <Link to="/host-event" onClick={handleHostEventClick}>
              <i className="bi bi-plus-square"></i> Host Event
            </Link>
          </li>
          <li>
            <Link to="/manage-events">
              <i className="bi bi-table"></i> Manage Events
            </Link>
          </li>
          <li>
            <Link to="/dashboard">
              <i className="bi bi-speedometer2"></i> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/host-profile">
              <i className="bi bi-person-circle"></i> Profile
            </Link>
          </li>
          <li>
            <Link to="/signout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Sign Out
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
