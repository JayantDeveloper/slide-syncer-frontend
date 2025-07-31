import React, { useState, useEffect } from "react";
import "../views/TeacherView.css";
import { BACKEND_BASE_URL } from "../config";

export default function NavigationBar({ leftButtons, sessionCode }) {
  const [editorsLocked, setEditorsLocked] = useState(false);
  const [slidesUrl, setSlidesUrl] = useState("");
  const [studentCount, setStudentCount] = useState(0);

  // Fetch slides URL
  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/meta.json`)
      .then(res => res.json())
      .then(data => setSlidesUrl(data.slidesUrl))
      .catch(err => console.error("Failed to fetch meta.json:", err));
  }, [sessionCode]);

  // Poll for student count every 3 seconds
  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/students`);
        const data = await res.json();
        setStudentCount(data.students.length || 0);
      } catch (err) {
        console.error("Failed to fetch student count:", err);
      }
    };

    fetchStudentCount(); // initial
    const interval = setInterval(fetchStudentCount, 3000); // poll every 3s
    return () => clearInterval(interval);
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
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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

        <div className="student-count">
          👥 {studentCount} {studentCount === 1 ? "student" : "students"}
        </div>
      </div>

      <button
        className="end-session"
        onClick={() => {
          const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
          const ws = new WebSocket(wsUrl);

          ws.onopen = () => {
            ws.send(JSON.stringify({
              type: "session-ended",
              sessionCode,
            }));
            ws.close();

            if (slidesUrl) {
              window.location.href = slidesUrl;
            } else {
              alert("Slides URL not found. Cannot end session.");
            }
          };

          ws.onerror = (err) => {
            console.error("WebSocket error while ending session:", err);
          };
        }}
      >
        End Session
      </button>
    </div>
  );
}
