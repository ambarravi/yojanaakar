import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

function OrganizerLandingPage({ user, signOut }) {
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      // const idToken = session.tokens.idToken.payload;
      // console.log("User Details:", {
      //   email: idToken.email || "",
      //   firstName: idToken.given_name || "",
      //   lastName: idToken.family_name || "",
      //   picture: idToken.picture || "",
      // });
    }
  }, [session]);

  return (
    <div className="organizer-landing-container">
      {/* Sidebar */}
      <Sidebar user={user} signOut={signOut} />
    </div>
  );
}

export default OrganizerLandingPage;
