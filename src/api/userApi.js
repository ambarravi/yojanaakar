import { fetchAuthSession } from "@aws-amplify/auth"; // Ensure correct import path

export const updateRole = async (username, tempRole) => {
  try {
    // Fetch the current session
    console.log("Update Role started");
    const session = await fetchAuthSession(); // Retrieves the session object
    // const token = session.tokens.idToken; // Access the ID token
    const customRole = session.tokens.idToken.payload["custom:role"];
    if (customRole === "user") console.log("customRole", customRole);
    console.log("tempRole", tempRole);

    if (!customRole === "user") {
      console.log(
        "Custom Role found , No need to update Role again:",
        customRole
      );
      return customRole;
    }
    const jwt = session.tokens.idToken.toString();

    //  console.log(jwt);

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/update-role";

    // Make the API request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`, // Pass the token in the Authorization header
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        tempRole,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update role");
    }

    return await response.json(); // Return the API response if needed
  } catch (error) {
    console.error("Error updating role:", error.message);
    throw error;
  }
};
