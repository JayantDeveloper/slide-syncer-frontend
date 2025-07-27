import React, { useState, useEffect } from "react";
import "../views/TeacherView.css";
import { BACKEND_BASE_URL } from "../config";

export default function NavigationBar({ leftButtons, sessionCode }) {
  const [editorsLocked, setEditorsLocked] = useState(false);
  const [slidesUrl, setSlidesUrl] = useState("");

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/meta.json`)
      .then(res => res.json())
      .then(data => setSlidesUrl(data.slidesUrl))
      .catch(err => console.error("Failed to fetch meta.json:", err));
  }, [sessionCode]);

  const toggleLock = () => {
    const newLocked = !editorsLocked;
    setEditorsLocked(newLocked);

    const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "lock-editors",
        sessionCode,
        locked: newLocked
      }));
      ws.close();
    };

    ws.onerror = (err) => {
      console.error("WebSocket error while locking:", err);
    };
  };

  return (
    <div className="slide-controls">
      <div style={{ display: "flex", gap: "12px" }}>
        {leftButtons}
        <a
          href={`/student/${sessionCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="student-link"
        >
          Student View
        </a>
        <button onClick={toggleLock} className="teacher-button">
          {editorsLocked ? "Unlock Editors" : "Lock Editors"}
        </button>
      </div>
      <button
        className="end-session"
        onClick={() => {
          if (slidesUrl) {
            window.location.href = slidesUrl;
          } else {
            alert("Slides URL not found. Cannot end session.");
          }
        }}
      >
        End Session
      </button>
    </div>
  );
}
