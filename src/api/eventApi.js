import { fetchAuthSession } from "@aws-amplify/auth"; // Ensure correct import path

export const GetCityList = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const stage = process.env.REACT_APP_STAGE;

      if (!baseUrl || !stage) {
        throw new Error(
          "API base URL or stage is not defined in environment variables"
        );
      }

      const apiUrl = `${baseUrl}${stage}/get-city-list`;

      console.log("apiUrl", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          // Authorization: `Bearer ${jwt}`, // Include the token if needed
          "Content-Type": "application/json", // Send as JSON
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log("API Response Data:", data);
        resolve(data);
      } else {
        console.error(`Error: Received status code ${response.status}`);
        reject(new Error(`Failed to fetch City list: ${response.statusText}`));
      }
    } catch (error) {
      console.error("Error fetching City list:", error);
      reject(error);
    }
  });
};
export const GetCategory = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const stage = process.env.REACT_APP_STAGE;

      if (!baseUrl || !stage) {
        throw new Error(
          "API base URL or stage is not defined in environment variables"
        );
      }

      const apiUrl = `${baseUrl}${stage}/get-category-list`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          // Authorization: `Bearer ${jwt}`, // Include the token if needed
          "Content-Type": "application/json", // Send as JSON
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log("API Response Data:", data);
        resolve(data);
      } else {
        console.error(`Error: Received status code ${response.status}`);
        reject(
          new Error(`Failed to fetch category list: ${response.statusText}`)
        );
      }
    } catch (error) {
      console.error("Error fetching category list:", error);
      reject(error);
    }
  });
};

export const GetCollegeList = (city, searchText) => {
  return new Promise(async (resolve, reject) => {
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const stage = process.env.REACT_APP_STAGE;

      if (!baseUrl || !stage) {
        throw new Error(
          "API base URL or stage is not defined in environment variables"
        );
      }

      const apiUrl = `${baseUrl}${stage}/get-college?city=${city}&searchText=${searchText}`;
      console.log(apiUrl);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          // Authorization: `Bearer ${jwt}`, // Include the token if needed
          "Content-Type": "application/json", // Send as JSON
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log("API Response: COllege List Data:", data);
        resolve(data);
      } else {
        console.error(`Error: Received status code ${response.status}`);
        reject(
          new Error(`Failed to fetch category list: ${response.statusText}`)
        );
      }
    } catch (error) {
      console.error("Error fetching category list:", error);
      reject(error);
    }
  });
};

export const submitEvent = (eventData) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("EventAPI Function ", eventData);
      const session = await fetchAuthSession(); // Retrieves the session object
      const jwt = session.tokens.idToken.toString();
      const username = session.tokens.idToken.payload["cognito:username"];
      console.log("userName", username);
      console.log("Images ", eventData.images);

      const imageArray = []; // Change to an array to store multiple image details
      if (Array.isArray(eventData.images)) {
        eventData.images.forEach((file) => {
          imageArray.push({
            name: file.name,
            size: file.size,
            type: file.type,
          });
          console.log(
            `File Name: ${file.name}, Size: ${file.size}, Type: ${file.type}`
          );
        });
        console.log("Image details stored:", imageArray); // Log the resulting array
      } else {
        console.error("eventImages is not an array");
      }

      // Prepare the eventData for submission by mapping to API payload format
      const eventPayload = {
        EventID: eventData.eventID || "",
        OrgID: username,
        eventTitle: eventData.eventTitle,
        dateTime: eventData.dateTime,
        highlight: eventData.highlight,
        eventType: eventData.eventType,
        categoryID: eventData.categoryID,
        cityID: eventData.cityID,
        eventLocation: eventData.location,
        mode: eventData.mode,
        eventDetails: eventData.eventDetails,
        ticketPrice: eventData.ticketPrice,
        noOfSeats: eventData.noOfSeats,
        reserveSeats: eventData.reserveSeats,
        additionalInfo: eventData.additionalInfo,
        tags: eventData.tags,
        audienceBenefits: eventData.audienceBenefits,
        eventImages: imageArray,
      };

      // API base URL and stage environment variable
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const stage = process.env.REACT_APP_STAGE;

      // Construct the full API endpoint URL
      const url = `${baseUrl}${stage}/submit-event`;

      console.log("eventPayload for API call ", JSON.stringify(eventPayload));
      // Make the API call using fetch
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      });

      // Check if the response is OK
      if (!response.ok) {
        // Reject the promise if there's an error with the API request
        const errorData = await response.json();
        reject(errorData); // Reject with error details
      } else {
        const result = await response.json(); // Assume the API returns the pre-signed URL
        if (response.status === 200) {
          if (result.presignedUrls && Array.isArray(result.presignedUrls)) {
            const uploadUrls = result.presignedUrls; // Array of pre-signed URLs
            console.log("Upload URLs:", uploadUrls);

            if (uploadUrls.length !== imageArray.length) {
              throw new Error(
                "Number of pre-signed URLs does not match the number of images."
              );
            }

            // Loop through each pre-signed URL and upload the corresponding image
            for (let i = 0; i < uploadUrls.length; i++) {
              const uploadUrl = uploadUrls[i];
              const image = eventData.images[i];

              console.log(`Uploading image ${i + 1} to URL:`, uploadUrl);

              // Upload the image to S3 using the pre-signed URL
              const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                  "Content-Type": image.type, // Ensure the correct file type
                },
                body: image, // File object
              });
              console.log("Upload Response", uploadResponse);

              if (!uploadResponse.ok) {
                throw new Error(`Failed to upload image ${i + 1} to S3`);
              }
              console.log(`Image ${i + 1} uploaded successfully!`);
            }

            console.log("All images uploaded successfully!");
          } else {
            console.log("Error in API Response:", result);
          }
        }

        resolve(result);
      }
    } catch (error) {
      // Catch any other errors and reject the promise
      console.error("Error submitting event:", error);
      reject({ message: "Error submitting event. Please try again." });
    }
  });
};

export const fetchEventDetailsByOrgID = async () => {
  try {
    // Fetch the current session
    console.log("Fetch Profiles details started");

    const session = await fetchAuthSession(); // Retrieves the session object
    const jwt = session.tokens.idToken.toString();
    const orgID = session.tokens.idToken.payload["cognito:username"];
    console.log("userName", orgID);

    // Prepare the JSON object
    const dataToSend = { orgID }; // Initialize with `username`

    console.log("dataToSend contents:", JSON.stringify(dataToSend));

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/get-event-by-orgid";
    console.log(apiUrl);

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
      console.log("API Response:", result);

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

export const fetchEventDetailsByEventID = async (eventID) => {
  try {
    // Fetch the current session
    console.log("Fetch Event Details started");

    const session = await fetchAuthSession(); // Retrieves the session object
    const jwt = session.tokens.idToken.toString();
    const orgID = session.tokens.idToken.payload["cognito:username"];
    console.log("userName", orgID);
    console.log("eventID", eventID);

    // Prepare the JSON object
    const dataToSend = { eventID }; // Initialize with `username`

    console.log("dataToSend contents:", JSON.stringify(eventID));

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/fetch-event-by-id";
    console.log(apiUrl);

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
      throw new Error(error.message || "Failed to fetch event Details");
    }

    const result = await response.json();

    if (response.status === 200) {
      console.log("API Response fetchEventDetailsByEventID:", result);

      console.log("Data fecthed successfully!");
    } else {
      console.log("Error in API Response:", result);
    }
    return result; // Return the response object if needed
  } catch (error) {
    console.error("Error fetching EventDetails:", error.message);
    throw error;
  }
};
