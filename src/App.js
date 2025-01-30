import "@aws-amplify/ui-react/styles.css";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  Authenticator,
  ThemeProvider,
  defaultTheme,
} from "@aws-amplify/ui-react";
import Home from "./components/Home";
import Profile from "./components/Profile";
import EventsPage from "./components/EventsPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import EventDetailsPage from "./components/EventDetailsPage";
import BuyTicketPage from "./components/BuyTicketPage";
import OrganizerLoginPage from "./components/OrganizerLoginPage.jsx";
import OrganizerLandingPage from "./components/OrganizerLandingPage.jsx";
import HostEvent from "./components/Hostevent.jsx";
import ManageEvent from "./components/ManageEvents.jsx";
import OrgProfile from "./components/OrgProfilePage.jsx";
import { AuthProvider } from "./context/AuthContext.js";
import { updateRole } from "./api/userApi";

function AuthenticatedRoutes() {
  const navigate = useNavigate();
  const [tempRole, setTempRole] = useState(sessionStorage.getItem("tempRole"));

  const handleRoleUpdate = async (user) => {
    console.log(user);
    console.log(tempRole);
    if (tempRole && user) {
      try {
        await updateRole(user.username, tempRole);
        console.log("Role updated successfully");
        sessionStorage.removeItem("tempRole"); // Clear tempRole from session
      } catch (error) {
        console.error("Failed to update role:", error);
      }
    }
  };

  useEffect(() => {
    if (tempRole) {
      if (tempRole === "organizer") {
        setTempRole(""); // Clear state variable
        navigate("/organizer-landing");
      } else if (tempRole === "user") {
        setTempRole(""); // Clear state variable
        navigate("/landing");
      }
    }
  }, [tempRole, navigate]);

  return (
    <Authenticator
      socialProviders={["google"]}
      signUpAttributes={["phone_number"]}
    >
      {({ signOut, user }) => {
        if (!user) {
          return <Navigate to="/" />;
        }

        handleRoleUpdate(user);

        const handleSignOut = async () => {
          console.log("Signing out...");
          await signOut();
          navigate("/"); // Redirect to home after sign-out
        };

        return (
          <ThemeProvider theme={defaultTheme}>
            {/* <Header user={user} signOut={handleSignOut} /> */}
            <Routes>
              <Route
                path="/organizer-landing"
                element={
                  <OrganizerLandingPage user={user} signOut={handleSignOut} />
                }
              />
              HostEvent
              <Route path="/host-event" element={<HostEvent />} />
              <Route path="/manage-events" element={<ManageEvent />} />
              <Route
                path="/host-profile"
                element={<OrgProfile user={user} />}
              />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="/event/:eventId" element={<EventDetailsPage />} />
              <Route path="/buyticket/:eventId" element={<BuyTicketPage />} />
            </Routes>
            <Footer />
          </ThemeProvider>
        );
      }}
    </Authenticator>
  );
}

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<EventsPage />} />
            <Route path="/organizer-login" element={<OrganizerLoginPage />} />
            <Route path="*" element={<AuthenticatedRoutes />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
