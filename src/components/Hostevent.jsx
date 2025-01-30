import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  GetCityList,
  GetCategory,
  submitEvent,
  fetchEventDetailsByEventID,
} from "../api/eventApi";
import { fetchProfileDetails } from "../api/organizerApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "../styles/hostEvent.css";

function Hostevent({ user, signOut }) {
  const location = useLocation();
  const eventId = location.state?.eventId;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventTitle: "",
    dateTime: "",
    highlight: "",
    eventType: "",
    categoryID: "",
    cityID: "",
    location: "",
    mode: "",
    eventDetails: "",
    ticketPrice: "",
    noOfSeats: "",
    reserveSeats: "",
    additionalInfo: "",
    tags: "",
    audienceBenefits: ["", "", ""],
    images: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState([]); // Track uploaded files
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  //const [profile, setProfile] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [categoryData, cityData] = await Promise.all([
          GetCategory(),
          GetCityList(),
        ]);

        setCategories(categoryData);
        setCities(cityData);

        const orgProfile = await fetchProfileDetails();
        let mappedValue = false;

        if (orgProfile && orgProfile.record) {
          const record = orgProfile.record;
          mappedValue = record.associatedCollegeUniversity.BOOL;
          //  console.log("mappedValue", mappedValue);
        }

        setShowDropdown(mappedValue);
        //  setProfile(orgProfile);

        if (eventId) {
          const eventReponse = await fetchEventDetailsByEventID(eventId);
          const eventDetails = eventReponse.record;
          //  console.log("Record Event Details:", eventDetails);
          setFormData({
            eventTitle: eventDetails.EventTitle,
            dateTime: eventDetails.EventDate,
            highlight: eventDetails.EventHighLight,
            eventType: eventDetails.EventType,
            categoryID: eventDetails.CategoryID,
            cityID: eventDetails.CityID,
            location: eventDetails.EventLocation,
            mode: eventDetails.Mode,
            eventDetails: eventDetails.EventDetails,
            ticketPrice: eventDetails.Price,
            noOfSeats: eventDetails.Seats,
            reserveSeats: eventDetails.ReservedSeats,
            additionalInfo: eventDetails.AdditionalInfo,
            tags: eventDetails.Tags,
            audienceBenefits: eventDetails.AudienceBenefits,
            images: eventDetails.EventImages,
          });
        }
      } catch (error) {
        alert("An error occurred, Please try again.");
        navigate("/manage-event");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, navigate]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSizeInMB = 5; // Maximum file size in MB
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Convert MB to bytes

    const newFiles = files.slice(0, 3 - uploadedFiles.length); // Limit new uploads to stay within 3 files total

    if (uploadedFiles.length + newFiles.length > 3) {
      alert("You can upload a maximum of 3 files.");
      return;
    }

    const validFiles = newFiles.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/gif"].includes(
        file.type
      );
      const isValidSize = file.size <= maxSizeInBytes;
      if (!isValidType) {
        alert(
          `${file.name} is not a valid image file (only JPEG, PNG, or GIF allowed).`
        );
      } else if (!isValidSize) {
        alert(
          `${file.name} exceeds the maximum file size limit of ${maxSizeInMB} MB.`
        );
      }
      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      setUploadedFiles((prevFiles) => [
        ...prevFiles,
        ...validFiles.map((file) => file.name),
      ]);

      setFormData({
        ...formData,
        images: [...formData.images, ...validFiles],
      });
    } else {
      alert(
        "Please select valid image files (JPEG, PNG, or GIF) that are within the size limit."
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation checks
    if (formData.eventTitle.length > 100) {
      alert("Event Title should not exceed 100 characters.");
      setIsSubmitting(false);
      return;
    }
    if (formData.eventDetails.length > 300) {
      alert("Event Details should not exceed 300 characters.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.eventType) {
      alert("Please select the target audience for this event.");
      setIsSubmitting(false);
      return;
    }
    if (new Date(formData.dateTime) <= new Date()) {
      alert("Date and Time must be in the future.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.categoryID) {
      alert("Please select a category.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.highlight) {
      alert("Please provide a highlight.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.cityID) {
      alert("Please select a city.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.location) {
      alert("Please provide a location.");
      setIsSubmitting(false);
      return;
    }
    if (parseFloat(formData.ticketPrice) < 0) {
      alert("Ticket Price should be a non-negative number.");
      setIsSubmitting(false);
      return;
    }
    if (parseInt(formData.noOfSeats) < 25) {
      alert("No of Seats should be greater than or equal to 25.");
      setIsSubmitting(false);
      return;
    }
    if (parseFloat(formData.reserveSeats) < 0) {
      alert("Reserve Seats should be a non-negative number.");
      setIsSubmitting(false);
      return;
    }

    try {
      //  console.log("Submitting form data:", formData);

      await submitEvent(formData);

      //  await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Form submitted successfully!");
      navigate("/manage-events");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading details...</p>
      </div>
    );
  }

  return (
    <div className="host-event-page">
      {isSubmitting && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}

      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar
        user={user}
        signOut={signOut}
        className={isSidebarCollapsed ? "collapsed" : ""}
      />
      <div
        className={`host-event-container ${
          isSidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <h1 className="host-event-page-title">
          {eventId ? "Update Event" : "Host Event"}
        </h1>
        <form onSubmit={handleSubmit} className="host-event-form">
          <div className="form-group">
            <label>Event Title:</label>
            <input
              type="text"
              name="eventTitle"
              value={formData.eventTitle}
              onChange={handleChange}
              required
              maxLength="100"
            />
          </div>
          <div className="form-group">
            <label>Event Details:</label>
            <input
              type="text"
              name="eventDetails"
              value={formData.eventDetails}
              onChange={handleChange}
              required
              maxLength="300"
            />
          </div>

          <div className="form-group">
            {showDropdown && ( // Conditionally render dropdown based on state
              <>
                <label>Target Audience for this event :</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="open">
                    Open to all - Public event accessible to everyone.
                  </option>
                  <option value="inter">
                    Inter-Colleges/Institutions: Open to attendees from any
                    college or university.
                  </option>
                  <option value="private">
                    Private to College/Institution: Restricted to attendees from
                    the same institution as the organizer.
                  </option>
                </select>
              </>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date and Time:</label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Category:</label>
              <select
                name="categoryID"
                value={formData.categoryID}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.CategoryID} value={category.CategoryID}>
                    {category.CategoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Highlight:</label>
              <input
                type="text"
                name="highlight"
                value={formData.highlight}
                onChange={handleChange}
                required
                placeholder="e.g., - 10% discount, Free Entry"
                maxLength="20"
              />
            </div>
            <div className="form-group">
              <label>Additional Info:</label>
              <input
                type="text"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="e.g., Please present 10 minutes before the event starts."
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City:</label>
              <select
                name="cityID"
                value={formData.cityID}
                onChange={handleChange}
                required
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.CityID} value={city.CityID}>
                    {city.CityName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                maxLength="50"
              />
            </div>
          </div>

          {/* Mode Dropdown */}
          <div className="form-row">
            <div className="form-group">
              <label>Mode:</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                required
              >
                <option value="">Select Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Tags Input */}
            <div className="form-group">
              <label>Tags:</label>{" "}
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                required
                maxLength="20"
                placeholder="Help user to search with keywords"
              />
            </div>
          </div>
          <div className="form-group">
            <label>What Audience Will Get:</label>
            {formData.audienceBenefits.map((benefit, index) => (
              <input
                key={index}
                type="text"
                name={`audienceBenefit${index}`}
                value={benefit}
                onChange={(e) => {
                  const newBenefits = [...formData.audienceBenefits];
                  newBenefits[index] = e.target.value;
                  setFormData({ ...formData, audienceBenefits: newBenefits });
                }}
                maxLength="50"
                placeholder="ex: Certificate , Interact with Host , Hands on experience "
              />
            ))}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ticket Price:</label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                required
                maxLength="4"
              />
            </div>
            <div className="form-group">
              <label>No of Seats:</label>
              <input
                type="number"
                name="noOfSeats"
                value={formData.noOfSeats}
                onChange={handleChange}
                required
                maxLength="4"
              />
            </div>
            <div className="form-group">
              <label>Reserve Seats:</label>
              <input
                type="number"
                name="reserveSeats"
                value={formData.reserveSeats}
                onChange={handleChange}
                required
                maxLength="4"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Upload Images:</label>
              <input
                style={{
                  width: "50%",
                  display: "inline-block",
                  marginRight: "10px",
                  border: "1px solid black",
                }}
                type="file"
                accept="image/jpeg, image/png, image/gif"
                multiple
                onChange={handleImageUpload}
              />{" "}
              <span className="upload-message">
                Images will be used for Banner and thumbnails
              </span>
              {uploadedFiles.length >= 3 && (
                <p className="error-message" style={{ color: "red" }}>
                  You have reached the upload limit of 3 files.
                </p>
              )}
              <div className="uploaded-files-table">
                <table
                  style={{
                    border: "1px solid black",
                    fontSize: "12px",
                    borderCollapse: "collapse", // Ensures a clean table layout
                    width: "50%", // Optional: Make the table responsive
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid black", padding: "8px" }}>
                        #
                      </th>
                      <th style={{ border: "1px solid black", padding: "8px" }}>
                        File Name
                      </th>
                      <th style={{ border: "1px solid black", padding: "8px" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedFiles.map((fileName, index) => (
                      <tr key={index}>
                        <td style={{ border: "1px solid black" }}>
                          {index + 1}
                        </td>
                        <td style={{ border: "1px solid black" }}>
                          {fileName}
                        </td>
                        <td style={{ border: "1px solid black" }}>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = uploadedFiles.filter(
                                (_, i) => i !== index
                              );
                              setUploadedFiles(newFiles);
                              setFormData({
                                ...formData,
                                images: formData.images.filter(
                                  (_, i) => i !== index
                                ),
                              });
                            }}
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              color="red"
                              size="lg"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <button
            style={{
              backgroundColor: "#1565C0", // Denim blue color
              color: "white",
              padding: "10px 20px",
              fontSize: "16px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background-color 0.3s ease", // Smooth hover effect
            }}
            type="submit"
            disabled={isSubmitting}
          >
            {" "}
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Hostevent;
