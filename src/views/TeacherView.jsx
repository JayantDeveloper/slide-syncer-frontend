import React, { useEffect, useState } from "react";
import Slides from "../components/Slides";
import NavigationBar from "../components/NavigationBar";
import NotesSidebar from "../components/NotesSidebar";
import "./TeacherView.css";
import { useParams, useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "../config";
import { useSessionWebSocket } from "../hooks/useSessionWebSocket";
import { useLockEditor } from "../hooks/useLockEditor";

export default function TeacherView() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);

  const { editorsLocked, setEditorsLocked, toggleLock } = useLockEditor(sessionCode);
  const wsRef = useSessionWebSocket(sessionCode, (data) => {
    if (data.type === "sync") setCurrentIndex(data.slide);
    if (data.type === "lock-editors" && data.sessionCode === sessionCode) {
      setEditorsLocked(!!data.locked);
    }
  });

  useEffect(() => {
    if (!sessionCode) return;

    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/index.json`)
      .then((res) => res.json())
      .then((data) => { setSlides(data.slides || []); setLoading(false); })
      .catch(() => { setError("Failed to load slides"); setLoading(false); });

    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/notes.json`)
      .then((res) => res.json())
      .then(setNotes)
      .catch((err) => console.warn("No notes found:", err));
  }, [sessionCode]);

  const changeSlide = (newIndex) => {
    if (newIndex < 0 || newIndex >= slides.length) return;
    setCurrentIndex(newIndex);
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "change", slide: newIndex, sessionCode }));
    }
  };

  if (loading) return <div>Loading slides...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="teacher-container">
      <div className="slide-area">
        <div className="slide-box">
          <Slides
            sessionCode={sessionCode}
            slides={slides}
            currentIndex={currentIndex}
            isTeacher
          />
        </div>
        <NavigationBar
          sessionCode={sessionCode}
          editorsLocked={editorsLocked}
          onToggleLock={toggleLock}
          leftButtons={[
            <button
              key="prev"
              className="nav-button"
              onClick={() => changeSlide(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              Previous
            </button>,
            <button
              key="next"
              className="nav-button"
              onClick={() => changeSlide(currentIndex + 1)}
              disabled={currentIndex === slides.length - 1}
            >
              Next
            </button>,
            <button
              key="dashboard"
              onClick={() => navigate(`/teacher/dashboard/${sessionCode}`)}
              className="teacher-button"
            >
              Open Dashboard
            </button>,
          ]}
        />
      </div>
      <NotesSidebar currentIndex={currentIndex} notes={notes} />
    </div>
  );
}
