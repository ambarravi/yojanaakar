import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OrganizerLandingPage.css'; // Assuming custom styles

function OrganizerLandingPage({ user, signOut }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(); // Trigger sign-out
    navigate('/organizer-login'); // Redirect to login after logout
  };

  return (
    <div className="organizer-landing">
      <header className="organizer-header">
        <h1>Welcome, {user?.attributes?.email || 'Organizer'}!</h1>
      </header>
      <nav className="organizer-nav">
        <button onClick={() => navigate('/manage-events')}>Manage Events</button>
        <button onClick={() => navigate('/analytics')}>View Analytics</button>
        <button onClick={() => navigate('/settings')}>Account Settings</button>
        
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  );
}

export default OrganizerLandingPage;
