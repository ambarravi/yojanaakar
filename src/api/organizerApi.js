import { fetchAuthSession } from "@aws-amplify/auth"; // Ensure correct import path

//

export const fetchProfileDetails = async () => {
  try {
    // Fetch the current session
    console.log("Fetch Profiles details started");

    const session = await fetchAuthSession(); // Retrieves the session object
    // const jwt = session.tokens.idToken.toString();
    const username = session.tokens.idToken.payload["cognito:username"];
    // console.log("userName", username);

    // Prepare the JSON object
    const dataToSend = { username }; // Initialize with `username`

    console.log("dataToSend contents:", JSON.stringify(dataToSend));

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/get-profile-by-id";
    //  console.log(apiUrl);

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

export const submitProfile = async (profileData, logo) => {
  try {
    // Fetch the current session
    //  console.log("Update Role started");
    //  console.log("UpdateAPI Logo image", logo);

    const session = await fetchAuthSession(); // Retrieves the session object
    //  const jwt = session.tokens.idToken.toString();
    const username = session.tokens.idToken.payload["cognito:username"];
    //   console.log("userName", username);

    // Prepare the JSON object
    const dataToSend = { username }; // Initialize with `username`
    for (const [key, value] of profileData.entries()) {
      dataToSend[key] = value; // Copy each key-value pair from FormData to the object
    }

    if (logo) {
      dataToSend.logoFileName = logo.name;
      dataToSend.logoFileType = logo.type;
    }

    //  console.log("dataToSend contents:", JSON.stringify(dataToSend));

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/submit-profile";
    //   console.log(apiUrl);

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
      throw new Error(error.message || "Failed to update profile");
    }

    const result = await response.json(); // Assume the API returns the pre-signed URL
    if (result.statusCode === 200) {
      //  console.log("API Response:", result);
      const responseBody = JSON.parse(result.body); // Parse the JSON string in the body

      if (responseBody.presignedUrl) {
        const uploadUrl = responseBody.presignedUrl; // Pre-signed URL for file upload
        //  console.log("Upload URL:", uploadUrl);

        // Upload the logo file to S3 using the pre-signed URL
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": logo.type, // Ensure the correct file type
          },
          body: logo, // File object
        });
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload logo to S3");
        }
        console.log("Logo uploaded successfully!");
      } else {
        console.log("Error in API Response:", result);
      }
    }

    return result; // Return the response object if needed
  } catch (error) {
    console.error("Error updating profile:", error.message);
    throw error;
  }
};
