import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import "../styles/Scanner.css";
import { Html5Qrcode } from "html5-qrcode";

function Scanner({ user, signOut }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEventID, setSelectedEventID] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [capturedCode, setCapturedCode] = useState("");
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
          const backCamera = devices.find((device) =>
            /back|environment|rear/i.test(device.label)
          );
          const cameraId = backCamera ? backCamera.id : devices[0].id;

          html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);

          html5QrCodeRef.current
            .start(
              cameraId,
              {
                fps: 10,
                qrbox: { width: 180, height: 180 },
              },
              (decodedText) => {
                setLastScannedCode(decodedText);
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
    <div className="scanner-page">
      <button
        className="sidebar-toggle md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`scanner-content ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        <h2 className="scanner-title">Ticket Scanner</h2>

        <div className="event-details">
          <label htmlFor="event-select" className="event-label">
            Select Event:
          </label>
          <select
            id="event-select"
            value={selectedEventID}
            onChange={handleEventChange}
            className="event-select"
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
          <div className="scanner-section">
            <div id={qrCodeRegionId} className="qr-code-region"></div>

            <div className="buttons-container">
              <button onClick={handleCaptureClick} className="capture-btn">
                Capture QR Code
              </button>

              <button onClick={handleCloseCamera} className="close-btn">
                Close Camera
              </button>
            </div>
          </div>
        )}

        {capturedCode && (
          <div className="captured-details">
            <label htmlFor="scan-result" className="captured-label">
              Captured Ticket Details:
            </label>
            <textarea
              id="scan-result"
              readOnly
              value={capturedCode}
              rows={4}
              className="scan-result-textarea"
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default Scanner;
