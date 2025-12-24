import "@aws-amplify/ui-react/styles.css";
import { useRef } from "react"; // Import useRef
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  Alert,
  Authenticator,
  ThemeProvider,
  defaultTheme,
} from "@aws-amplify/ui-react";
import { fetchAuthSession } from "@aws-amplify/auth";

import EventsPage from "./components/EventsPage";
import Footer from "./components/Footer";

import OrganizerLoginPage from "./components/OrganizerLoginPage.jsx";
import OrganizerLandingPage from "./components/OrganizerLandingPage.jsx";
import HostEvent from "./components/Hostevent.jsx";
import ManageEvent from "./components/ManageEvents.jsx";
import Subscription from "./components/Subscription.jsx";
import Certificate from "./components/Certificate.jsx";
import Scanner from "./components/Scanner.jsx";
import OrgProfile from "./components/OrgProfilePage.jsx";
import BookingDetails from "./components/BookingDetails.jsx";
import AdminBookingDetails from "./components/admin/AdminBookingDetails.jsx";
import AdminDashBoard from "./components/admin/AdminDashboard.jsx";
import AdminEventDetails from "./components/admin/AdminEventDetails.jsx";
import AdminEvents from "./components/admin/AdminEvents.jsx";
import AdminMaster from "./components/admin/AdminMaster.jsx";
import AdminManageUsers from "./components/admin/AdminManage_users.jsx";
import TermsAndConditions from "./components/TermsAndConditions.jsx";

import { AuthProvider } from "./context/AuthContext.js";
import { updateRole } from "./api/userApi";
import "@fontsource/playfair-display"; // default 400
import "@fontsource/playfair-display/700.css"; // bold

function AuthenticatedRoutes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const hasRedirected = useRef(false); // Track if redirection has already happened

  useEffect(() => {
    async function fetchAndUpdateRole() {
      const cachedRole = sessionStorage.getItem("userRole");
      if (cachedRole && !hasRedirected.current) {
        hasRedirected.current = true;
        navigate(
          cachedRole.includes("admin")
            ? "/admin-dashboard"
            : "/organizer-landing"
        );
        setLoading(false);
        return;
      }
      try {
        const session = await fetchAuthSession();
        // console.log(JSON.stringify(session));
        const idToken = session.tokens?.idToken;
        if (!idToken) {
          console.error("ID token not found. Redirecting to login.");
          return;
        }
        let userRole = idToken.payload["custom:role"];
        sessionStorage.setItem("userRole", userRole);
        const userId = idToken.payload["sub"];
        const tempRole = sessionStorage.getItem("tempRole");
        if (tempRole && tempRole !== userRole) {
          await updateRole(userId, tempRole);
          sessionStorage.removeItem("tempRole");
          const updatedSession = await fetchAuthSession();
          userRole = updatedSession.tokens?.idToken?.payload["custom:role"];
        }
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          if (userRole?.includes("admin")) {
            navigate("/admin-dashboard");
          } else if (userRole?.includes("organizer")) {
            navigate("/organizer-landing");
          } else {
            //     console.log("No Role defined");
            Alert.alert(
              "You are not authorized to access. Contact Tikties admin"
            );
          }
        }
      } catch (error) {
        console.error("Error fetching/updating role:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAndUpdateRole();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <Authenticator
      loginMechanisms={[]}
      socialProviders={["google"]}
      hideSignUp={true}
    >
      {({ signOut, user }) => {
        if (!user) {
          return <Navigate to="/" />;
        }

        const handleSignOut = async () => {
          console.log("Signing out...");
          await signOut();
          navigate("/");
        };

        return (
          <ThemeProvider theme={defaultTheme}>
            <Routes>
              <Route
                path="/organizer-landing"
                element={
                  <OrganizerLandingPage user={user} signOut={handleSignOut} />
                }
              />
              <Route path="/host-event" element={<HostEvent />} />
              <Route path="/manage-events" element={<ManageEvent />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/certificate" element={<Certificate />} />
              <Route path="/scanner" element={<Scanner />} />

              <Route
                path="/showBookingDetails/:eventId"
                element={<BookingDetails user={user} signOut={signOut} />}
              />
              <Route
                path="/host-profile"
                element={<OrgProfile user={user} />}
              />
              {/* <Route path="/landing" element={<LandingPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="/event/:eventId" element={<EventDetailsPage />} />
              <Route path="/buyticket/:eventId" element={<BuyTicketPage />} /> */}

              {/* Admin Routes */}
              <Route path="/admin-dashboard" element={<AdminDashBoard />} />
              <Route path="/admin-events" element={<AdminEvents />} />
              <Route
                path="/admin-bookingdetails"
                element={<AdminBookingDetails />}
              />

              <Route
                path="/showAdminBookingDetails/:eventId"
                element={<AdminBookingDetails user={user} signOut={signOut} />}
              />

              <Route
                path="/admin-event-details"
                element={<AdminEventDetails />}
              />
              <Route path="/admin-master" element={<AdminMaster />} />
              <Route
                path="/admin-manage-users"
                element={<AdminManageUsers />}
              />
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
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
