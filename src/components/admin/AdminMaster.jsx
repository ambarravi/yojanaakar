import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./AdminSidebar";
import "../admin/styles/AdminManageColleges.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEdit,
  faTrash,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

// Mock Data for Colleges
const mockColleges = [
  {
    CollegeID: "c1cb54ea-74eb-4c4f-ba5c-7d387336a0c1",
    Name: "Government College of Engineering",
    Shortform: "GCE",
    City: "Pune",
    CityID: "1259229",
    CreatedAt: "2025-03-31T07:10:27.159Z",
    CreatedBy: "google_115751856932696261052",
    IsDeleted: false,
  },
  {
    CollegeID: "d2dc65fb-85fc-5d5f-ca6d-8e498447b1d2",
    Name: "Symbiosis Institute of Technology",
    Shortform: "SIT",
    City: "Pune",
    CityID: "1259229",
    CreatedAt: "2025-03-30T09:15:00.000Z",
    CreatedBy: "user_223344556677889900",
    IsDeleted: false,
  },
  {
    CollegeID: "e3ed76gc-96gd-6e6g-db7e-9f5a9558c2e3",
    Name: "Indian Institute of Technology Bombay",
    Shortform: "IITB",
    City: "Mumbai",
    CityID: "1275339",
    CreatedAt: "2025-03-29T12:30:00.000Z",
    CreatedBy: "user_334455667788990011",
    IsDeleted: false,
  },
  // Add 12 more colleges
  ...Array.from({ length: 12 }, (_, i) => ({
    CollegeID: `college-${i + 3}-${Math.random().toString(36).substr(2, 9)}`,
    Name: `College ${i + 3} of ${
      ["Engineering", "Science", "Arts", "Technology"][i % 4]
    }`,
    Shortform: `C${i + 3}${["E", "S", "A", "T"][i % 4]}`,
    City: ["Pune", "Mumbai", "Delhi", "Bangalore"][i % 4],
    CityID: ["1259229", "1275339", "1273294", "1277333"][i % 4],
    CreatedAt: `2025-03-${31 - (i % 5)}T${String(8 + (i % 12)).padStart(
      2,
      "0"
    )}:00:00.000Z`,
    CreatedBy: `user_${Math.random().toString(36).substr(2, 9)}`,
    IsDeleted: false,
  })),
];

function AdminManageColleges({ user, signOut }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setColleges(mockColleges.filter((college) => !college.IsDeleted));
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setError("Failed to load colleges. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleAction = async (college, action) => {
    const displayName = college.Name;
    if (action === "view") {
      navigate(`/admin/college/${college.CollegeID}`);
    } else if (action === "edit") {
      navigate(`/admin/edit-college/${college.CollegeID}`);
    } else if (action === "delete") {
      if (!window.confirm(`Are you sure you want to delete ${displayName}?`))
        return;
      setIsLoading(true);
      try {
        setColleges((prev) =>
          prev.map((c) =>
            c.CollegeID === college.CollegeID ? { ...c, IsDeleted: true } : c
          )
        );
        alert(`${displayName} deleted successfully.`);
        fetchData(); // Refresh to filter out deleted items
      } catch (error) {
        console.error("Error deleting college:", error);
        alert(`Failed to delete ${displayName}.`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const filterItems = (items) => {
    if (!searchQuery) return items;
    return items.filter(
      (item) =>
        item.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Shortform.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const sortItems = (items) => {
    if (!sortConfig.key) return items;
    return [...items].sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      return aValue > bValue ? direction : -direction;
    });
  };

  const filteredItems = filterItems(colleges);
  const sortedItems = sortItems(filteredItems);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="admin-manage-colleges-page">
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
        className={`colleges-content ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        <h2 className="colleges-title">Admin Manage Colleges</h2>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search colleges by name or shortform..."
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search colleges"
          />
        </div>

        {/* Table Section */}
        <div className="colleges-section">
          <h3 className="colleges-subtitle">Colleges List</h3>
          <div className="table-wrapper">
            <table className="colleges-table">
              <thead>
                <tr>
                  <th scope="col" onClick={() => handleSort("CollegeID")}>
                    Sr.No.
                  </th>
                  <th scope="col" onClick={() => handleSort("Name")}>
                    Name
                  </th>
                  <th scope="col" onClick={() => handleSort("Shortform")}>
                    Shortform
                  </th>
                  <th scope="col" onClick={() => handleSort("City")}>
                    City
                  </th>
                  <th scope="col" onClick={() => handleSort("CityID")}>
                    City ID
                  </th>
                  <th scope="col" onClick={() => handleSort("CreatedAt")}>
                    Created At
                  </th>
                  <th scope="col" onClick={() => handleSort("CreatedBy")}>
                    Created By
                  </th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No colleges found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((college, index) => (
                    <tr key={college.CollegeID}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{college.Name || "N/A"}</td>
                      <td>{college.Shortform || "N/A"}</td>
                      <td>{college.City || "N/A"}</td>
                      <td>{college.CityID || "N/A"}</td>
                      <td>{formatDate(college.CreatedAt)}</td>
                      <td>{college.CreatedBy || "N/A"}</td>
                      <td className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          title="View College Details"
                          onClick={() => handleAction(college, "view")}
                          aria-label="View college details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          title="Edit College Details"
                          onClick={() => handleAction(college, "edit")}
                          aria-label="Edit college details"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Delete College"
                          onClick={() => handleAction(college, "delete")}
                          aria-label="Delete college"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="footer-buttons">
          <button
            className="footer-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="footer-btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdminManageColleges;
