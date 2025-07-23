import React from "react";
import { useNavigate } from "react-router-dom";
import "../views/TeacherView.css";

export default function NavigationBar({ leftButtons, sessionCode }) {
  const navigate = useNavigate();

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
      </div>
      <button className="end-session">End Session</button>
    </div>
  );
}
