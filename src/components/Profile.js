import React, { useEffect, useState } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";
import { TextField, SelectField, Flex } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import "../styles/GlobalStyles.css";
import blankProfilePicture from '../assets/images/blank-profile-picture.jpg';

const ProfilePage = () => {
  const [user, setUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    picture: "",
    birthdate: "",
    mobile: "",
    country: "",
    city: "",
    address: "",
    gender: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens.idToken.payload;

        console.log(idToken.picture);

        setUser((prevUser) => ({
          ...prevUser,
          email: idToken.email,
          firstName: idToken.given_name || "",
          lastName: idToken.family_name || "",
          picture: idToken.picture || "",
        }));
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleUpdate = () => {
    console.log("Updated User Data:", user);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <div className="filter-bar">
        <Link to="#" className="filter-link">
          Back to Event
        </Link>
        <Link to="#" className="filter-link">
          My Event
        </Link>
      </div>

      <div className="profile-container">
        {/* Left Side */}
        <div className="profile-left">
      
          { <img
             src={user.picture || blankProfilePicture}
             referrerPolicy="no-referrer"
            alt="Profile-Pic"
            className="profile-picture"
            onError={(e) => {
              console.log("error" + e.target.src);
              console.log("error" + e.target);
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = blankProfilePicture; // Fallback avatar
            }}
          /> }
          <p className="profile-email">{user.firstName}</p>
        </div>

        {/* Vertical Line */}
        <div className="vertical-line"></div>

        {/* Right Side */}
        <div className="profile-right">
        <Flex direction="column" gap="10px" wrap="wrap">
  <TextField
    label="Email Address"
    value={user.email}
    isReadOnly
    style={{ flex: 1 }}
  />
  <TextField
    label="Phone Number"
    placeholder="Enter your phone number"
    type="tel"
    name="mobile"
    value={user.mobile}
    onChange={handleInputChange}
    style={{ flex: 1 }}
  />
</Flex>

          <Flex direction="row" gap="20px">
            <TextField
              label="First Name"
              placeholder="Enter first name"
              name="firstName"
              value={user.firstName}
              onChange={handleInputChange}
              isReadOnly
              style={{ flex: 1 }}
            />
            <TextField
              label="Last Name"
              placeholder="Enter last name"
              name="lastName"
              value={user.lastName}
              onChange={handleInputChange}
              isReadOnly
              style={{ flex: 1 }}
            />
          </Flex>

          <Flex direction="row" gap="20px" wrap="wrap">
  <TextField
    label="Birthdate"
    type="date"
    name="birthdate"
    value={user.birthdate}
    onChange={handleInputChange}
    style={{ flex: 1, minWidth: "150px" }}
  />
  <SelectField
    label="Gender"
    name="gender"
    value={user.gender}
    onChange={handleInputChange}
    style={{ flex: 1, minWidth: "150px" }}
  >
    <option value="">Select Gender</option>
    <option value="M">Male</option>
    <option value="F">Female</option>
  </SelectField>
</Flex>

          <Flex direction="row" gap="20px">
            <TextField
              label="City"
              placeholder="Enter city"
              name="city"
              value={user.city}
              onChange={handleInputChange}
              style={{ flex: 1 }}
            />
            <TextField
              label="Country"
              placeholder="Enter country"
              name="country"
              value={user.country}
              onChange={handleInputChange}
              style={{ flex: 1 }}
            />
          </Flex>

          <TextField
            label="Address"
            placeholder="Enter your address"
            name="address"
            value={user.address}
            onChange={handleInputChange}
            style={{ width: "100%" }}
          />

  

                    {/* Buy Button under Order Summary */}
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button style={{ width: '50%' }} onClick={handleUpdate}>
              Update Profile
              </button>
            </div>
            
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
