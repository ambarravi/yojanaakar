import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { debounce } from "lodash";
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
  const fromSidebar = sessionStorage.getItem("fromSidebar");
  const location = useLocation();
  const eventId =
    fromSidebar === "false" ? location.state?.eventId ?? null : null;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventTitle: "",
    dateTime: "",
    highlight: "",
    eventType: "",
    categoryID: "",
    categoryName: "",
    cityID: "",
    location: "",
    eventMode: "",
    eventDetails: "",
    ticketPrice: "",
    noOfSeats: "",
    reserveSeats: "",
    additionalInfo: "",
    tags: "",
    audienceBenefits: ["", "", ""],
    images: [],
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: "", body: "" });
  const [organizerName, setOrganizerName] = useState(""); // New state for OrganizerName
  const [eventsRemaining, setEventsRemaining] = useState(0);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.time("fetchData");

        const cachedCategories = sessionStorage.getItem("categories");
        const cachedCities = sessionStorage.getItem("cities");
        let categoryData, cityData;

        if (cachedCategories && cachedCities) {
          categoryData = JSON.parse(cachedCategories);
          cityData = JSON.parse(cachedCities);
        } else {
          [categoryData, cityData] = await Promise.all([
            GetCategory(),
            GetCityList(),
          ]);
          sessionStorage.setItem("categories", JSON.stringify(categoryData));
          sessionStorage.setItem("cities", JSON.stringify(cityData));
        }
        console.timeEnd("fetchData");

        setCategories(categoryData);
        setCities(cityData);

        console.time("fetchProfileDetails");
        const orgProfile = await fetchProfileDetails();
        console.timeEnd("fetchProfileDetails");

        const organizerNameValue = orgProfile?.record?.OrganizerName?.S || "";
        const remainingEvents = parseInt(
          orgProfile?.record?.eventsRemaining?.N || "0"
        );

        setOrganizerName(organizerNameValue); // Set organizerName
        setEventsRemaining(remainingEvents);

        if (!organizerNameValue) {
          setModalMessage({
            title: "Profile Incomplete",
            body: "You must complete your profile before you can host an event. Please complete all details mentioned in the profile section.",
          });
          setShowModal(true);
        } else if (remainingEvents <= 0) {
          setModalMessage({
            title: "Event Limit Reached",
            body: "We regret to inform you that the monthly event hosting limit has been reached. Please try again next month or contact support for assistance.",
          });
          setShowModal(true);
        } else {
          setShowModal(false);
        }

        const mappedValue =
          orgProfile?.record?.associatedCollegeUniversity?.BOOL || false;
        setShowDropdown(mappedValue);

        if (eventId) {
          const eventResponse = await fetchEventDetailsByEventID(eventId);
          const eventDetails = eventResponse?.record;
          const imagesArray = (eventDetails?.EventImages || []).map(
            (image) => ({
              name: image.substring(image.lastIndexOf("/") + 1),
              preview: image,
            })
          );

          setFormData({
            eventId: eventDetails.EventID,
            readableEventID: eventDetails.ReadableEventID,
            eventTitle: eventDetails?.EventTitle || "",
            dateTime: eventDetails?.EventDate || "",
            highlight: eventDetails?.EventHighLight || "",
            eventType: eventDetails?.EventType || "",
            categoryID: eventDetails?.CategoryID || "",
            categoryName: eventDetails?.CategoryName || "",
            cityID: eventDetails?.CityID || "",
            location: eventDetails?.EventLocation || "",
            eventMode: eventDetails?.EventMode || "",
            eventDetails: eventDetails?.EventDetails || "",
            ticketPrice: eventDetails?.Price || "",
            noOfSeats: eventDetails?.Seats || "0",
            reserveSeats: eventDetails?.ReservedSeats || "0",
            additionalInfo: eventDetails?.AdditionalInfo || "",
            tags: eventDetails?.Tags || "",
            audienceBenefits: eventDetails?.AudienceBenefits || ["", "", ""],
            images: [],
          });

          setUploadedFiles(imagesArray);
          setIsSubmitDisabled(
            ["Published", "Cancelled", "Deleted", "Approved"].includes(
              eventDetails?.EventStatus
            )
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("An error occurred while loading data. Please try again.");
        navigate("/manage-events");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [eventId, navigate]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    const newFiles = files.slice(0, 3 - uploadedFiles.length);

    if (uploadedFiles.length + newFiles.length > 3) {
      alert("You can upload a maximum of 3 files.");
      return;
    }

    const validFiles = newFiles.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/gif"].includes(
        file.type
      );
      const isValidSize = file.size <= maxSizeInBytes;
      if (!isValidType) alert(`${file.name} is not a valid image type.`);
      if (!isValidSize) alert(`${file.name} exceeds 5MB limit.`);
      return isValidType && isValidSize;
    });

    const filePreviews = validFiles.map((file) => ({
      name: file.name,
      preview: URL.createObjectURL(file),
    }));

    setUploadedFiles((prev) => [...prev, ...filePreviews]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
    e.target.value = null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("audienceBenefit")) {
      const index = parseInt(name.replace("audienceBenefit", ""), 10);
      const newBenefits = [...formData.audienceBenefits];
      newBenefits[index] = value;
      setFormData({ ...formData, audienceBenefits: newBenefits });
    } else if (name === "categoryID") {
      const selectedCategory = categories.find(
        (cat) => cat.CategoryID === value
      );
      setFormData({
        ...formData,
        categoryID: value,
        categoryName: selectedCategory?.CategoryName || "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      await new Promise((resolve) => setTimeout(resolve, 0)); // Ensure UI updates

      const errors = [];
      if (!organizerName) {
        errors.push(
          "You must complete your profile before you can host an event."
        );
      }
      if (eventsRemaining <= 0) {
        errors.push(
          "Monthly event hosting limit reached. Please try again next month."
        );
      }
      if (formData.eventTitle.length > 100) {
        errors.push("Event Title should not exceed 100 characters.");
      }
      if (formData.eventDetails.length > 300) {
        errors.push("Event Details should not exceed 300 characters.");
      }
      if (!formData.eventType && showDropdown) {
        errors.push("Please select the target audience.");
      }
      if (new Date(formData.dateTime) <= new Date()) {
        errors.push("Date and Time must be in the future.");
      }
      if (!formData.categoryID) {
        errors.push("Please select a category.");
      }
      if (!formData.highlight) {
        errors.push("Please provide a highlight.");
      }
      if (!formData.cityID) {
        errors.push("Please select a city.");
      }
      if (!formData.location) {
        errors.push("Please provide a location.");
      }
      if (parseFloat(formData.ticketPrice) < 0) {
        errors.push("Ticket Price should be non-negative.");
      }
      if (parseInt(formData.noOfSeats) < 25) {
        errors.push("No of Seats should be at least 25.");
      } else if (parseInt(formData.noOfSeats) > 100) {
        errors.push(
          "Free Tier does not allow more than 100 seats. Please contact admin at support@tikties.com."
        );
      }
      if (parseFloat(formData.reserveSeats) < 0) {
        errors.push("Reserve Seats should be non-negative.");
      }

      if (errors.length > 0) {
        alert(errors.join("\n"));
        setIsSubmitting(false);
        return;
      }

      try {
        console.time("submitEvent");
        await submitEvent(formData, organizerName); // Use organizerName
        console.timeEnd("submitEvent");
        alert("Form submitted successfully!");
        sessionStorage.setItem("fromSidebar", "false");
        navigate("/manage-events");
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Failed to submit the form. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, organizerName, eventsRemaining, navigate, showDropdown]
  );

  const debouncedSubmit = debounce(handleSubmit, 300, {
    leading: true,
    trailing: false,
  });

  const handleCancel = () => {
    sessionStorage.setItem("fromSidebar", "false");
    navigate("/manage-events");
  };

  const handleReset = () => {
    setFormData({
      eventTitle: "",
      dateTime: "",
      highlight: "",
      eventType: "",
      categoryID: "",
      cityID: "",
      location: "",
      eventMode: "",
      eventDetails: "",
      ticketPrice: "",
      noOfSeats: "",
      reserveSeats: "",
      additionalInfo: "",
      tags: "",
      audienceBenefits: ["", "", ""],
      images: [],
    });
    setUploadedFiles([]);
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (modalMessage.title === "Profile Incomplete") {
      navigate("/host-profile");
    } else {
      navigate("/organizer-landing");
    }
  };

  return (
    <div className="host-event-page">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`host-event-content ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        {isSubmitting && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <h1 className="host-event-title">
          {eventId ? "Update Event" : "Host Event"}
        </h1>
        <div className="form-container">
          {isLoading ? (
            <div className="form-loading">
              <div className="spinner"></div>
              <p>Loading form data...</p>
            </div>
          ) : showModal ? (
            <div className="modal-overlay">
              <div
                style={{
                  backgroundColor: "#ffebee",
                  padding: "20px",
                  borderRadius: "8px",
                  margin: "20px",
                  border: "1px solid #ef5350",
                  textAlign: "center",
                }}
              >
                <h2 style={{ color: "#d32f2f", margin: "0 0 10px" }}>
                  {modalMessage.title}
                </h2>
                <p style={{ color: "#666", margin: "0 0 15px" }}>
                  {modalMessage.body}
                </p>
                <button
                  onClick={handleModalClose}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ef5350",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {modalMessage.title === "Profile Incomplete"
                    ? "Go to Profile"
                    : "Close"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={debouncedSubmit} className="host-event-form">
              <div className="form-group">
                <label>Event Title</label>
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
                <label>Event Details</label>
                <input
                  type="text"
                  name="eventDetails"
                  value={formData.eventDetails}
                  onChange={handleChange}
                  required
                  maxLength="300"
                />
              </div>
              {showDropdown && (
                <div className="form-group">
                  <label>Target Audience</label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="open">Open to All (Public)</option>
                    <option value="inter">Inter-Colleges/Institutions</option>
                    <option value="private">
                      Private to College/Institution
                    </option>
                  </select>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Date and Time</label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="categoryID"
                    value={formData.categoryID}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option
                        key={category.CategoryID}
                        value={category.CategoryID}
                      >
                        {category.CategoryName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Highlight</label>
                  <input
                    type="text"
                    name="highlight"
                    value={formData.highlight}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 10% discount, Free Entry"
                    maxLength="30"
                  />
                </div>
                <div className="form-group">
                  <label>Additional Info</label>
                  <input
                    type="text"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="e.g., Arrive 10 minutes early"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
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
                  <label>Location</label>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Mode</label>
                  <select
                    name="eventMode"
                    value={formData.eventMode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Mode</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    required
                    maxLength="20"
                    placeholder="Keywords for search"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>What Audience Will Get</label>
                {formData.audienceBenefits.map((benefit, index) => (
                  <input
                    key={index}
                    type="text"
                    name={`audienceBenefit${index}`}
                    value={benefit}
                    onChange={handleChange}
                    maxLength="50"
                    placeholder="e.g., Certificate, Interaction"
                    className="audience-benefit-input"
                  />
                ))}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ticket Price</label>
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
                  <label>No of Seats</label>
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
                  <label>Reserve Seats</label>
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
              <div className="form-group image-upload-group">
                <label>Upload Images</label>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/gif"
                  multiple
                  onChange={handleImageUpload}
                  className="image-input"
                />
                <span className="upload-message">
                  Max 3 images for banner/thumbnails
                </span>
                {uploadedFiles.length >= 3 && (
                  <p className="error-message">
                    Upload limit of 3 files reached.
                  </p>
                )}
                {uploadedFiles.length > 0 && (
                  <div className="image-preview-table">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>File Name</th>
                          <th>Preview</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedFiles.map((file, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{file.name}</td>
                            <td>
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="image-preview"
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = uploadedFiles.filter(
                                    (_, i) => i !== index
                                  );
                                  setUploadedFiles(newFiles);
                                  setFormData((prev) => ({
                                    ...prev,
                                    images: prev.images.filter(
                                      (_, i) => i !== index
                                    ),
                                  }));
                                }}
                                className="remove-btn"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitDisabled || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default Hostevent;
