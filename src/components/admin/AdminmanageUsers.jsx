import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./AdminSidebar";
import "../admin/styles/AdminManageUsers.css"; //"../styles/AdminManageUsers.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEdit,
  faTrash,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

// Mock Data for Users
const mockUsers = [
  {
    UserID: "72a504a4-4071-7079-a4d7-c7103a9c7fe2",
    FirstName: "Ravi",
    LastName: "Ambar",
    Email: "ravi.ambar@gmail.com",
    PhoneNumber: "+919860719197",
    City: "Pune",
    role: "user,organizer",
    CreatedAt: "2025-03-19T11:55:53.468Z",
    IsDeleted: false,
  },
  {
    UserID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    FirstName: "Priya",
    LastName: "Sharma",
    Email: "priya.sharma@gmail.com",
    PhoneNumber: "+919876543210",
    City: "Mumbai",
    role: "user",
    CreatedAt: "2025-03-20T09:30:00.000Z",
    IsDeleted: false,
  },
  {
    UserID: "b2c3d4e5-f6a7-8901-bcde-f2345678901",
    FirstName: "Amit",
    LastName: "Patel",
    Email: "amit.patel@yahoo.com",
    PhoneNumber: "+918888777666",
    City: "Delhi",
    role: "organizer",
    CreatedAt: "2025-03-18T14:45:00.000Z",
    IsDeleted: false,
  },
  // Add 12 more users
  ...Array.from({ length: 12 }, (_, i) => ({
    UserID: `user-${i + 3}-${Math.random().toString(36).substr(2, 9)}`,
    FirstName: `User${i + 3}`,
    LastName: `Test${i + 3}`,
    Email: `user${i + 3}.test${i + 3}@gmail.com`,
    PhoneNumber: `+919${Math.floor(100000000 + Math.random() * 900000000)}`,
    City: ["Pune", "Mumbai", "Delhi", "Bangalore"][i % 4],
    role: ["user", "organizer", "user,organizer"][i % 3],
    CreatedAt: `2025-03-${20 - (i % 5)}T${String(10 + (i % 6)).padStart(
      2,
      "0"
    )}:00:00.000Z`,
    IsDeleted: false,
  })),
];

// Mock Data for Organizers
const mockOrganizers = [
  {
    OrganizerID: "google_115751856932696261052",
    OrganizerName: "Elevate Hub",
    contactPerson: "Sujata",
    contactEmail: "test@gmail.com",
    contactNumber: "9860719197",
    cityName: "Pune",
    createdAt: "2025-03-27T05:34:55.575Z",
    publishedEvent: 9,
    IsDeleted: false,
  },
  {
    OrganizerID: "org_223344556677889900",
    OrganizerName: "Innovate Events",
    contactPerson: "Rahul",
    contactEmail: "rahul@innovate.com",
    contactNumber: "9876543210",
    cityName: "Mumbai",
    createdAt: "2025-03-26T08:20:00.000Z",
    publishedEvent: 5,
    IsDeleted: false,
  },
  {
    OrganizerID: "org_334455667788990011",
    OrganizerName: "Tech Summit",
    contactPerson: "Anjali",
    contactEmail: "anjali@techsummit.org",
    contactNumber: "8765432109",
    cityName: "Bangalore",
    createdAt: "2025-03-25T12:15:00.000Z",
    publishedEvent: 12,
    IsDeleted: false,
  },
  // Add 7 more organizers
  ...Array.from({ length: 7 }, (_, i) => ({
    OrganizerID: `org-${i + 3}-${Math.random().toString(36).substr(2, 9)}`,
    OrganizerName: `Org${i + 3} Events`,
    contactPerson: `Contact${i + 3}`,
    contactEmail: `org${i + 3}@events.com`,
    contactNumber: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    cityName: ["Pune", "Mumbai", "Delhi", "Bangalore"][i % 4],
    createdAt: `2025-03-${27 - (i % 5)}T${String(9 + (i % 12)).padStart(
      2,
      "0"
    )}:00:00.000Z`,
    publishedEvent: Math.floor(Math.random() * 20),
    IsDeleted: false,
  })),
];

function AdminManageUsers({ user, signOut }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
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
      if (activeTab === "users") {
        setUsers(mockUsers.filter((user) => !user.IsDeleted));
      } else {
        setOrganizers(mockOrganizers.filter((org) => !org.IsDeleted));
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      setError(`Failed to load ${activeTab}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [activeTab, fetchData]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
  };

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

  const handleAction = async (item, action, type) => {
    const idField = type === "users" ? "UserID" : "OrganizerID";
    const displayName =
      type === "users"
        ? `${item.FirstName} ${item.LastName}`
        : item.OrganizerName;

    if (action === "view") {
      navigate(
        type === "users"
          ? `/admin/user/${item[idField]}`
          : `/admin/organizer/${item[idField]}`
      );
    } else if (action === "edit") {
      navigate(
        type === "users"
          ? `/admin/edit-user/${item[idField]}`
          : `/admin/edit-organizer/${item[idField]}`
      );
    } else if (action === "delete") {
      if (!window.confirm(`Are you sure you want to delete ${displayName}?`))
        return;
      setIsLoading(true);
      try {
        // Simulate soft delete by updating mock data
        if (type === "users") {
          setUsers((prev) =>
            prev.map((user) =>
              user.UserID === item.UserID ? { ...user, IsDeleted: true } : user
            )
          );
        } else {
          setOrganizers((prev) =>
            prev.map((org) =>
              org.OrganizerID === item.OrganizerID
                ? { ...org, IsDeleted: true }
                : org
            )
          );
        }
        alert(`${displayName} deleted successfully.`);
        fetchData(); // Refresh to filter out deleted items
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
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
    return items.filter((item) => {
      if (activeTab === "users") {
        const fullName = `${item.FirstName} ${item.LastName}`.toLowerCase();
        return (
          fullName.includes(searchQuery.toLowerCase()) ||
          item.Email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        return (
          item.OrganizerName.toLowerCase().includes(
            searchQuery.toLowerCase()
          ) ||
          item.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    });
  };

  const sortItems = (items) => {
    if (!sortConfig.key) return items;
    return [...items].sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === "fullName") {
        aValue = `${a.FirstName} ${a.LastName}`;
        bValue = `${b.FirstName} ${b.LastName}`;
      }
      return aValue > bValue ? direction : -direction;
    });
  };

  const items = activeTab === "users" ? users : organizers;
  const filteredItems = filterItems(items);
  const sortedItems = sortItems(filteredItems);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="admin-manage-users-page">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main className={`users-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <h2 className="users-title">Admin Manage Users</h2>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => handleTabChange("users")}
            aria-label="View users list"
          >
            Users
          </button>
          <button
            className={`tab-btn ${activeTab === "organizers" ? "active" : ""}`}
            onClick={() => handleTabChange("organizers")}
            aria-label="View organizers list"
          >
            Organizers
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder={`Search ${
              activeTab === "users" ? "users" : "organizers"
            } by name or email...`}
            value={searchQuery}
            onChange={handleSearch}
            aria-label={`Search ${
              activeTab === "users" ? "users" : "organizers"
            }`}
          />
        </div>

        {/* Table Section */}
        <div className="users-section">
          <h3 className="users-subtitle">
            {activeTab === "users" ? "Users List" : "Organizers List"}
          </h3>
          <div className="table-wrapper">
            <table
              className={
                activeTab === "users" ? "users-table" : "organizers-table"
              }
            >
              <thead>
                <tr>
                  <th scope="col" onClick={() => handleSort("id")}>
                    Sr.No.
                  </th>
                  {activeTab === "users" ? (
                    <>
                      <th scope="col" onClick={() => handleSort("fullName")}>
                        Full Name
                      </th>
                      <th scope="col" onClick={() => handleSort("Email")}>
                        Email
                      </th>
                      <th scope="col" onClick={() => handleSort("PhoneNumber")}>
                        Phone
                      </th>
                      <th scope="col" onClick={() => handleSort("City")}>
                        City
                      </th>
                      <th scope="col" onClick={() => handleSort("role")}>
                        Role
                      </th>
                      <th scope="col" onClick={() => handleSort("CreatedAt")}>
                        Created At
                      </th>
                    </>
                  ) : (
                    <>
                      <th
                        scope="col"
                        onClick={() => handleSort("OrganizerName")}
                      >
                        Organizer Name
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("contactPerson")}
                      >
                        Contact Person
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("contactEmail")}
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("contactNumber")}
                      >
                        Phone
                      </th>
                      <th scope="col" onClick={() => handleSort("cityName")}>
                        City
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("publishedEvent")}
                      >
                        Published Events
                      </th>
                      <th scope="col" onClick={() => handleSort("createdAt")}>
                        Created At
                      </th>
                    </>
                  )}
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === "users" ? 8 : 9}
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No {activeTab === "users" ? "users" : "organizers"} found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr
                      key={
                        item[activeTab === "users" ? "UserID" : "OrganizerID"]
                      }
                    >
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      {activeTab === "users" ? (
                        <>
                          <td>{`${item.FirstName} ${item.LastName}`}</td>
                          <td>{item.Email || "N/A"}</td>
                          <td>{item.PhoneNumber || "N/A"}</td>
                          <td>{item.City || "N/A"}</td>
                          <td>{item.role || "N/A"}</td>
                          <td>{formatDate(item.CreatedAt)}</td>
                        </>
                      ) : (
                        <>
                          <td>{item.OrganizerName || "N/A"}</td>
                          <td>{item.contactPerson || "N/A"}</td>
                          <td>{item.contactEmail || "N/A"}</td>
                          <td>{item.contactNumber || "N/A"}</td>
                          <td>{item.cityName || "N/A"}</td>
                          <td>{item.publishedEvent || 0}</td>
                          <td>{formatDate(item.createdAt)}</td>
                        </>
                      )}
                      <td className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          title={`View ${
                            activeTab === "users" ? "User" : "Organizer"
                          } Details`}
                          onClick={() => handleAction(item, "view", activeTab)}
                          aria-label={`View ${
                            activeTab === "users" ? "user" : "organizer"
                          } details`}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          title={`Edit ${
                            activeTab === "users" ? "User" : "Organizer"
                          } Details`}
                          onClick={() => handleAction(item, "edit", activeTab)}
                          aria-label={`Edit ${
                            activeTab === "users" ? "user" : "organizer"
                          } details`}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title={`Delete ${
                            activeTab === "users" ? "User" : "Organizer"
                          }`}
                          onClick={() =>
                            handleAction(item, "delete", activeTab)
                          }
                          aria-label={`Delete ${
                            activeTab === "users" ? "user" : "organizer"
                          }`}
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

export default AdminManageUsers;
