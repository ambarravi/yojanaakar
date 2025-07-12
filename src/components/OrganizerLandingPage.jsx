import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/OrganizerLandingPage.css";
import { isSameDay } from "date-fns";
import { fetchDashboardData } from "../api/eventApi";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function OrganizerLandingPage({ user, signOut }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error.message);
      }
    };

    loadDashboardData();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!dashboardData) {
    return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  }

  const pieChartData = {
    labels: dashboardData.ticketSales?.labels || [],
    datasets: [
      {
        data: dashboardData.ticketSales?.data || [],
        backgroundColor: ["#0d9488", "#34d399"],
        borderWidth: 1,
        borderColor: "#ffffff",
      },
    ],
  };

  const popularEventsData = {
    labels: dashboardData.popularEvents?.labels || [],
    datasets: [
      {
        label: "Attendees",
        data: dashboardData.popularEvents?.data || [],
        backgroundColor: ["#93C5FD", "#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 1,
        borderColor: "#ffffff",
      },
    ],
  };

  const handleSeeAllFeedback = () => {
    console.log("See all feedback clicked");
  };

  return (
    <div className="tikties-dashboard flex min-h-screen bg-gray-50 font-sans">
      <button
        className="dashboard-sidebar-toggle md:hidden p-3"
        onClick={toggleSidebar}
      >
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`dashboard-content flex-1 p-4 sm:p-6 ${
          isSidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <header className="dashboard-header mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Hi, Welcome back!
          </h1>
        </header>

        <section className="dashboard-main">
          <div className="dashboard-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div className="dashboard-card bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-600">
                Total Events
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                {dashboardData.totalEvents}
              </p>
            </div>
            <div className="dashboard-card bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-600">
                Total Followers
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                {dashboardData.totalFollowers}
              </p>
            </div>
            <div className="dashboard-card bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-600">
                Total Engagement
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                {dashboardData.totalEngagement}
              </p>
            </div>
          </div>

          <hr className="border-gray-300 mb-6" />

          <div className="ticket-sales-grid grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="dashboard-card ticket-sales bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">
                  Total Ticket Sales
                </h3>
                <div className="w-full h-32 sm:h-40">
                  <Pie
                    data={pieChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="dashboard-card bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">
                  Event Calendar
                </h3>
                <div className="w-full max-w-[400px] mx-auto h-32 sm:h-40">
                  <Calendar
                    onChange={setCalendarDate}
                    value={calendarDate}
                    tileClassName={({ date }) =>
                      dashboardData.eventDates?.some((eventDate) =>
                        isSameDay(date, new Date(eventDate))
                      )
                        ? "event-date"
                        : ""
                    }
                    tileContent={({ date }) => {
                      const event = dashboardData.eventDates?.find(
                        (eventDate) => isSameDay(date, new Date(eventDate))
                      );
                      return event ? (
                        <span className="event-indicator" title="Event"></span>
                      ) : null;
                    }}
                    className="custom-calendar w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="dashboard-card bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">
                  Popular Events
                </h3>
                <div className="w-full h-32 sm:h-40">
                  <Doughnut
                    key={Date.now()}
                    data={popularEventsData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            boxWidth: 12,
                            padding: 10,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="dashboard-card bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">
                  Upcoming Events
                </h3>
                <table className="dashboard-table upcoming-events w-full text-left text-sm sm:text-base">
                  <tbody>
                    {dashboardData.upcomingEventsList?.map((event, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2 pr-2">{event.title}</td>
                        <td className="py-2 text-gray-600">{event.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="dashboard-card feedback-card bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200 mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">
              What Attendees Are Saying
            </h3>
            <table className="dashboard-table feedback-table w-full text-left text-sm">
              <tbody>
                {dashboardData.feedback?.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 pr-2">{item.comment}</td>
                    <td className="py-2 text-gray-500">{item.event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="see-all-link text-sm font-medium mt-4 inline-block text-indigo-600 hover:text-indigo-800 transition-colors"
              onClick={handleSeeAllFeedback}
              aria-label="See all feedback"
            >
              See all
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OrganizerLandingPage;
