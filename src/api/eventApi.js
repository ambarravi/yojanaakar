import { fetchAuthSession } from "@aws-amplify/auth"; // Ensure correct import path

export const GetCityList = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const session = await fetchAuthSession(); // Retrieves the session object
      const jwt = session.tokens.idToken.toString();

      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const stage = process.env.REACT_APP_STAGE;

      if (!baseUrl || !stage) {
        throw new Error(
          "API base URL or stage is not defined in environment variables"
        );
      }

      const apiUrl = `${baseUrl}${stage}/get-city-list`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`, // Include the token if needed
          "Content-Type": "application/json", // Send as JSON
        },
      });

      if (response.status === 200) {
        const data = await response.json();

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
      const session = await fetchAuthSession(); // Retrieves the session object
      const jwt = session.tokens.idToken.toString();

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
          Authorization: `Bearer ${jwt}`, // Include the token if needed
          "Content-Type": "application/json", // Send as JSON
        },
      });

      if (response.status === 200) {
        const data = await response.json();

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
      const session = await fetchAuthSession(); // Retrieves the session object
      const jwt = session.tokens.idToken.toString();

      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const stage = process.env.REACT_APP_STAGE;

      if (!baseUrl || !stage) {
        throw new Error(
          "API base URL or stage is not defined in environment variables"
        );
      }

      const apiUrl = `${baseUrl}${stage}/get-college?city=${city}&searchText=${searchText}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`, // Include the token if needed
          "Content-Type": "application/json", // Send as JSON
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        //  console.log("CollegeData ", data);
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

export const submitEvent = (eventData, organizerName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const session = await fetchAuthSession(); // Retrieves the session object
      const jwt = session.tokens.idToken.toString();
      const username = session.tokens.idToken.payload["cognito:username"];

      const oldImageArray = [];
      const newImageArray = [];
      // Change to an array to store multiple image details
      if (Array.isArray(eventData.images)) {
        eventData.images.forEach((file) => {
          if (!file.preview) {
            newImageArray.push({
              name: file.name,
              size: file.size,
              type: file.type,
              status: "new",
              url: "",
            });
            // console.log(
            //   `File Name: ${file.name}, Size: ${file.size}, Type: ${file.type}`
            // );
          } else {
            oldImageArray.push({
              name: file.name,
              size: "",
              type: "",
              status: "old",
              url: file.preview,
            });
          }
        });
        console.log("Image details stored New Images:", newImageArray); // Log the resulting array
        console.log("Image details stored Old Images:", oldImageArray); // Log the resulting array
      } else {
        console.error("eventImages is not an array");
      }

      const originalImagesFiles = eventData.images.filter(
        (image) => !image.preview
      );

      // Prepare the eventData for submission by mapping to API payload format
      const eventPayload = {
        EventID: eventData.eventId || "",
        OrgID: username,
        eventTitle: eventData.eventTitle,
        dateTime: eventData.dateTime,
        highlight: eventData.highlight,
        eventType: eventData.eventType,
        categoryID: eventData.categoryID,
        categoryName: eventData.categoryName,
        cityID: eventData.cityID,
        eventLocation: eventData.location,
        eventMode: eventData.eventMode,
        eventDetails: eventData.eventDetails,
        ticketPrice: eventData.ticketPrice,
        noOfSeats: eventData.noOfSeats,
        reserveSeats: eventData.reserveSeats,
        additionalInfo: eventData.additionalInfo,
        OrganizerName: organizerName,
        tags: eventData.tags,
        audienceBenefits: eventData.audienceBenefits,
        eventImages: eventData.images,
        readableEventID: eventData.readableEventID,
        oldImages: oldImageArray,
        newImages: newImageArray,
      };

      console.log(eventPayload);

      // API base URL and stage environment variable
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const stage = process.env.REACT_APP_STAGE;

      // Construct the full API endpoint URL
      const url = `${baseUrl}${stage}/submit-event`;

      // Make the API call using fetch
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`, // Include the token if needed
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
        console.log("Event details saved successfully!");
        if (response.status === 200) {
          // console.log(
          //   "Check for  presignedUrls length",
          //   result.presignedUrls.length
          // );
          if (result.presignedUrls && Array.isArray(result.presignedUrls)) {
            const uploadUrls = result.presignedUrls; // Array of pre-signed URLs

            if (uploadUrls.length !== originalImagesFiles.length) {
              throw new Error(
                "Number of pre-signed URLs does not match the number of images."
              );
            }

            // Loop through each pre-signed URL and upload the corresponding image

            try {
              const uploadPromises = uploadUrls.map((uploadUrl, index) => {
                return fetch(uploadUrl, {
                  method: "PUT",
                  headers: {
                    "Content-Type":
                      originalImagesFiles[index].type ||
                      "application/octet-stream",
                  },
                  body: originalImagesFiles[index],
                });
              });

              await Promise.all(uploadPromises);
              console.log("All images uploaded successfully!");
            } catch (error) {
              console.error("Error uploading images:", error);
            }
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
    // console.log("userName", orgID);

    // Prepare the JSON object
    const dataToSend = { orgID }; // Initialize with `username`

    // console.log("dataToSend contents:", JSON.stringify(dataToSend));

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/get-event-by-orgid";
    // console.log(apiUrl);

    // Make the API request to save profile data
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`, // Include the token if needed
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

export const fetchDashboardData = async () => {
  try {
    console.log("Fetching dashboard data...");

    // Get current Cognito session

    const session = await fetchAuthSession();
    const jwt = session.tokens.idToken.toString();
    const orgID = session.tokens.idToken.payload["cognito:username"];

    const dataToSend = { orgID }; // Payload to send

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/get-dashboard-data";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`, // Add if your API is protected
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch dashboard data");
    }

    const result = await response.json();

    if (response.status === 200) {
      console.log("Dashboard data fetched successfully!");
    } else {
      console.warn("Unexpected status in dashboard fetch:", result);
    }

    return result;
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    throw error;
  }
};

export const fetchEventDetailsByEventID = async (eventID) => {
  try {
    // Fetch the current session
    console.log("Fetch Event Details started");

    const session = await fetchAuthSession(); // Retrieves the session object
    const jwt = session.tokens.idToken.toString();
    // const orgID = session.tokens.idToken.payload["cognito:username"];
    //  console.log("userName", orgID);
    //  console.log("eventID", eventID);

    // Prepare the JSON object
    const dataToSend = { eventID }; // Initialize with `username`

    //  console.log("dataToSend contents:", JSON.stringify(eventID));

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/fetch-event-by-id";
    // console.log(apiUrl);

    // Make the API request to save profile data
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`, // Include the token if needed
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
      //  console.log("API Response fetchEventDetailsByEventID:", result);

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

export const updateEventStatus = async (eventID, status, role) => {
  // return "Event updated";

  const session = await fetchAuthSession(); // Retrieves the session object
  const jwt = session.tokens.idToken.toString();
  const idTokenPayload = session.tokens.idToken.payload;
  console.log("idTokenPayload");
  console.log(JSON.stringify(idTokenPayload));
  // Option 1: If role is stored as a custom attribute in Cognito User Pool
  const userRole = idTokenPayload["custom:role"];
  if (!userRole) {
    userRole = role;
  }

  const apiUrl =
    process.env.REACT_APP_API_BASE_URL +
    process.env.REACT_APP_STAGE +
    "/update-event-status";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventID: eventID,
      eventStatus: status,
      role: userRole,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update event status");
  }

  return await response.json();
};

export const fetchBookingDetailsEventID = async (eventID) => {
  try {
    // Fetch the current session

    const session = await fetchAuthSession(); // Retrieves the session object
    const jwt = session.tokens.idToken.toString();
    // const orgID = session.tokens.idToken.payload["cognito:username"];
    //  console.log("userName", orgID);
    //  console.log("eventID", eventID);

    // Prepare the JSON object
    const dataToSend = { eventID }; // Initialize with `username`

    //  console.log("dataToSend contents:", JSON.stringify(eventID));

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/fetch-booking-by-eventid";
    // console.log(apiUrl);

    // Make the API request to save profile data
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`, // Include the token if needed
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
