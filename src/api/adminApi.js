import { fetchAuthSession } from "@aws-amplify/auth"; // Ensure correct import path

export const fetchAllEventDetails = async () => {
  try {
    // Fetch the current session
    console.log("Fetch Profiles details started");

    const session = await fetchAuthSession(); // Retrieves the session object
    //  const jwt = session.tokens.idToken.toString();
    const username = session.tokens.idToken.payload["cognito:username"];
    // console.log("userName", orgID);

    // Prepare the JSON object
    const dataToSend = { username }; // Initialize with `username`

    // console.log("dataToSend contents:", JSON.stringify(dataToSend));

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/get-event-by-filter";
    // console.log(apiUrl);

    // Make the API request to save profile data
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        //   Authorization: `Bearer ${jwt}`, // Include the token if needed
        "Content-Type": "application/json", // Send as JSON
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch profile");
    }

    const result = await response.json();

    if (response.status === 200) {
      //   console.log("API Response:", result);

      console.log("Data fecthed successfully!");
    } else {
      console.log("Error in API Response:", result);
    }
    return result; // Return the response object if needed
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    throw error;
  }
};
