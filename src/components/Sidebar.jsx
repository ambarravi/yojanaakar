import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchAuthSession, signOut } from "@aws-amplify/auth";
import styles from "../styles/Sidebar.module.css"; // Use CSS modules
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
          setUserDetails(JSON.parse(cachedUser));
          setLoading(false);
          return;
        }
        if (propUser?.firstName || propUser?.given_name) {
          setUserDetails(propUser);
          sessionStorage.setItem("userDetails", JSON.stringify(propUser));
          setLoading(false);
          return;
        }
        console.time("fetchAuthSession");
        const session = await fetchAuthSession();
        console.timeEnd("fetchAuthSession");
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
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserDetails(propUser || { username: "Guest" });
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [propUser]);

  // useEffect(() => {
  //   const fetchUserDetails = async () => {
  //     try {
  //       const cachedUser = sessionStorage.getItem("userDetails");
  //       if (cachedUser) {
  //         const parsedUser = JSON.parse(cachedUser);
  //         setUserDetails(parsedUser);
  //         setLoading(false);
  //         return;
  //       }

  //       if (!propUser?.firstName && !propUser?.given_name) {
  //         const session = await fetchAuthSession();
  //         const idToken = session.tokens?.idToken;
  //         if (idToken) {
  //           const userData = {
  //             username: idToken.payload["sub"],
  //             given_name: idToken.payload["given_name"],
  //             firstName: idToken.payload["custom:firstName"],
  //             email: idToken.payload["email"],
  //             role: idToken.payload["custom:role"],
  //           };
  //           setUserDetails(userData);
  //           sessionStorage.setItem("userDetails", JSON.stringify(userData));
  //         }
  //       } else {
  //         setUserDetails(propUser);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user details:", error);
  //       setUserDetails(propUser || { username: "Guest" });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserDetails();
  // }, [propUser]);

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
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <img
            src={logoImage}
            alt="Logo"
            className={styles.logoImage}
            style={{ height: "40px", objectFit: "contain" }}
          />
        </div>
        <hr className={styles.hr} />
        {loading || contextLoading ? (
          <p className={styles.user}>Loading...</p>
        ) : (
          <p className={styles.user}>Welcome, {displayName}!</p>
        )}
        <hr className={styles.hr} />
      </div>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link to="/organizer-landing" className={styles.navLink}>
              <i className={`bi bi-house-door ${styles.icon}`}></i> Home
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              to="/host-event"
              className={styles.navLink}
              onClick={handleHostEventClick}
            >
              <i className={`bi bi-plus-square ${styles.icon}`}></i> Host Event
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/manage-events" className={styles.navLink}>
              <i className={`bi bi-table ${styles.icon}`}></i> Manage Events
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/scanner" className={styles.navLink}>
              <i className={`bi bi-qr-code-scan ${styles.icon}`}></i> Scanner
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/subscription" className={styles.navLink}>
              <i className={`bi bi-speedometer2 ${styles.icon}`}></i>{" "}
              Subscription
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/certificate" className={styles.navLink}>
              <i className={`bi bi-award ${styles.icon}`}></i> Issue
              Certificates
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link to="/host-profile" className={styles.navLink}>
              <i className={`bi bi-person-circle ${styles.icon}`}></i> Profile
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              to="/signout"
              className={styles.navLink}
              onClick={handleLogout}
            >
              <i className={`bi bi-box-arrow-right ${styles.icon}`}></i> Sign
              Out
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
