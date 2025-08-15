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
  console.log(JSON.stringify(eventData));
  return new Promise(async (resolve, reject) => {
    try {
      const session = await fetchAuthSession(); // Retrieves the session object
      const jwt = session.tokens.idToken.toString();
      const username = session.tokens.idToken.payload["cognito:username"];

      // Use newImages and oldImages directly from eventData
      const newImages = Array.isArray(eventData.newImages)
        ? eventData.newImages
        : [];
      const oldImages = Array.isArray(eventData.oldImages)
        ? eventData.oldImages
        : [];
      const originalImagesFiles = Array.isArray(eventData.images)
        ? eventData.images
        : [];

      // Prepare the eventData for submission
      const eventPayload = {
        EventID: eventData.EventID || "",
        OrgID: username,
        eventTitle: eventData.eventTitle,
        dateTime: eventData.dateTime,
        highlight: eventData.highlight,
        eventType: eventData.eventType,
        categoryID: eventData.categoryID,
        categoryName: eventData.categoryName,
        cityID: eventData.cityID,
        location: eventData.location,
        eventMode: eventData.eventMode,
        eventDetails: eventData.eventDetails,
        ticketPrice: eventData.ticketPrice,
        noOfSeats: eventData.noOfSeats,
        reserveSeats: eventData.reserveSeats,
        additionalInfo: eventData.additionalInfo,
        OrganizerName: organizerName,
        tags: eventData.tags,
        audienceBenefits: eventData.audienceBenefits,
        eventImages: [], // Empty as per backend expectation
        readableEventID: eventData.readableEventID,
        oldImages: oldImages,
        newImages: newImages,
      };

      // API base URL and stage environment variable
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const stage = process.env.REACT_APP_STAGE;

      // Construct the full API endpoint URL
      const url = `${baseUrl}${stage}/submit-event`;

      // Make the API call using fetch
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      });

      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.json();
        reject(errorData);
      } else {
        const result = await response.json();
        if (result.presignedUrls && Array.isArray(result.presignedUrls)) {
          if (result.presignedUrls.length !== originalImagesFiles.length) {
            throw new Error(
              "Number of pre-signed URLs does not match the number of images."
            );
          }

          try {
            const uploadPromises = result.presignedUrls.map(
              (uploadUrl, index) => {
                return fetch(uploadUrl, {
                  method: "PUT",
                  headers: {
                    "Content-Type":
                      originalImagesFiles[index]?.type ||
                      "application/octet-stream",
                  },
                  body: originalImagesFiles[index],
                });
              }
            );

            await Promise.all(uploadPromises);
          } catch (error) {
            console.error("Error uploading images:", error);
            reject({ message: "Error uploading images. Please try again." });
            return;
          }
        }

        resolve(result);
      }
    } catch (error) {
      console.error("Error submitting event:", error);
      reject({ message: "Error submitting event. Please try again." });
    }
  });
};

export const markAttendance = async ({ eventId, bookingId }) => {
  try {
    console.log("Mark attendance started");

    // Fetch the current session
    const session = await fetchAuthSession(); // Retrieves the session object
    const jwt = session.tokens.idToken.toString();

    // Prepare the JSON object
    const dataToSend = { eventId, bookingId };

    console.log("dataToSend contents:", JSON.stringify(dataToSend));

    const apiUrl =
      process.env.REACT_APP_API_BASE_URL +
      process.env.REACT_APP_STAGE +
      "/mark-attendance";

    // Make the API request to mark attendance
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`, // Include the token
        "Content-Type": "application/json", // Send as JSON
      },
      body: JSON.stringify(dataToSend),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to mark attendance");
    }

    if (response.status === 200) {
      console.log("Attendance marked successfully:", result);
    } else {
      console.log("Error in API Response:", result);
    }

    return {
      status: response.status,
      message: result.message || "Attendance marked successfully",
    };
  } catch (error) {
    console.error("Error marking attendance:", error.message);
    throw error;
  }
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
  let userRole = idTokenPayload["custom:role"];
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
