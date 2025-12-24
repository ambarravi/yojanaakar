import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./Sidebar";
import QRCode from "qrcode";
import templateImage from "../assets/images/certificate/Blue_and_white_elegant.png";
import templateLogo from "../assets/images/org_logo2.jpg";
import "../styles/Certificate.css";
import "@fontsource/alex-brush";
import { fetchEventDetailsByOrgID, issueCertificates } from "../api/eventApi";

// Certificate template metadata
const templateMetadata = {
  templateId: "canva_1757420695923",
  name: "Blue_and_white_elegant",
  backgroundUrl: templateImage,
  dimensions: { width: 2000, height: 1414 },
  placeholders: [
    {
      id: "certificate_info",
      type: "text",
      position: { x: 740, y: 505 },
      style: {
        fontSize: 40,
        fontFamily: "Merriweather",
        color: "#1e3a8a",
        align: "start",
      },
      maxWidth: 800,
      lineHeight: 60,
    },
    {
      id: "student_name",
      type: "text",
      position: { x: 740, y: 650 },
      style: {
        fontSize: 100,
        fontFamily: "Alex Brush",
        color: "#06073dff",
        align: "start",
      },
      maxWidth: 1000,
      lineHeight: 60,
    },
    {
      id: "event_name",
      type: "text",
      position: { x: 740, y: 792 },
      style: {
        fontSize: 40,
        fontFamily: "Merriweather",
        fontWeight: 700,
        color: "#1e3a8a",
        align: "start",
      },
      maxWidth: 1000,
      lineHeight: 70,
    },
    {
      id: "qr_code",
      type: "qr",
      position: { x: 1730, y: 1165 },
      style: {
        fontSize: 24,
        fontFamily: "Arial",
        color: "#272142ff",
        align: "center",
      },
      size: { width: 100, height: 100 },
    },
    {
      id: "logo",
      type: "image",
      position: { x: 250, y: 1018 },
      size: { width: 200, height: 200 },
      style: {
        radius: 100,
      },
    },
    {
      id: "note",
      type: "text",
      position: { x: 1300, y: 1230 },
      style: {
        fontSize: 15,
        fontFamily: "Merriweather",
        color: "#07080eff",
        align: "start",
      },
      maxWidth: 1000,
      lineHeight: 70,
    },
  ],
};

// Utility function to wrap text
const wrapText = (ctx, text, maxWidth, fontSize, fontFamily) => {
  ctx.font = `${fontSize}px ${fontFamily}`;
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name) => {
  const nameRegex = /^[A-Za-z\s]+$/;
  return name && nameRegex.test(name) && name.trim().length >= 2;
};

function Certificate({ user, signOut }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [error, setError] = useState("");
  const [limitError, setLimitError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("design");
  const [customFields, setCustomFields] = useState({
    event_name: "",
    certificate_info: "",
  });
  const [manualAttendees, setManualAttendees] = useState([]);
  const [currentAttendee, setCurrentAttendee] = useState({
    name: "",
    email: "",
  });
  const [currentErrors, setCurrentErrors] = useState({
    nameError: "",
    emailError: "",
  });
  const [showLogo, setShowLogo] = useState(true);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const canvasRef = useRef(null);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success || error || limitError) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
        setLimitError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, limitError]);

  // Format date for display
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Check certificate limit for selected event
  useEffect(() => {
    if (!selectedEvent) {
      setLimitExceeded(false);
      setLimitError("");
      return;
    }

    const event = events.find((e) => e.EventID === selectedEvent);
    if (!event) return;

    const seats = event.Seats || 0;
    const issuedCount = event.CertificateIssuedCount || 0;
    const limit = Math.round(seats * 0.15);
    const exceeded = issuedCount >= limit;

    setLimitExceeded(exceeded);

    if (exceeded) {
      setLimitError(
        `Total certificate count is ${issuedCount} which has reached the limit of ${limit}.`
      );
    } else {
      setLimitError("");
    }
  }, [selectedEvent, events]);

  // Fetch events from API
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const result = await fetchEventDetailsByOrgID();
      console.log("API Response:", result.items);
      // Filter events for Published status and today/tomorrow
      const today = new Date();
      const filteredEvents = result.items.filter((event) => {
        const eventDate = new Date(event.EventDate);
        return event.EventStatus === "Published" && eventDate <= today;
      });

      console.log("filteredEvents", filteredEvents);
      setEvents(filteredEvents);
      // Set default selected event if available
      if (filteredEvents.length > 0) {
        setSelectedEvent(filteredEvents[0].EventID);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Unable to load events. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Initialize custom fields when event changes
  useEffect(() => {
    const selectedEventData =
      events.find((e) => e.EventID === selectedEvent) || events[0];
    if (selectedEventData) {
      setCustomFields({
        event_name: `Who have participated in ${
          selectedEventData.EventTitle
        } ,Hosted by the Tech Innovate Group on ${formatDate(
          selectedEventData.EventDate
        )}  `,
        certificate_info: "This Certificate is Proudly presented to",
      });
    }
  }, [selectedEvent, events]);

  // Memoized renderCertificate function
  const renderCertificate = useCallback(
    async (
      canvas,
      scaleX = 1,
      scaleY = 1,
      attendeeName = "John Alexander Smith"
    ) => {
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = templateMetadata.backgroundUrl;

      const loadBackground = new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load template image"));
      });

      const imagePromises = [];

      return new Promise((resolve, reject) => {
        loadBackground
          .then(async () => {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const sampleData = {
              student_name: attendeeName,
              event_name: customFields.event_name,
              qr_code: `https://example.com/certificate/verify/${selectedEvent}`,
              certificate_info: customFields.certificate_info,
              logo: showLogo ? templateLogo : null,
              note: "This certificate has been issued digitally through Tikties.com",
            };

            let qrCodeUrl = "";
            try {
              qrCodeUrl = await QRCode.toDataURL(sampleData.qr_code, {
                width:
                  templateMetadata.placeholders.find((p) => p.id === "qr_code")
                    .size.width * scaleX,
                margin: 1,
              });
            } catch (err) {
              setError("Failed to generate QR code.");
              console.error("QR code generation failed:", err);
              reject(err);
              return;
            }

            templateMetadata.placeholders.forEach((placeholder) => {
              if (placeholder.type === "text") {
                const scaledFontSize = placeholder.style.fontSize * scaleX;
                const scaledMaxWidth = placeholder.maxWidth
                  ? placeholder.maxWidth * scaleX
                  : canvas.width;
                const scaledLineHeight = placeholder.lineHeight
                  ? placeholder.lineHeight * scaleY
                  : scaledFontSize * 1.2;

                ctx.font = `${scaledFontSize}px ${placeholder.style.fontFamily}`;
                ctx.fillStyle = placeholder.style.color;
                ctx.textAlign = placeholder.style.align;
                ctx.textBaseline = "top";

                const text = sampleData[placeholder.id] || "";
                const lines = wrapText(
                  ctx,
                  text,
                  scaledMaxWidth,
                  scaledFontSize,
                  placeholder.style.fontFamily
                );

                lines.forEach((line, index) => {
                  ctx.fillText(
                    line,
                    placeholder.position.x * scaleX,
                    placeholder.position.y * scaleY + index * scaledLineHeight
                  );
                });
              } else if (placeholder.type === "qr" && qrCodeUrl) {
                const qrImg = new Image();
                qrImg.src = qrCodeUrl;
                const qrPromise = new Promise((resolve, reject) => {
                  qrImg.onload = () => {
                    ctx.drawImage(
                      qrImg,
                      placeholder.position.x * scaleX,
                      placeholder.position.y * scaleY,
                      placeholder.size.width * scaleX,
                      placeholder.size.height * scaleY
                    );
                    resolve();
                  };
                  qrImg.onerror = () =>
                    reject(new Error("Failed to load QR code image"));
                });
                imagePromises.push(qrPromise);
              } else if (
                placeholder.type === "image" &&
                sampleData[placeholder.id]
              ) {
                const logoImg = new Image();
                logoImg.src = sampleData[placeholder.id];
                const logoPromise = new Promise((resolve, reject) => {
                  logoImg.onload = () => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(
                      placeholder.position.x * scaleX +
                        (placeholder.size.width * scaleX) / 2,
                      placeholder.position.y * scaleY +
                        (placeholder.size.height * scaleY) / 2,
                      placeholder.style.radius * scaleX,
                      0,
                      Math.PI * 2
                    );
                    ctx.clip();
                    ctx.drawImage(
                      logoImg,
                      placeholder.position.x * scaleX,
                      placeholder.position.y * scaleY,
                      placeholder.size.width * scaleX,
                      placeholder.size.height * scaleY
                    );
                    ctx.restore();
                    resolve();
                  };
                  logoImg.onerror = () =>
                    reject(new Error("Failed to load logo image"));
                });
                imagePromises.push(logoPromise);
              }
            });

            await Promise.all(imagePromises);
            resolve();
          })
          .catch((err) => {
            setError("Failed to load certificate template image.");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
              "Failed to load template image",
              canvas.width / 2,
              canvas.height / 2
            );
            reject(err);
          });
      });
    },
    [selectedEvent, customFields, showLogo]
  );

  // Draw certificate preview on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasWidth = 600;
    const canvasHeight =
      (templateMetadata.dimensions.height / templateMetadata.dimensions.width) *
      canvasWidth;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const scaleX = canvasWidth / templateMetadata.dimensions.width;
    const scaleY = canvasHeight / templateMetadata.dimensions.height;

    renderCertificate(canvas, scaleX, scaleY).catch((err) => {
      console.error("Preview rendering failed:", err);
    });
  }, [selectedEvent, customFields, showLogo, renderCertificate]);

  // Handle download sample certificate
  const handleDownloadSample = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = templateMetadata.dimensions.width;
    canvas.height = templateMetadata.dimensions.height;

    try {
      await renderCertificate(canvas, 1, 1);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1.0);
      link.download = `sample_certificate_${selectedEvent}.png`;
      link.click();
    } catch (err) {
      setError("Failed to generate sample certificate for download.");
      console.error("Download rendering failed:", err);
    }
  };

  // Handle current attendee input changes with validation
  const handleCurrentAttendeeChange = (field, value) => {
    setCurrentAttendee((prev) => ({ ...prev, [field]: value }));

    if (field === "name") {
      if (!validateName(value)) {
        setCurrentErrors((prev) => ({
          ...prev,
          nameError:
            value.trim() === ""
              ? "Name is required"
              : "Name must contain only letters and spaces, minimum 2 characters",
        }));
      } else {
        setCurrentErrors((prev) => ({ ...prev, nameError: "" }));
      }
    } else if (field === "email") {
      if (!validateEmail(value)) {
        setCurrentErrors((prev) => ({
          ...prev,
          emailError:
            value.trim() === "" ? "Email is required" : "Invalid email format",
        }));
      } else {
        setCurrentErrors((prev) => ({ ...prev, emailError: "" }));
      }
    }
  };

  // Add current attendee to list
  const handleAddCurrentAttendee = () => {
    const { name, email } = currentAttendee;
    let hasErrors = false;

    if (!name || !validateName(name)) {
      setCurrentErrors((prev) => ({
        ...prev,
        nameError:
          name.trim() === ""
            ? "Name is required"
            : "Name must contain only letters and spaces, minimum 2 characters",
      }));
      hasErrors = true;
    }
    if (!email || !validateEmail(email)) {
      setCurrentErrors((prev) => ({
        ...prev,
        emailError:
          email.trim() === "" ? "Email is required" : "Invalid email format",
      }));
      hasErrors = true;
    }

    if (hasErrors) {
      setError("Please correct the errors before adding the attendee.");
      return;
    }

    if (manualAttendees.length >= 10) {
      setError("Maximum of 10 manual attendees can be added.");
      return;
    }

    setManualAttendees((prev) => [...prev, { name, email }]);
    setCurrentAttendee({ name: "", email: "" });
    setCurrentErrors({ nameError: "", emailError: "" });
    setError("");
  };

  // Remove attendee from list
  const handleRemoveAttendee = (index) => {
    setManualAttendees((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle bulk certificate issuance
  const handleIssueCertificates = async () => {
    setError("");
    setSuccess("");

    const selectedEventData =
      events.find((e) => e.EventID === selectedEvent) || events[0];
    if (!selectedEventData) {
      setError("No event selected or available.");
      return;
    }

    // Prepare payload
    const payload = {
      eventId: selectedEvent,
      eventName: customFields.event_name,
      certificateInfo: customFields.certificate_info,
      showLogo: showLogo,
      attendees: [...(selectedEventData.attendees || []), ...manualAttendees],
    };

    setLoading(true);

    try {
      const result = await issueCertificates(payload);
      const message =
        result.message ||
        "Certificate request accepted! Processing in the background.";

      setSuccess(message);
      console.log("Success:", result);
    } catch (err) {
      const errorMsg =
        err.message || "Error issuing certificates. Please try again.";
      setError(errorMsg);
      console.error("API call failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="certificate-page">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="text-gray-700 font-medium">Loading events...</p>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      {(success || error || limitError) && (
        <div className={`message-modal ${success ? "success" : "error"}`}>
          <div className="message-modal-content">
            <div className="message-icon">{success ? "✓" : "⚠"}</div>
            <h3 className="message-title">{success ? "Success!" : "Error!"}</h3>
            <p className="message-text">{success || error || limitError}</p>
            <button
              className="message-close"
              onClick={() => {
                setSuccess("");
                setError("");
                setLimitError("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle navigation sidebar"
        disabled={isLoading}
      >
        ☰
      </button>
      <Sidebar user={user} signOut={signOut} isOpen={isSidebarOpen} />
      <main
        className={`certificate-content ${isSidebarOpen ? "sidebar-open" : ""}`}
        style={{ pointerEvents: isLoading ? "none" : "auto" }}
      >
        <div className="certificate-header">
          <h2 className="certificate-title">Issue Certificate</h2>
        </div>

        <div className="certificate-controls">
          <label htmlFor="event-select" className="certificate-event-label">
            Select Event
          </label>
          <select
            id="event-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="certificate-event-select"
            aria-label="Select an event for certificate issuance"
            disabled={isLoading}
          >
            <option value="">-- Select an event --</option>
            {events.map((event) => (
              <option key={event.EventID} value={event.EventID}>
                {event.EventTitle} - {formatDate(event.EventDate)} (
                {event.SeatsBooked || 0} participants,{" "}
                {event.CertificateIssuedCount || 0} certificates issued)
              </option>
            ))}
          </select>
        </div>
        <div className="certificate-tabs">
          <button
            className={`tab-button ${activeTab === "design" ? "active" : ""}`}
            onClick={() => setActiveTab("design")}
            aria-label="View Design and Preview tab"
            disabled={isLoading}
          >
            Design & Preview
          </button>
          <button
            className={`tab-button ${
              activeTab === "attendees" ? "active" : ""
            }`}
            onClick={() => setActiveTab("attendees")}
            aria-label="View Add Attendees and Issue tab"
            disabled={isLoading}
          >
            Add Attendees & Issue
          </button>
        </div>
        {activeTab === "design" && (
          <div className="tab-content">
            <div className="certificate-customization">
              <h3>Customize Certificate Details</h3>
              <div className="form-group">
                <label htmlFor="display-logo">
                  Display logo on certificate
                </label>
                <input
                  type="checkbox"
                  id="display-logo"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  aria-label="Toggle logo display on certificate"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="event-description">Event Description</label>
                <textarea
                  id="event-description"
                  value={customFields.event_name}
                  onChange={(e) =>
                    setCustomFields({
                      ...customFields,
                      event_name: e.target.value.slice(0, 200),
                    })
                  }
                  maxLength={200}
                  placeholder="Enter event description"
                  aria-label="Edit event description for certificate"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="presentation-text">Presentation Text</label>
                <textarea
                  id="presentation-text"
                  value={customFields.certificate_info}
                  onChange={(e) =>
                    setCustomFields({
                      ...customFields,
                      certificate_info: e.target.value.slice(0, 100),
                    })
                  }
                  maxLength={100}
                  placeholder="Enter presentation text"
                  aria-label="Edit presentation text for certificate"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="certificate-preview-container">
              <h3 className="certificate-preview-title">Certificate Preview</h3>
              <div className="certificate-canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  className="certificate-template-canvas"
                  aria-label="Preview of Blue and White Elegant certificate with sample text"
                />
              </div>
              <button
                onClick={handleDownloadSample}
                className="certificate-download-button"
                aria-label="Download sample certificate"
                disabled={isLoading}
              >
                Download Sample Certificate
              </button>
            </div>
          </div>
        )}
        {activeTab === "attendees" && (
          <div className="tab-content">
            <div className="manual-attendees">
              <p className="instructional-note">
                You can add up to 10 attendee details one by one in case they
                were missed on the event's booking list.
              </p>
              <h3>Add Attendee</h3>
              <div className="attendee-input-row">
                <div className="form-group">
                  <label htmlFor="attendee-name">Attendee Name</label>
                  <input
                    type="text"
                    id="attendee-name"
                    placeholder="Attendee Name"
                    value={currentAttendee.name}
                    onChange={(e) =>
                      handleCurrentAttendeeChange("name", e.target.value)
                    }
                    aria-label="Enter name for attendee"
                    className={currentErrors.nameError ? "input-error" : ""}
                    disabled={isLoading}
                  />
                  {currentErrors.nameError && (
                    <p className="input-error-message">
                      {currentErrors.nameError}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="attendee-email">Attendee Email</label>
                  <input
                    type="email"
                    id="attendee-email"
                    placeholder="Attendee Email"
                    value={currentAttendee.email}
                    onChange={(e) =>
                      handleCurrentAttendeeChange("email", e.target.value)
                    }
                    aria-label="Enter email for attendee"
                    className={currentErrors.emailError ? "input-error" : ""}
                    disabled={isLoading}
                  />
                  {currentErrors.emailError && (
                    <p className="input-error-message">
                      {currentErrors.emailError}
                    </p>
                  )}
                </div>
                <button
                  className="add-attendee-button"
                  onClick={handleAddCurrentAttendee}
                  disabled={
                    manualAttendees.length >= 10 ||
                    currentErrors.nameError ||
                    currentErrors.emailError ||
                    !currentAttendee.name.trim() ||
                    !currentAttendee.email.trim() ||
                    isLoading
                  }
                  aria-label="Add attendee"
                >
                  ADD
                </button>
              </div>
              {manualAttendees.length > 0 && (
                <div className="attendees-table-container">
                  <h4>Added Attendees ({manualAttendees.length}/10)</h4>
                  <div className="overflow-x-auto">
                    <table className="attendees-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manualAttendees.map((attendee, index) => (
                          <tr key={index}>
                            <td>{attendee.name}</td>
                            <td>{attendee.email}</td>
                            <td>
                              <button
                                className="remove-attendee"
                                onClick={() => handleRemoveAttendee(index)}
                                aria-label={`Remove attendee ${index + 1}`}
                                disabled={isLoading}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="issue-certificates-section">
              <button
                className="issue-certificates-button"
                onClick={handleIssueCertificates}
                disabled={
                  loading || !selectedEvent || isLoading || limitExceeded
                }
                aria-label={
                  loading
                    ? "Issuing certificates..."
                    : limitExceeded
                    ? "Cannot issue: certificate limit reached"
                    : "Issue certificates to all attendees"
                }
                aria-busy={loading}
              >
                {loading ? (
                  <>Processing...</>
                ) : limitExceeded ? (
                  "Issue Certificates (Limit Reached)"
                ) : (
                  "Issue Certificates to All Attendees"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Certificate;
