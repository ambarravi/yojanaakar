import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const fetchUser = async () => {
    try {
      const session = await fetchAuthSession();
      console.log("AuthContext session", session);

      if (session && session.tokens && session.tokens.idToken.payload) {
        const payload = session.tokens.idToken.payload;

        // Set the user and session data
        setUser({
          email: payload.email,
          firstName: payload.given_name,
          lastName: payload.family_name,
          picture: payload.picture,
          role: payload["custom:role"], // Include custom role if available
        });

        setSession(session); // Store session globally
      } else {
        console.log("No session object found");
        setUser(null); // Handle unauthenticated state
        setSession(null);
      }
    } catch (error) {
      console.error("Error fetching user session:", error);
      setUser(null); // Handle unauthenticated state
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// Define and export the custom useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
