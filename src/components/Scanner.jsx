import React, { useState, useEffect, useRef } from "react";
//import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/ManageEvent.css";
import { Html5Qrcode } from "html5-qrcode";

function Scanner({ user, signOut }) {
  // const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEventID, setSelectedEventID] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState(""); // stores last live scanned QR
  const [capturedCode, setCapturedCode] = useState(""); // stores code after capture button clicked
  const [isScanning, setIsScanning] = useState(false);

  const mockEvents = [
    { EventID: "evt001", EventTitle: "Concert Night" },
    { EventID: "evt002", EventTitle: "Art Expo" },
    { EventID: "evt003", EventTitle: "Tech Conference" },
  ];

  const html5QrCodeRef = useRef(null);
  const qrCodeRegionId = "qr-code-region";

  useEffect(() => {
    if (selectedEventID) {
      startScanner();
    } else {
      stopScanner();
      setLastScannedCode("");
      setCapturedCode("");
    }

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventID]);

  const startScanner = () => {
    if (isScanning) return;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const cameraId = devices[0].id;

          html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);

          html5QrCodeRef.current
            .start(
              cameraId,
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
              },
              (decodedText) => {
                setLastScannedCode(decodedText);
              },
              () => {
                // scan failure callback (ignore)
              }
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

  const handleCloseCamera = () => {
    stopScanner();
    setSelectedEventID("");
    setLastScannedCode("");
    setCapturedCode("");
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();

        setIsScanning(false);

        // Extra cleanup: stop all video tracks to release camera
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

  const handleEventChange = (e) => {
    setSelectedEventID(e.target.value);
  };

  const handleCaptureClick = () => {
    if (lastScannedCode) {
      setCapturedCode(lastScannedCode);
    } else {
      alert("No QR code scanned yet to capture.");
    }
  };

  return (
    <div
      className="manage-events-page"
      style={{ maxWidth: "100%", overflowX: "hidden" }}
    >
      <button
        className="sidebar-toggle md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`events-content ${isSidebarOpen ? "sidebar-open" : ""}`}
        style={{
          maxWidth: "100%",
          padding: window.innerWidth <= 767 ? "0.5rem" : "0.75rem",
          paddingTop: window.innerWidth <= 767 ? "2.5rem" : "0.75rem",
        }}
      >
        <h2 className="events-title">Ticket Scanner</h2>

        <div
          className="event-details"
          style={{ padding: window.innerWidth <= 767 ? "0.5rem" : "0.75rem" }}
        >
          <label htmlFor="event-select" style={{ fontWeight: "bold" }}>
            Select Event:
          </label>
          <select
            id="event-select"
            value={selectedEventID}
            onChange={handleEventChange}
            style={{
              marginLeft: "1rem",
              padding: "0.3rem 0.5rem",
              fontSize: window.innerWidth <= 767 ? "0.85rem" : "1rem",
            }}
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
          <>
            <div
              id={qrCodeRegionId}
              style={{
                marginTop: "1rem",
                width: "280px",
                height: "280px",
                marginLeft: "auto",
                marginRight: "auto",
                border: "2px solid #333",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            ></div>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                onClick={handleCaptureClick}
                style={{
                  padding: "0.5rem 1.2rem",
                  fontSize: "1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Capture QR Code
              </button>

              <button
                onClick={handleCloseCamera}
                style={{
                  padding: "0.5rem 1.2rem",
                  fontSize: "1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                }}
              >
                Close Camera
              </button>
            </div>
          </>
        )}

        {capturedCode && (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <label htmlFor="scan-result" style={{ fontWeight: "bold" }}>
              Captured Ticket Details:
            </label>
            <textarea
              id="scan-result"
              readOnly
              value={capturedCode}
              rows={4}
              style={{
                width: "90%",
                maxWidth: "400px",
                marginTop: "0.5rem",
                padding: "0.5rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                resize: "none",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default Scanner;
