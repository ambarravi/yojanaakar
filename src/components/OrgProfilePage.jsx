import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import Sidebar from "./Sidebar";
import { submitProfile, fetchProfileDetails } from "../api/organizerApi";
import "../styles/OrgProfilePage.css";
import { GetCollegeList } from "../api/eventApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import citiesData from "../data/cities.json";

// Popup Component
const Popup = ({ message, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1300, // Above sidebar (1100) and suggestions (1000)
    }}
  >
    <div
      style={{
        background: "#ffffff",
        padding: "1.5rem",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
        maxWidth: "400px",
        width: "90%",
      }}
    >
      <p
        style={{
          fontSize: "1rem",
          fontWeight: 500,
          color: "#1f2937",
          marginBottom: "1rem",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          padding: "0.5rem 1rem",
          background: "#0d9488",
          color: "#ffffff",
          fontWeight: 500,
          fontSize: "0.875rem",
          border: "none",
          borderRadius: "0.375rem",
          cursor: "pointer",
          transition: "background-color 0.2s ease",
        }}
        onMouseOver={(e) => (e.target.style.background = "#10b981")}
        onMouseOut={(e) => (e.target.style.background = "#0d9488")}
      >
        OK
      </button>
    </div>
  </div>
);

function OrgProfilePage({ user, signOut }) {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    contactEmail: "",
    contactNumber: "",
    alternateNumber: "",
    logo: null,
    cityID: "",
    cityName: "",
    state: "",
    collegeID: "",
    address: "",
    aboutOrganization: "",
    associatedCollegeUniversity: "",
    termsAccepted: false,
    collegeSearchText: "",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState({});
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isOtherCity, setIsOtherCity] = useState(false);
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCitySelected, setIsCitySelected] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // Added for popup

  // Navigation
  const navigate = useNavigate();

  const isMobile = window.innerWidth <= 767;
  const isSmallScreen = window.innerHeight <= 800 || window.innerWidth <= 1366;

  const majorCities = useMemo(
    () => [
      {
        cityName: "Pune",
        cityId: "1259229",
        state: "Maharashtra",
        latitude: "18.5204",
        longitude: "73.8567",
      },
      {
        cityName: "Mumbai",
        cityId: "1275339",
        state: "Maharashtra",
        latitude: "19.0760",
        longitude: "72.8777",
      },
      {
        cityName: "Delhi",
        cityId: "1273294",
        state: "Delhi",
        latitude: "28.7041",
        longitude: "77.1025",
      },
    ],
    []
  );

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await fetchProfileDetails();
        if (profile && profile.record) {
          const record = profile.record;
          const mappedValue = record.associatedCollegeUniversity?.BOOL
            ? "Yes"
            : "No";
          const cityID = record.cityID?.S || "";
          const matchedCity = majorCities.find(
            (city) => city.cityId === cityID
          );
          const collegeID = record.collegeID?.S || "";
          const isCustomCollege = collegeID && !collegeID.match(/^\d+$/);

          setFormData({
            name: record.OrganizerName?.S || "",
            contactPerson: record.contactPerson?.S || "",
            contactEmail: record.contactEmail?.S || "",
            contactNumber: record.contactNumber?.S || "",
            alternateNumber: record.alternateNumber?.S || "",
            aboutOrganization: record.aboutOrganization?.S || "",
            cityID: cityID,
            cityName: matchedCity
              ? matchedCity.cityName
              : record.cityName?.S || "",
            state: matchedCity ? matchedCity.state : record.state?.S || "",
            collegeID: isCustomCollege ? "" : collegeID,
            address: record.address?.S || "",
            associatedCollegeUniversity: mappedValue,
            termsAccepted: record.termsAccepted?.BOOL || false,
            logo: record.logoPath?.S || null,
            collegeSearchText: record.collegeName?.S || "",
            latitude: record.latitude?.S || "",
            longitude: record.longitude?.S || "",
          });
          if (!matchedCity && cityID) {
            setIsOtherCity(true);
            setIsCitySelected(!!record.cityName?.S);
          }
        }
      } catch (error) {
        setErrors({
          general: "Error fetching profile details.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [majorCities]);

  const fetchCitySuggestions = (query) => {
    console.log("fetchCitySuggestions called with query:", query);
    console.log("citiesData:", citiesData);
    if (query.length > 2) {
      const filteredCities = citiesData
        .filter(
          (city) =>
            city.city_name?.toLowerCase().includes(query.toLowerCase()) ||
            city.state_name?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10)
        .map((city) => ({
          cityName: city.city_name,
          cityId: city.city_id.toString(),
          state: city.state_name,
          latitude: city.latitude.toString(),
          longitude: city.longitude.toString(),
        }));
      console.log("Filtered cities:", filteredCities);
      setCitySuggestions(filteredCities);
    } else {
      setCitySuggestions([]);
    }
  };

  const fetchCollegeSuggestions = async (query) => {
    if (!formData.cityName || !query) {
      console.log(
        "Skipping fetch: cityName:",
        formData.cityName,
        "query:",
        query
      );
      setCollegeSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      console.log(
        "Fetching colleges for city:",
        formData.cityName,
        "query:",
        query
      );
      const collegeData = await GetCollegeList(
        formData.cityName.toLowerCase(),
        query.toLowerCase()
      );
      console.log("CollegeData", collegeData);
      setCollegeSuggestions(collegeData || []);
    } catch (error) {
      console.error("Error fetching college suggestions:", error);
      setCollegeSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setErrors({ ...errors, cityID: "" });
    if (value === "Other") {
      setIsOtherCity(true);
      setIsCitySelected(false);
      setFormData({
        ...formData,
        cityID: "",
        cityName: "",
        state: "",
        associatedCollegeUniversity: "",
        collegeID: "",
        collegeSearchText: "",
        latitude: "",
        longitude: "",
      });
      setCitySuggestions([]);
      setCollegeSuggestions([]);
    } else {
      const selectedCity = majorCities.find((city) => city.cityId === value);
      setIsOtherCity(false);
      setIsCitySelected(true);
      setFormData({
        ...formData,
        cityID: value,
        cityName: selectedCity?.cityName || "",
        state: selectedCity?.state || "",
        associatedCollegeUniversity: "",
        collegeID: "",
        collegeSearchText: "",
        latitude: selectedCity?.latitude || "",
        longitude: selectedCity?.longitude || "",
      });
      setCitySuggestions([]);
      setCollegeSuggestions([]);
    }
  };

  const handleOtherCityChange = (e) => {
    const text = e.target.value;
    console.log("handleOtherCityChange called with text:", text);
    setErrors({ ...errors, cityName: "" });
    setFormData({
      ...formData,
      cityName: text,
      cityID: "",
      state: "",
      associatedCollegeUniversity: "",
      collegeID: "",
      collegeSearchText: "",
      latitude: "",
      longitude: "",
    });
    setIsCitySelected(false);
    fetchCitySuggestions(text);
  };

  const handleSuggestionSelect = (suggestion) => {
    console.log("Selected suggestion:", suggestion);
    setFormData({
      ...formData,
      cityName: suggestion.cityName,
      cityID: suggestion.cityId,
      state: suggestion.state,
      associatedCollegeUniversity: "",
      collegeID: "",
      collegeSearchText: "",
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setCitySuggestions([]);
    setIsCitySelected(true);
    setCollegeSuggestions([]);
  };

  const handleCollegeSearchChange = (e) => {
    const text = e.target.value;
    setErrors({ ...errors, collegeSearchText: "" });
    setFormData({
      ...formData,
      collegeSearchText: text,
      collegeID: "",
    });
    if (text.length > 2) {
      fetchCollegeSuggestions(text);
    } else {
      setCollegeSuggestions([]);
    }
  };

  const handleCollegeSuggestionSelect = (college) => {
    setFormData({
      ...formData,
      collegeID: college.CollegeID,
      collegeSearchText: `${college.Name} (${college.Shortform})`,
    });
    setCollegeSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors({ ...errors, [name]: "" });
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setErrors({ ...errors, logo: "" });
    if (
      file &&
      file.size <= 5 * 1024 * 1024 &&
      file.type.startsWith("image/")
    ) {
      setFormData({ ...formData, logo: file });
    } else {
      setErrors({
        ...errors,
        logo: "Please upload an image file less than 5MB.",
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.name || formData.name.length > 100) {
      errors.name = "Name is required and should not exceed 100 characters.";
    }
    if (!formData.contactPerson || formData.contactPerson.length > 30) {
      errors.contactPerson =
        "Contact Person is required and should not exceed 30 characters.";
    }
    if (!emailRegex.test(formData.contactEmail)) {
      errors.contactEmail = "Please enter a valid email.";
    }
    if (!phoneRegex.test(formData.contactNumber)) {
      errors.contactNumber = "Contact Number should be exactly 10 digits.";
    }
    if (!phoneRegex.test(formData.alternateNumber)) {
      errors.alternateNumber = "Alternate Number should be exactly 10 digits.";
    }
    if (!formData.logo) {
      errors.logo = "Logo upload is required.";
    }
    if (!formData.cityID) {
      errors.cityID = "Please select a valid city.";
    }
    if (
      formData.associatedCollegeUniversity === "Yes" &&
      !formData.collegeSearchText.trim()
    ) {
      errors.collegeSearchText = "Please enter or select a college name.";
    }
    if (!formData.termsAccepted) {
      errors.termsAccepted = "You must agree to the Terms and Conditions.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const formDataToSubmit = new FormData();
    const fieldsToSubmit = {
      username: user.username,
      name: formData.name,
      contactPerson: formData.contactPerson,
      contactEmail: formData.contactEmail,
      contactNumber: formData.contactNumber,
      alternateNumber: formData.alternateNumber,
      cityID: formData.cityID,
      cityName: formData.cityName,
      state: formData.state,
      collegeID: formData.collegeID || formData.collegeSearchText,
      address: formData.address,
      aboutOrganization: formData.aboutOrganization,
      associatedCollegeUniversity: formData.associatedCollegeUniversity,
      termsAccepted: formData.termsAccepted,
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    Object.keys(fieldsToSubmit).forEach((key) => {
      formDataToSubmit.append(key, fieldsToSubmit[key]);
    });

    if (formData.logo && typeof formData.logo !== "string") {
      formDataToSubmit.append("logo", formData.logo);
      formDataToSubmit.append("logoFileName", formData.logo.name);
      formDataToSubmit.append("logoFileType", formData.logo.type);
    }

    try {
      await submitProfile(formDataToSubmit, formData.logo);
      setShowPopup(true); // Show popup on success
    } catch (error) {
      setErrors({ general: "Error updating profile: " + error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate("/organizer-landing"); // Navigate to dashboard
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className="profile-page"
      style={{
        maxWidth: "100%",
        overflowX: "hidden",
        minHeight: "100%",
        height: "auto",
      }}
    >
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      {showPopup && (
        <Popup message="Profile Updated" onClose={handlePopupClose} />
      )}
      <button className="sidebar-toggle md:hidden" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`profile-content ${isSidebarOpen ? "sidebar-open" : ""}`}
        style={{
          maxWidth: "100%",
          minHeight: "100%",
          height: "auto",
          padding: isSmallScreen ? "0.5rem" : "0.75rem",
          paddingTop: isMobile ? "2rem" : "0.75rem",
        }}
      >
        <h1
          className="profile-title"
          style={{ fontSize: isSmallScreen ? "1.25rem" : "1.5rem" }}
        >
          Organizer Profile
        </h1>
        <form
          onSubmit={handleSubmit}
          className="profile-form"
          style={{
            maxWidth: "100%",
            boxSizing: "border-box",
            height: "auto",
            maxHeight: "none",
          }}
        >
          <div
            className="form-note"
            style={{
              fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
              marginBottom: isSmallScreen ? "0.5rem" : "0.75rem",
            }}
          >
            <p>
              All fields marked with <span className="required">*</span> are
              mandatory.
            </p>
            {errors.general && (
              <p
                className={`form-message ${
                  errors.general.includes("Success") ? "success" : "error"
                }`}
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                {errors.general}
              </p>
            )}
          </div>
          <div
            className="form-grid"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: isSmallScreen ? "0.5rem" : "0.75rem",
              maxWidth: "100%",
              height: "auto",
            }}
          >
            <div
              className="form-group full-width logo-group"
              style={{
                flex: "1 1 100%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                Logo <span className="required">*</span>
              </label>
              <div
                className="logo-container"
                style={{ maxWidth: "100%", overflow: "hidden" }}
              >
                {formData.logo ? (
                  <img
                    src={
                      typeof formData.logo === "string"
                        ? formData.logo
                        : URL.createObjectURL(formData.logo)
                    }
                    alt="Organization Logo"
                    className="logo-preview"
                    style={{
                      maxWidth: isSmallScreen ? "100px" : "150px",
                      height: "auto",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    className="logo-placeholder"
                    style={{
                      maxWidth: isSmallScreen ? "100px" : "150px",
                      height: isSmallScreen ? "100px" : "150px",
                      fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faImage} />
                    <span>No Logo Uploaded</span>
                  </div>
                )}
                <input
                  type="file"
                  name="logo"
                  onChange={handleFileChange}
                  style={{
                    fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                    maxWidth: "100%",
                  }}
                />
                {errors.logo && (
                  <p
                    className="error"
                    style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                  >
                    {errors.logo}
                  </p>
                )}
              </div>
            </div>
            <div
              className="form-group"
              style={{
                flex: isMobile ? "1 1 100%" : "1 1 45%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                Organization/Host Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                maxLength="100"
                value={formData.name}
                onChange={handleChange}
                required
                className={errors.name ? "error" : ""}
                style={{
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                }}
              />
              {errors.name && (
                <p
                  className="error"
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  {errors.name}
                </p>
              )}
            </div>
            <div
              className="form-group"
              style={{
                flex: isMobile ? "1 1 100%" : "1 1 45%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                Contact Person <span className="required">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                maxLength="30"
                value={formData.contactPerson}
                onChange={handleChange}
                required
                className={errors.contactPerson ? "error" : ""}
                style={{
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                }}
              />
              {errors.contactPerson && (
                <p
                  className="error"
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  {errors.contactPerson}
                </p>
              )}
            </div>
            <div
              className="form-group"
              style={{
                flex: isMobile ? "1 1 100%" : "1 1 45%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                Contact Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="contactEmail"
                maxLength="30"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                className={errors.contactEmail ? "error" : ""}
                style={{
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                }}
              />
              {errors.contactEmail && (
                <p
                  className="error"
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  {errors.contactEmail}
                </p>
              )}
            </div>
            <div
              className="form-group"
              style={{
                flex: isMobile ? "1 1 100%" : "1 1 45%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                Contact Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="contactNumber"
                maxLength="10"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className={errors.contactNumber ? "error" : ""}
                style={{
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                }}
              />
              {errors.contactNumber && (
                <p
                  className="error"
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  {errors.contactNumber}
                </p>
              )}
            </div>
            <div
              className="form-group"
              style={{
                flex: isMobile ? "1 1 100%" : "1 1 45%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                Alternate Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="alternateNumber"
                maxLength="10"
                value={formData.alternateNumber}
                onChange={handleChange}
                required
                className={errors.alternateNumber ? "error" : ""}
                style={{
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                }}
              />
              {errors.alternateNumber && (
                <p
                  className="error"
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  {errors.alternateNumber}
                </p>
              )}
            </div>
            <div
              className="form-group"
              style={{
                flex: isMobile ? "1 1 100%" : "1 1 45%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                City <span className="required">*</span>
              </label>
              <select
                name="cityID"
                value={formData.cityID || "Select"}
                onChange={handleCityChange}
                required
                className={errors.cityID ? "error" : ""}
                style={{
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                }}
              >
                <option value="Select">Select City</option>
                {majorCities.map((city) => (
                  <option key={city.cityId} value={city.cityId}>
                    {city.cityName}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {errors.cityID && (
                <p
                  className="error"
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  {errors.cityID}
                </p>
              )}
            </div>
            {isOtherCity && (
              <div
                className="form-group"
                style={{
                  flex: isMobile ? "1 1 100%" : "1 1 45%",
                  maxWidth: "100%",
                  padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
                  position: "relative",
                }}
              >
                <label
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  Other City <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="otherCity"
                  value={formData.cityName}
                  onChange={handleOtherCityChange}
                  placeholder="Type city or state name..."
                  className={`city-input ${errors.cityName ? "error" : ""}`}
                  style={{
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                  }}
                />
                {formData.cityName.length > 2 && !isCitySelected && (
                  <ul
                    className="suggestions-list"
                    style={{
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                      position: "absolute",
                      background: "white",
                      border: "1px solid #ccc",
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      zIndex: 1000,
                      maxHeight: "200px",
                      overflowY: "auto",
                      width: "100%",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {citySuggestions.length > 0 ? (
                      citySuggestions.map((suggestion) => (
                        <li
                          key={suggestion.cityId}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="suggestion-item"
                          style={{
                            padding: "8px",
                            cursor: "pointer",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {`${suggestion.cityName}, ${suggestion.state}`}
                        </li>
                      ))
                    ) : (
                      <li
                        style={{
                          padding: "8px",
                          color: "#888",
                        }}
                      >
                        No matching cities found
                      </li>
                    )}
                  </ul>
                )}
                {errors.cityName && (
                  <p
                    className="error"
                    style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                  >
                    {errors.cityName}
                  </p>
                )}
              </div>
            )}
            <div
              className="form-group"
              style={{
                flex: isMobile ? "1 1 100%" : "1 1 45%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                Address <span className="required">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                maxLength="100"
                onChange={handleChange}
                required
                rows="2"
                className={errors.address ? "error" : ""}
                style={{
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                }}
              />
              {errors.address && (
                <p
                  className="error"
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  {errors.address}
                </p>
              )}
            </div>
            <div
              className="form-group"
              style={{
                flex: isMobile ? "1 1 100%" : "1 1 45%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                Associated with College/University{" "}
                <span className="required">*</span>
              </label>
              <select
                name="associatedCollegeUniversity"
                value={formData.associatedCollegeUniversity}
                onChange={handleChange}
                required
                className={errors.associatedCollegeUniversity ? "error" : ""}
                style={{
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                }}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {errors.associatedCollegeUniversity && (
                <p
                  className="error"
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  {errors.associatedCollegeUniversity}
                </p>
              )}
            </div>
            {formData.associatedCollegeUniversity === "Yes" && (
              <div
                className="form-group"
                style={{
                  flex: isMobile ? "1 1 100%" : "1 1 45%",
                  maxWidth: "100%",
                  padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
                }}
              >
                <label
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  College Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="collegeSearchText"
                  value={formData.collegeSearchText}
                  onChange={handleCollegeSearchChange}
                  placeholder="Type college name..."
                  className={`college-input ${
                    errors.collegeSearchText ? "error" : ""
                  }`}
                  maxLength="100"
                  style={{
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                  }}
                />
                {collegeSuggestions.length > 0 && (
                  <ul
                    className="suggestions-list"
                    style={{
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                      position: "absolute",
                      background: "white",
                      border: "1px solid #ccc",
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      zIndex: 1000,
                      maxHeight: "200px",
                      overflowY: "auto",
                      width: "100%",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {collegeSuggestions.map((college) => (
                      <li
                        key={college.CollegeID}
                        onClick={() => handleCollegeSuggestionSelect(college)}
                        className="suggestion-item"
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {`${college.Name} (${college.Shortform})`}
                      </li>
                    ))}
                  </ul>
                )}
                {errors.collegeSearchText && (
                  <p
                    className="error"
                    style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                  >
                    {errors.collegeSearchText}
                  </p>
                )}
              </div>
            )}
            <div
              className="form-group full-width"
              style={{
                flex: "1 1 100%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                About Organization <span className="required">*</span>
              </label>
              <textarea
                name="aboutOrganization"
                maxLength="300"
                value={formData.aboutOrganization}
                onChange={handleChange}
                rows={isSmallScreen ? "3" : "4"}
                required
                className={errors.aboutOrganization ? "error" : ""}
                style={{
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                }}
              />
              <p
                className="char-count"
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                {formData.aboutOrganization.length}/300
              </p>
              {errors.aboutOrganization && (
                <p
                  className="error"
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  {errors.aboutOrganization}
                </p>
              )}
            </div>
            <div
              className="form-group full-width terms"
              style={{
                flex: "1 1 100%",
                maxWidth: "100%",
                padding: isSmallScreen ? "0.5rem 0" : "0.75rem 0",
              }}
            >
              <label
                style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
              >
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  required
                  className={errors.termsAccepted ? "error" : ""}
                  style={{ marginRight: "0.5rem" }}
                />
                <span>
                  I agree to the{" "}
                  <a
                    href="/terms-and-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", textDecoration: "underline" }}
                  >
                    Terms and Conditions
                  </a>{" "}
                  <span className="required">*</span>
                </span>
              </label>
              {errors.termsAccepted && (
                <p
                  className="error"
                  style={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}
                >
                  {errors.termsAccepted}
                </p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
            style={{
              maxWidth: isSmallScreen ? "100%" : "200px",
              padding: isSmallScreen ? "0.4rem 0.8rem" : "0.5rem 1rem",
              fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
              marginTop: isSmallScreen ? "0.5rem" : "0.75rem",
              position: isSmallScreen ? "sticky" : "static",
              bottom: isSmallScreen ? "1rem" : "auto",
              zIndex: 10,
              alignSelf: "center",
            }}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default OrgProfilePage;
