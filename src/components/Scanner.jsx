import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import "../styles/Scanner.css";
import { Html5Qrcode } from "html5-qrcode";

function Scanner({ user, signOut }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEventID, setSelectedEventID] = useState("");
  const [scannedData, setScannedData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhase, setModalPhase] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const mockEvents = [
    { EventID: "evt001", EventTitle: "Concert Night" },
    { EventID: "evt002", EventTitle: "Art Expo" },
    { EventID: "evt003", EventTitle: "Tech Conference" },
  ];

  const html5QrCodeRef = useRef(null);
  const qrCodeRegionId = "qr-code-region";

  // Mock API function
  const mockApiCall = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (Math.random() < 0.8) {
          resolve({ status: 200, message: "Attendance marked successfully!" });
        } else {
          resolve({ status: 404, message: "Ticket not found or invalid." });
        }
      }, 1000);
    });
  };

  useEffect(() => {
    if (selectedEventID) {
      startScanner();
    } else {
      stopScanner();
      setScannedData(null);
    }
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventID]);

  useEffect(() => {
    if (scannedData) {
      console.log("Modal opened with scanned data:", scannedData); // Debug
      setModalOpen(true);
      setModalPhase("loading");
      setApiResult(null);
      try {
        const parsed = JSON.parse(scannedData);
        setTicketDetails({
          eventId: parsed.eventId,
          name: parsed.name,
          totalTickets: parsed.totalTickets,
        });
      } catch (error) {
        console.error("Invalid QR code data:", error);
        setTicketDetails({
          eventId: "Unknown",
          name: "Unknown",
          totalTickets: "Unknown",
        });
      }
      setTimeout(() => {
        setModalPhase("details");
      }, 1000);
    }
  }, [scannedData]);

  const startScanner = () => {
    if (isScanning) return;
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const backCamera = devices.find((device) =>
            /back|environment|rear/i.test(device.label)
          );
          const cameraId = backCamera ? backCamera.id : devices[0].id;
          html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
          html5QrCodeRef.current
            .start(
              cameraId,
              { fps: 10, qrbox: { width: 180, height: 180 } },
              (decodedText) => {
                html5QrCodeRef.current.pause();
                setScannedData(decodedText);
              },
              () => {}
            )
            .then(() => setIsScanning(true))
            .catch((err) => {
              console.error("Failed to start scanner", err);
              alert("Unable to start camera scanner.");
            });
        } else {
          alert("No cameras found on this device.");
        }
      })
      .catch((err) => {
        console.error("Error getting cameras", err);
        alert("Unable to access cameras.");
      });
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        setIsScanning(false);
        const videoElem = document.querySelector(`#${qrCodeRegionId} video`);
        if (videoElem && videoElem.srcObject) {
          const tracks = videoElem.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
          videoElem.srcObject = null;
        }
      } catch (err) {
        console.warn("Error stopping scanner or releasing camera:", err);
      }
    }
  };

  const resumeScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.resume();
      setScannedData(null);
    }
  };

  const handleEventChange = (e) => {
    setSelectedEventID(e.target.value);
  };

  const handleDiscard = () => {
    console.log("Discard button clicked"); // Debug
    setModalOpen(false);
    setModalPhase(null);
    setTicketDetails(null);
    resumeScanner();
  };

  const handleMarkAttendance = async () => {
    console.log("Mark Attendance button clicked"); // Debug
    const response = await mockApiCall();
    setApiResult({
      success: response.status === 200,
      message: response.message,
    });
    setModalPhase("result");
  };

  const handleProceed = () => {
    console.log("Proceed button clicked"); // Debug
    setModalOpen(false);
    setModalPhase(null);
    setTicketDetails(null);
    setApiResult(null);
    resumeScanner();
  };

  const handleClose = () => {
    console.log("Close button clicked"); // Debug
    setModalOpen(false);
    setModalPhase(null);
    setTicketDetails(null);
    setApiResult(null);
    stopScanner();
  };

  const renderModal = () => {
    if (!modalOpen) return null;
    let content;
    if (modalPhase === "loading") {
      content = <div>Checking Ticket...</div>;
    } else if (modalPhase === "details" && ticketDetails) {
      content = (
        <>
          <h3>Ticket Details</h3>
          <p>Event ID: {ticketDetails.eventId}</p>
          <p>Name: {ticketDetails.name}</p>
          <p>Total Tickets: {ticketDetails.totalTickets}</p>
          <button
            onClick={handleMarkAttendance}
            className="scanner-modal-btn mark-attendance"
            aria-label="Mark Attendance"
          >
            Mark Attendance
          </button>
          <button
            onClick={handleDiscard}
            className="scanner-modal-btn discard"
            aria-label="Discard"
          >
            Discard
          </button>
        </>
      );
    } else if (modalPhase === "result" && apiResult) {
      content = (
        <>
          <div className="scanner-modal-icon">
            {apiResult.success ? "✅" : "❌"}
          </div>
          <p>{apiResult.message}</p>
          <button
            onClick={handleProceed}
            className="scanner-modal-btn proceed"
            aria-label="Proceed"
          >
            Proceed
          </button>
          <button
            onClick={handleClose}
            className="scanner-modal-btn close"
            aria-label="Close"
          >
            Close
          </button>
        </>
      );
    }

    return (
      <>
        <div className="scanner-modal-overlay" role="presentation" />
        <div className="scanner-modal" onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
      </>
    );
  };

  return (
    <div className="scanner-page">
      <button
        className="sidebar-toggle md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle Sidebar"
      >
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`scanner-content ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        <h2 className="scanner-title">Ticket Scanner</h2>
        <div className="scanner-event-details">
          <label htmlFor="event-select" className="scanner-event-label">
            Select Event:
          </label>
          <select
            id="event-select"
            value={selectedEventID}
            onChange={handleEventChange}
            className="scanner-event-select"
            aria-label="Select Event"
          >
            <option value="">-- Select an event --</option>
            {mockEvents.map((event) => (
              <option key={event.EventID} value={event.EventID}>
                {event.EventTitle}
              </option>
            ))}
          </select>
        </div>
        {selectedEventID && (
          <div className="scanner-qr-section">
            <div id={qrCodeRegionId} className="qr-code-region"></div>
            <div className="scanner-buttons-container">
              <button
                onClick={handleClose}
                className="scanner-close-btn"
                aria-label="Close Camera"
              >
                Close Camera
              </button>
            </div>
          </div>
        )}
      </main>
      {renderModal()}
    </div>
  );
}

export default Scanner;
