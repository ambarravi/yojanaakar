import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '../styles/OrganizerLogin.css'; // Optional: Custom styles

function OrganizerLogin() {
  const navigate = useNavigate();

  return (
    <div className="organizer-login">
      <h1>Organizer Login</h1>
      <Authenticator socialProviders={['google']} hideSignUp>
        {({ user }) => {
          if (user) {
            navigate('/organizer-landing'); // Redirect after login
          }
          return null;
        }}
      </Authenticator>
      <div className="register-link">
        <p>Don't have an account? <a onClick={() => navigate('/organizer-register')}>Register here</a></p>
      </div>
    </div>
  );
}

export default OrganizerLogin;
