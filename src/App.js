import '@aws-amplify/ui-react/styles.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator, ThemeProvider, defaultTheme } from '@aws-amplify/ui-react';
import Home from './components/Home';
import Profile from './components/Profile';
import EventsPage from './components/EventsPage';
import Header from './components/Header';
import Footer from './components/Footer'; // Import Footer
import LandingPage from './components/LandingPage'; // Import Landing Page
import EventDetailsPage from './components/EventDetailsPage'; // Import Event Details Page
import BuyTicketPage from './components/BuyTicketPage'; // Import BuyTicketPage
import '../src/styles/GlobalStyles.css';

import { AuthProvider } from './context/AuthContext.js'; // Import AuthProvider

function App() {
  console.log(process.env.REACT_APP_COGNITO_REDIRECT_SIGN_IN)
  console.log(process.env.REACT_APP_COGNITO_REDIRECT_SIGN_OUT)
  console.log(process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID)
  console.log(process.env.REACT_APP_COGNITO_OAUTH_DOMAIN)
  console.log(process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID)
  
  return (
    <ThemeProvider theme={defaultTheme}>
       <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route: EventPage */}
          <Route path="/" element={<EventsPage />} />

          {/* Authenticated Routes */}
          <Route
            path="*"
            element={
              <Authenticator socialProviders={['google']} signUpAttributes={['phone_number']}>
                {({ signOut, user }) => {
                  if (!user) {
                    return <Navigate to="/" />; // Redirect unauthenticated user to events page
                  }

                  // Redirect all authenticated users to /landing
                  if (window.location.pathname !== '/landing') {
                    return <Navigate to="/landing" />;
                  }

                  // Handle authenticated routes dynamically
                  return (
                    <ThemeProvider theme={defaultTheme}>
                      <Header user={user} signOut={signOut} /> {/* Display Header */}
                      <Routes>
                        <Route path="/landing" element={<LandingPage />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/profile" element={<Profile user={user} />} />
                        <Route path="/event/:eventId" element={<EventDetailsPage />} />
                        <Route path="/buyticket/:eventId" element={<BuyTicketPage />} />
                      </Routes>
                      <Footer /> {/* Footer visible on all authenticated pages */}
                    </ThemeProvider>
                  );
                }}
              </Authenticator>
            }
          />
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
