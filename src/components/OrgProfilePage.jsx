import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { submitProfile, fetchProfileDetails } from "../api/organizerApi";
import "../styles/OrgProfilePage.css";
import { GetCityList, GetCollegeList } from "../api/eventApi";

function OrgProfilePage({ user, signOut }) {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    contactEmail: "",
    contactNumber: "",
    alternateNumber: "",
    logo: null,
    cityID: "",
    collegeID: "",
    address: "",
    aboutOrganization: "",
    associatedCollegeUniversity: false,
    termsAccepted: false,
  });
  const [cities, setCities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Changed to isSidebarOpen

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [cityData] = await Promise.all([GetCityList()]);
        setCities(cityData);
        sessionStorage.setItem("cityDataSession", JSON.stringify(cityData));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
          setFormData({
            name: record.OrganizerName?.S || "",
            contactPerson: record.contactPerson?.S || "",
            contactEmail: record.contactEmail?.S || "",
            contactNumber: record.contactNumber?.S || "",
            alternateNumber: record.alternateNumber?.S || "",
            aboutOrganization: record.aboutOrganization?.S || "",
            cityID: record.cityID?.S || "",
            collegeID: record.collegeID?.S || "",
            address: record.address?.S || "",
            associatedCollegeUniversity: mappedValue,
            termsAccepted: record.termsAccepted?.BOOL || false,
            logo: record.logoPath?.S || "",
          });
        }
      } catch (error) {
        alert("Error fetching profile details: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleCollegeSearch = async () => {
    if (!formData.collegeSearchText || !formData.venueCityName) {
      alert("Please enter a search text and select a city.");
      return;
    }
    setIsLoading(true);
    try {
      const collegeData = await GetCollegeList(
        formData.venueCityName.toLowerCase(),
        formData.collegeSearchText.toLowerCase()
      );
      if (collegeData.length === 0) {
        alert(
          "Can't find your college? Contact us at: tikto@gmail.com or 9860719197"
        );
        return;
      }
      setColleges(collegeData);
    } catch (error) {
      console.error("Error fetching college data:", error);
    } finally {
      setIsLoading(false);
    }
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
    Object.keys(formData).forEach((key) => {
      if (key === "logo" && formData.logo) {
        formDataToSubmit.append(key, formData.logo);
      } else {
        formDataToSubmit.append(key, formData[key]);
      }
    });
    try {
      const sessionCityData = sessionStorage.getItem("cityDataSession");
      const parsedData = JSON.parse(sessionCityData);
      const dataTOCheck = {};
      for (const [key, value] of formDataToSubmit.entries()) {
        dataTOCheck[key] = value;
      }
      if (!dataTOCheck.cityName && dataTOCheck.cityID) {
        const nameofCity = parsedData.find(
          (item) => item.CityID === dataTOCheck.cityID
        );
        formDataToSubmit.append("venueCityName", nameofCity.CityName);
      }
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
                name="venueCity"
                value={formData.cityID}
                onChange={(e) => {
                  const selectedCityID = e.target.value;
                  const selectedCity = cities.find(
                    (city) => city.CityID === selectedCityID
                  );
                  setFormData({
                    ...formData,
                    cityID: selectedCityID,
                    venueCityName: selectedCity?.CityName || "",
                  });
                }}
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
              <>
                <div className="form-group search-group">
                  <label>College Search</label>
                  <div className="search-container">
                    <input
                      type="text"
                      name="collegeSearchText"
                      value={formData.collegeSearchText || ""} // Ensure controlled input
                      onChange={handleChange}
                      placeholder="Enter college name or short form"
                      className="search-input"
                    />
                    <button
                      type="button"
                      onClick={handleCollegeSearch}
                      className="search-btn"
                    >
                      <i className="bi bi-search"></i> {/* Bootstrap icon */}
                    </button>
                  </div>
                </div>
                {colleges.length > 0 && (
                  <div className="form-group">
                    <label>Select College</label>
                    <select
                      name="collegeID"
                      value={formData.collegeID || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select College/University</option>
                      {colleges.map((college) => (
                        <option
                          key={college.CollegeID}
                          value={college.CollegeID}
                        >
                          {college.Name} ({college.Shortform})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
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
