import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchAuthSession, signOut } from "@aws-amplify/auth";
import "../styles/Sidebar.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logoImage from "../assets/images/tikties_logo.png";

const Sidebar = ({ user: propUser, signOut: propSignOut, isOpen }) => {
  const { loading: contextLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const cachedUser = sessionStorage.getItem("userDetails");
        if (cachedUser) {
          const parsedUser = JSON.parse(cachedUser);
          setUserDetails(parsedUser);
          setLoading(false);
          return;
        }

        if (!propUser?.firstName && !propUser?.given_name) {
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken;
          if (idToken) {
            const userData = {
              username: idToken.payload["sub"],
              given_name: idToken.payload["given_name"],
              firstName: idToken.payload["custom:firstName"],
              email: idToken.payload["email"],
              role: idToken.payload["custom:role"],
            };
            setUserDetails(userData);
            sessionStorage.setItem("userDetails", JSON.stringify(userData));
          }
        } else {
          setUserDetails(propUser);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserDetails(propUser || { username: "Guest" });
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
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const displayName =
    userDetails?.given_name ||
    userDetails?.firstName ||
    userDetails?.username ||
    "Guest";

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
            <Link to="/subscription">
              <i className="bi bi-speedometer2"></i> Subscription
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
