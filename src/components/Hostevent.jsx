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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: "", body: "" });
  const [profileCompleted, setProfileCompleted] = useState("");

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
        console.log("OrgProfile details ", orgProfile);
        const profileCompletedStatus =
          orgProfile?.record?.OrganizerName?.S || "";
        const eventLimit = parseInt(
          orgProfile?.record?.publishedEvent?.N || "0"
        );
        const eventsRemaining = parseInt(
          orgProfile?.record?.eventsRemaining?.N || "0"
        );

        setProfileCompleted(profileCompletedStatus);

        // Check profile completion first
        if (!profileCompletedStatus) {
          setModalMessage({
            title: "Profile Incomplete",
            body: "You must complete your profile before you can host an event. Please complete all details mentioned in the profile section.",
          });
          setShowModal(true);
        }
        // Check event limit if profile is complete
        else if (eventLimit >= eventsRemaining) {
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
              name: extractImageName(image),
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
            noOfSeats: eventDetails?.Seats || "",
            reserveSeats: eventDetails?.ReservedSeats || "",
            additionalInfo: eventDetails?.AdditionalInfo || "",
            tags: eventDetails?.Tags || "",
            audienceBenefits: eventDetails?.AudienceBenefits || ["", "", ""],
            images: [],
          });

          setUploadedFiles(imagesArray);
          setIsSubmitDisabled(
            ["Published", "Cancelled", "Deleted"].includes(
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

  const extractImageName = (url) => url.substring(url.lastIndexOf("/") + 1);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check profile completion
    if (!profileCompleted) {
      setModalMessage({
        title: "Profile Incomplete",
        body: "You must complete your profile before you can host an event. Please complete all details mentioned in the profile section.",
      });
      setShowModal(true);
      return;
    }

    // Check event limit
    const orgProfile = await fetchProfileDetails();
    const eventLimit = parseInt(orgProfile?.record?.publishedEvent?.N || "0");
    const eventsRemaining = parseInt(
      orgProfile?.record?.eventsRemaining?.N || "0"
    );

    if (eventsRemaining <= 0) {
      setModalMessage({
        title: "Event Limit Reached",
        body: "We regret to inform you that the monthly event hosting limit has been reached. Please try again next month or contact support for assistance.",
      });
      setShowModal(true);
      return;
    }

    setIsSubmitting(true);

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
    if (!formData.eventType && showDropdown) {
      alert("Please select the target audience.");
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
      alert("Ticket Price should be non-negative.");
      setIsSubmitting(false);
      return;
    }
    if (parseInt(formData.noOfSeats) < 25) {
      alert("No of Seats should be at least 25.");
      setIsSubmitting(false);
      return;
    }
    if (parseFloat(formData.reserveSeats) < 0) {
      alert("Reserve Seats should be non-negative.");
      setIsSubmitting(false);
      return;
    }

    try {
      await submitEvent(formData, orgProfile?.record?.OrganizerName?.S || "");
      alert("Form submitted successfully!");
      sessionStorage.setItem("fromSidebar", false);
      navigate("/manage-events", { replace: true });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.setItem("fromSidebar", false);
    navigate("/manage-events", { replace: true });
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleModalClose = () => {
    setShowModal(false);
    if (modalMessage.title === "Profile Incomplete") {
      navigate("/host-profile"); // Navigate to profile when profile is incomplete
    } else {
      navigate("/organizer-landing"); // Navigate to landing for event limit case
    }
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
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`host-event-content ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        <h1 className="host-event-title">
          {eventId ? "Update Event" : "Host Event"}
        </h1>
        {showModal ? (
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
          <form onSubmit={handleSubmit} className="host-event-form">
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
              <button type="button" className="reset-btn" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default Hostevent;
