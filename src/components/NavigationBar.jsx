import React, { useState, useEffect } from "react";
import "../views/TeacherView.css";
import { BACKEND_BASE_URL } from "../config";

export default function NavigationBar({ leftButtons, sessionCode, editorsLocked, onToggleLock }) {
  const [slidesUrl, setSlidesUrl] = useState("");
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/meta.json`)
      .then((res) => res.json())
      .then((data) => setSlidesUrl(data.slidesUrl))
      .catch((err) => console.error("Failed to fetch meta.json:", err));
  }, [sessionCode]);

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

      if (slidesUrl) {
        window.location.href = slidesUrl;
      } else {
        alert("Session ended. No Slides URL found for redirect.");
      }
    } catch (e) {
      console.error(e);
      alert("Could not end session. Please try again.");
    }
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
        <button onClick={onToggleLock} className="teacher-button">
          {editorsLocked ? "Unlock Editors" : "Lock Editors"}
        </button>
        <div className="student-count">
          👥 {studentCount} {studentCount === 1 ? "student" : "students"}
        </div>
      </div>
      <button className="end-session" onClick={handleEndSession}>
        End Session
      </button>
    </div>
  );
}
