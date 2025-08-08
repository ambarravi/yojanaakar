import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./AdminSidebar";
import {
  GetCityList,
  GetCategory,
  submitEvent,
  fetchEventDetailsByEventID,
} from "../../api/eventApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./styles/AdminViewEvent.css";

function AdminEventDetails({ user, signOut }) {
  const location = useLocation();
  const eventId = location.state?.eventId ?? null;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    EventID: "",
    readableEventID: "",
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
    oldImages: [],
    newImages: [],
    OrganizerName: "",
    EventStatus: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  //const [showDropdown, setShowDropdown] = useState(true);
  const showDropdown = true;
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

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

        if (eventId) {
          const eventResponse = await fetchEventDetailsByEventID(eventId);
          const eventDetails = eventResponse?.record;
          console.log("eventDetails:", eventDetails);

          const imagesArray = (eventDetails?.EventImages || []).map(
            (image) => ({
              name: image.substring(image.lastIndexOf("/") + 1),
              preview: image,
              url: image,
            })
          );

          setFormData({
            EventID: eventDetails.EventID || "",
            readableEventID: eventDetails.ReadableEventID || "",
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
            ticketPrice: String(eventDetails?.Price || "0"),
            noOfSeats: String(eventDetails?.Seats || "0"),
            reserveSeats: String(eventDetails?.ReservedSeats || "0"),
            additionalInfo: eventDetails?.AdditionalInfo || "",
            tags: eventDetails?.Tags || "",
            audienceBenefits: Array.isArray(eventDetails?.AudienceBenefits)
              ? [
                  eventDetails.AudienceBenefits[0] || "",
                  eventDetails.AudienceBenefits[1] || "",
                  eventDetails.AudienceBenefits[2] || "",
                ]
              : ["", "", ""],
            images: [],
            oldImages: imagesArray.map((img) => ({ url: img.url })),
            newImages: [],
            OrganizerName: eventDetails?.OrganizerName || "",
            EventStatus: eventDetails?.EventStatus || "UnderReview",
          });

          setUploadedFiles(imagesArray);
          setIsSubmitDisabled(
            ["Cancelled", "Deleted"].includes(eventDetails?.EventStatus)
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("An error occurred. Please try again.");
        navigate("/admin-events");
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
      status: "new",
    }));

    setUploadedFiles((prev) => [...prev, ...filePreviews]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
      newImages: [
        ...prev.newImages,
        ...validFiles.map((file) => ({
          name: file.name,
          type: file.type,
          status: "new",
        })),
      ],
    }));
    e.target.value = null;
  };

  const handleImageRemove = (index) => {
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => {
      if (fileToRemove.url) {
        return {
          ...prev,
          oldImages: prev.oldImages.filter(
            (img) => img.url !== fileToRemove.url
          ),
        };
      } else {
        const newImagesIndex = index - prev.oldImages.length;
        return {
          ...prev,
          images: prev.images.filter((_, i) => i !== newImagesIndex),
          newImages: prev.newImages.filter((_, i) => i !== newImagesIndex),
        };
      }
    });
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
    setIsSubmitting(true);

    const errors = [];
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
    if (!formData.OrganizerName) {
      errors.push("Organizer Name is required.");
    }
    if (
      isNaN(parseFloat(formData.ticketPrice)) ||
      parseFloat(formData.ticketPrice) < 0
    ) {
      errors.push("Ticket Price should be non-negative.");
    }
    if (
      isNaN(parseInt(formData.noOfSeats)) ||
      parseInt(formData.noOfSeats) < 25
    ) {
      errors.push("No of Seats should be at least 25.");
    }
    if (
      isNaN(parseFloat(formData.reserveSeats)) ||
      parseFloat(formData.reserveSeats) < 0
    ) {
      errors.push("Reserve Seats should be non-negative.");
    }
    if (
      !isNaN(parseInt(formData.reserveSeats)) &&
      !isNaN(parseInt(formData.noOfSeats)) &&
      parseInt(formData.reserveSeats) > parseInt(formData.noOfSeats)
    ) {
      errors.push("Reserve Seats should not exceed Number of Seats.");
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      setIsSubmitting(false);
      return;
    }

    try {
      // Normalize numeric fields to strings and preserve EventStatus for Published events
      const payload = {
        ...formData,
        ticketPrice: String(formData.ticketPrice),
        noOfSeats: String(formData.noOfSeats),
        reserveSeats: String(formData.reserveSeats),
        EventStatus:
          formData.EventStatus === "Published"
            ? "Published"
            : formData.EventStatus,
      };

      console.log("Submitting payload:", payload);
      await submitEvent(payload, formData.OrganizerName);
      alert("Form submitted successfully!");
      navigate("/admin-events", { replace: true });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.message || "Failed to submit the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin-events", { replace: true });
  };

  const handleReset = () => {
    if (eventId) {
      fetchEventDetailsByEventID(eventId).then((eventResponse) => {
        const eventDetails = eventResponse?.record;
        const imagesArray = (eventDetails?.EventImages || []).map((image) => ({
          name: image.substring(image.lastIndexOf("/") + 1),
          preview: image,
          url: image,
        }));
        setFormData({
          EventID: eventDetails.EventID || "",
          readableEventID: eventDetails.ReadableEventID || "",
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
          ticketPrice: String(eventDetails?.Price || "0"),
          noOfSeats: String(eventDetails?.Seats || "0"),
          reserveSeats: String(eventDetails?.ReservedSeats || "0"),
          additionalInfo: eventDetails?.AdditionalInfo || "",
          tags: eventDetails?.Tags || "",
          audienceBenefits: Array.isArray(eventDetails?.AudienceBenefits)
            ? [
                eventDetails.AudienceBenefits[0] || "",
                eventDetails.AudienceBenefits[1] || "",
                eventDetails.AudienceBenefits[2] || "",
              ]
            : ["", "", ""],
          images: [],
          oldImages: imagesArray.map((img) => ({ url: img.url })),
          newImages: [],
          OrganizerName: eventDetails?.OrganizerName || "",
          EventStatus: eventDetails?.EventStatus || "UnderReview",
        });
        setUploadedFiles(imagesArray);
      });
    } else {
      setFormData({
        EventID: "",
        readableEventID: "",
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
        oldImages: [],
        newImages: [],
        OrganizerName: "",
        EventStatus: "",
      });
      setUploadedFiles([]);
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
            <label>Organizer Name:</label>
            <input
              type="text"
              name="OrganizerName"
              value={formData.OrganizerName}
              onChange={handleChange}
              required
            />
          </div>
          {showDropdown && (
            <div className="form-group">
              <label>Target Audience:</label>
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
                <option value="inter">Inter-Colleges/Institutions</option>
                <option value="private">Private to College/Institution</option>
              </select>
            </div>
          )}
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
                placeholder="e.g., 10% discount, Free Entry"
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
                placeholder="e.g., Please arrive 10 minutes early"
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
          <div className="form-row">
            <div className="form-group">
              <label>Mode:</label>
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
              <label>Tags:</label>
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
                onChange={handleChange}
                maxLength="50"
                placeholder="e.g., Certificate, Interaction with Host"
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
              />
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
                    borderCollapse: "collapse",
                    width: "80%",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid black",
                          padding: "8px",
                          width: "3%",
                        }}
                      >
                        #
                      </th>
                      <th
                        style={{
                          border: "1px solid black",
                          padding: "8px",
                          width: "25%",
                        }}
                      >
                        File Name
                      </th>
                      <th style={{ border: "1px solid black", padding: "8px" }}>
                        Image
                      </th>
                      <th
                        style={{
                          border: "1px solid black",
                          padding: "8px",
                          width: "5%",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedFiles.map((file, index) => (
                      <tr key={index}>
                        <td style={{ border: "1px solid black" }}>
                          {index + 1}
                        </td>
                        <td style={{ border: "1px solid black" }}>
                          {file.name}
                        </td>
                        <td style={{ border: "1px solid black" }}>
                          <img
                            src={file.preview}
                            alt={file.name}
                            style={{
                              width: "200px",
                              height: "200px",
                              alignContent: "center",
                            }}
                          />
                        </td>
                        <td style={{ border: "1px solid black" }}>
                          <button
                            type="button"
                            onClick={() => handleImageRemove(index)}
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
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{
                backgroundColor:
                  isSubmitting || isSubmitDisabled ? "#B0BEC5" : "#1565C0",
                color: "white",
                padding: "10px 20px",
                fontSize: "16px",
                border: "none",
                borderRadius: "5px",
                cursor:
                  isSubmitting || isSubmitDisabled ? "not-allowed" : "pointer",
                transition: "background-color 0.3s ease",
                opacity: isSubmitting || isSubmitDisabled ? 0.7 : 1,
              }}
              type="submit"
              disabled={isSubmitDisabled || isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            <button
              style={{
                backgroundColor: "#D32F2F",
                color: "white",
                padding: "10px 20px",
                fontSize: "16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              style={{
                backgroundColor: "#388E3C",
                color: "white",
                padding: "10px 20px",
                fontSize: "16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              type="button"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEventDetails;
