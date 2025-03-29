import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import { submitProfile, fetchProfileDetails } from "../api/organizerApi";
import "../styles/OrgProfilePage.css";
import { GetCollegeList } from "../api/eventApi";

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
  });
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isOtherCity, setIsOtherCity] = useState(false);
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const majorCities = useMemo(
    () => [
      { cityName: "Pune", cityId: "1259229", state: "Maharashtra" },
      { cityName: "Mumbai", cityId: "1275339", state: "Maharashtra" },
      { cityName: "Delhi", cityId: "1273294", state: "Delhi" },
    ],
    []
  );

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await fetchProfileDetails();
        console.log("Profile", profile);
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
            logo: record.logoPath?.S || "",
            collegeSearchText: record.collegeName?.S || "", // Use collegeName directly
          });
          if (!matchedCity && cityID) {
            setIsOtherCity(true);
          }
        }
      } catch (error) {
        alert("Error fetching profile details: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [user, majorCities]);

  const fetchCitySuggestions = async (query) => {
    const username = "tikto_city";
    const url = `http://api.geonames.org/searchJSON?q=${query}&maxRows=10&username=${username}&country=IN`;
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const cities = data.geonames
        .filter((c) => c.countryCode === "IN")
        .map((c) => ({
          cityName: c.name,
          cityId: c.geonameId.toString(),
          state: c.adminName1 || "Unknown",
        }));
      setCitySuggestions(cities);
    } catch (error) {
      console.error("Error fetching GeoNames suggestions:", error.message);
      setCitySuggestions([]);
    }
  };

  const fetchCollegeSuggestions = async (query) => {
    if (!formData.cityName || !query) {
      setCollegeSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const collegeData = await GetCollegeList(
        formData.cityName.toLowerCase(),
        query.toLowerCase()
      );
      setCollegeSuggestions(collegeData);
    } catch (error) {
      console.error("Error fetching college suggestions:", error);
      setCollegeSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    if (value === "Other") {
      setIsOtherCity(true);
      setFormData({
        ...formData,
        cityID: "",
        cityName: "",
        state: "",
        associatedCollegeUniversity: "",
        collegeID: "",
        collegeSearchText: "",
      });
      setCollegeSuggestions([]);
    } else {
      const selectedCity = majorCities.find((city) => city.cityId === value);
      setIsOtherCity(false);
      setFormData({
        ...formData,
        cityID: selectedCity.cityId,
        cityName: selectedCity.cityName,
        state: selectedCity.state,
        associatedCollegeUniversity: "",
        collegeID: "",
        collegeSearchText: "",
      });
      setCitySuggestions([]);
      setCollegeSuggestions([]);
    }
  };

  const handleOtherCityChange = (e) => {
    const text = e.target.value;
    setFormData({
      ...formData,
      cityName: text,
      cityID: "",
      state: "",
      associatedCollegeUniversity: "",
      collegeID: "",
      collegeSearchText: "",
    });
    setCollegeSuggestions([]);
    if (text.length > 2) {
      fetchCitySuggestions(text);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setFormData({
      ...formData,
      cityName: suggestion.cityName,
      cityID: suggestion.cityId,
      state: suggestion.state,
      associatedCollegeUniversity: "",
      collegeID: "",
      collegeSearchText: "",
    });
    setCitySuggestions([]);
    setCollegeSuggestions([]);
  };

  const handleCollegeSearchChange = (e) => {
    const text = e.target.value;
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
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.size <= 5 * 1024 * 1024 &&
      file.type.startsWith("image/")
    ) {
      setFormData({ ...formData, logo: file });
    } else {
      alert("Please upload an image file less than 5MB.");
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.name || formData.name.length > 100) {
      alert("Name is required and should not exceed 100 characters.");
      return false;
    }
    if (!formData.contactPerson || formData.contactPerson.length > 30) {
      alert("Contact Person is required and should not exceed 30 characters.");
      return false;
    }
    if (!emailRegex.test(formData.contactEmail)) {
      alert("Please enter a valid email.");
      return false;
    }
    if (!phoneRegex.test(formData.contactNumber)) {
      alert("Contact Number should be exactly 10 digits.");
      return false;
    }
    if (!phoneRegex.test(formData.alternateNumber)) {
      alert("Alternate Number should be exactly 10 digits.");
      return false;
    }
    if (!formData.logo) {
      alert("Logo upload is required.");
      return false;
    }
    if (!formData.cityID) {
      alert("Please select a valid city.");
      return false;
    }
    if (
      formData.associatedCollegeUniversity === "Yes" &&
      !formData.collegeSearchText.trim()
    ) {
      alert("Please enter or select a college name.");
      return false;
    }
    if (!formData.termsAccepted) {
      alert("You must agree to the Terms and Conditions.");
      return false;
    }
    return true;
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
      alert("Profile Updated Successfully!");
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="profile-page">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`profile-content ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        <h1 className="profile-title">Organizer Profile</h1>
        <form onSubmit={handleSubmit} className="profile-form">
          {formData.logo && (
            <div className="logo-container">
              <img
                src={
                  typeof formData.logo === "string"
                    ? formData.logo
                    : URL.createObjectURL(formData.logo)
                }
                alt="Organization Logo"
                className="logo-preview"
              />
            </div>
          )}
          <div className="form-note">
            <p>All fields are mandatory.</p>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Organization/Host Name</label>
              <input
                type="text"
                name="name"
                maxLength="100"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                maxLength="30"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                maxLength="30"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                maxLength="10"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Alternate Number</label>
              <input
                type="text"
                name="alternateNumber"
                maxLength="10"
                value={formData.alternateNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Logo</label>
              <input type="file" name="logo" onChange={handleFileChange} />
            </div>
            <div className="form-group">
              <label>City</label>
              <select
                name="cityID"
                value={formData.cityID || "Select"}
                onChange={handleCityChange}
                required
              >
                <option value="Select">Select City</option>
                {majorCities.map((city) => (
                  <option key={city.cityId} value={city.cityId}>
                    {city.cityName}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            {isOtherCity && (
              <div className="form-group">
                <label>Other City</label>
                <input
                  type="text"
                  name="otherCity"
                  value={formData.cityName}
                  onChange={handleOtherCityChange}
                  placeholder="Type city name..."
                  className="city-input"
                />
                {citySuggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {citySuggestions.map((suggestion) => (
                      <li
                        key={suggestion.cityId}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="suggestion-item"
                      >
                        {`${suggestion.cityName}, ${suggestion.state}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                maxLength="100"
                onChange={handleChange}
                required
                rows="2"
              />
            </div>
            <div className="form-group">
              <label>Associated with College/University</label>
              <select
                name="associatedCollegeUniversity"
                value={formData.associatedCollegeUniversity}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {formData.associatedCollegeUniversity === "Yes" && (
              <div className="form-group">
                <label>College Name</label>
                <input
                  type="text"
                  name="collegeSearchText"
                  value={formData.collegeSearchText}
                  onChange={handleCollegeSearchChange}
                  placeholder="Type college name..."
                  className="college-input"
                  maxLength="100"
                />
                {collegeSuggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {collegeSuggestions.map((college) => (
                      <li
                        key={college.CollegeID}
                        onClick={() => handleCollegeSuggestionSelect(college)}
                        className="suggestion-item"
                      >
                        {`${college.Name} (${college.Shortform})`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="form-group full-width">
              <label>About Organization</label>
              <textarea
                name="aboutOrganization"
                maxLength="300"
                value={formData.aboutOrganization}
                onChange={handleChange}
                rows="4"
                required
              />
              <p className="char-count">
                {formData.aboutOrganization.length}/300
              </p>
            </div>
            <div className="form-group full-width terms">
              <label>
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  required
                />
                <span>I agree to the Terms and Conditions</span>
              </label>
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default OrgProfilePage;
