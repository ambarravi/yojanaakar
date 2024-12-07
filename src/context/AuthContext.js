import React, { createContext, useState, useEffect } from 'react';
import { fetchAuthSession } from '@aws-amplify/auth'; // Ensure this is correctly imported

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const session = await fetchAuthSession();
      const payload = session.tokens.idToken.payload; // Access the payload
        //console.log(session.tokens.idToken);
     //   console.log(payload);
      //  console.log( session);
      
      setUser({
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
      });
    } catch (error) {
      console.error('Error fetching user session:', error);
      setUser(null); // Handle unauthenticated state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
