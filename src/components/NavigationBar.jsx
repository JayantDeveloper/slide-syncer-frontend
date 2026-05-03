import React, { useState, useEffect } from "react";
import "../views/TeacherView.css";
import { BACKEND_BASE_URL } from "../config";

export default function NavigationBar({ leftButtons, sessionCode, editorsLocked, onToggleLock }) {
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/students`);
        const data = await res.json();
        setStudentCount(data.students?.length || 0);
      } catch (err) {
        console.error("Failed to fetch student count:", err);
      }
    };
    fetchStudentCount();
    const interval = setInterval(fetchStudentCount, 3000);
    return () => clearInterval(interval);
  }, [sessionCode]);

  const handleEndSession = async () => {
    try {
      const resp = await fetch(
        `${BACKEND_BASE_URL}/api/sessions/${sessionCode}/end`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!resp.ok) throw new Error("Failed to end session");

      const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "session-ended", sessionCode }));
        ws.close();
      };

      window.location.href = "https://www.codekiwi.tech/home";
    } catch (e) {
      console.error(e);
      alert("Could not end session. Please try again.");
    }
  };

  return (
    <div className="slide-controls">
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <img src="/codekiwilogo.png" alt="CodeKiwi" style={{ height: "28px", width: "28px", objectFit: "contain", flexShrink: 0, marginRight: "4px" }} />

        {leftButtons}

        <a
          href={`/student/${sessionCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-btn nav-btn--outline-blue"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Student View
        </a>

        <button onClick={onToggleLock} className={`nav-btn ${editorsLocked ? "nav-btn--lock-on" : "nav-btn--lock-off"}`}>
          {editorsLocked ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
          )}
          {editorsLocked ? "Unlock Editors" : "Lock Editors"}
        </button>

        <div className="student-count">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {studentCount} {studentCount === 1 ? "student" : "students"}
        </div>
      </div>

      <button className="nav-btn nav-btn--danger" onClick={handleEndSession}>
        End Session
      </button>
    </div>
  );
}
