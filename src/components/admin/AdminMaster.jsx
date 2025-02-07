import React, { useState, useEffect } from "react";

function AdminMaster() {
  const [loading, setLoading] = useState(true); // State to track loading
  const [data, setData] = useState(null); // State for storing data

  // Simulate fetching data or performing async operations
  useEffect(() => {
    setTimeout(() => {
      setData("Admin content loaded successfully!");
      setLoading(false); // Set loading to false when content is ready
    }, 2000);
  }, []);

  // Define the styles after the render logic
  const spinnerStyle = {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 2s linear infinite",
    margin: "auto",
    display: "block",
  };

  const spinnerContainerStyle = {
    textAlign: "center",
    marginTop: "100px",
  };

  const contentStyle = {
    textAlign: "center",
    marginTop: "20px",
  };

  // If still loading, show a loading spinner or message
  if (loading) {
    return (
      <div style={spinnerContainerStyle}>
        <div style={spinnerStyle}></div>
        <p>Loading Admin Content...</p>
      </div>
    );
  }

  // Render actual page content once loading is finished
  return (
    <div style={contentStyle}>
      <h1>{data}</h1>
      <p>Here is the admin-specific content or dashboard!</p>
    </div>
  );
}

export default AdminMaster;
