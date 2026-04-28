import React, { useEffect, useRef, useState } from "react";
import Slides from "../components/Slides";
import NavigationBar from "../components/NavigationBar";
import NotesSidebar from "../components/NotesSidebar";
import "./TeacherView.css";
import { useParams, useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "../config";

export default function TeacherView() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [editorsLocked, setEditorsLocked] = useState(false);
  const ws = useRef(null);

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

    fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/lock`)
      .then((res) => res.json())
      .then((data) => setEditorsLocked(!!data.locked))
      .catch(() => {});

    const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
    ws.current = new WebSocket(wsUrl);
    ws.current.onopen = () => console.log("WebSocket connected");
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "sync") setCurrentIndex(data.slide);
      if (data.type === "lock-editors" && data.sessionCode === sessionCode) {
        setEditorsLocked(!!data.locked);
      }
    };

    return () => { if (ws.current) ws.current.close(); };
  }, [sessionCode]);

  const changeSlide = (newIndex) => {
    if (newIndex >= 0 && newIndex < slides.length) {
      setCurrentIndex(newIndex);
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "change", slide: newIndex }));
      }
    }
  };

  const toggleLock = async () => {
    const newLocked = !editorsLocked;
    try {
      const resp = await fetch(
        `${BACKEND_BASE_URL}/api/sessions/${sessionCode}/lock`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locked: newLocked }),
        }
      );
      if (!resp.ok) throw new Error("Failed to set lock");
      setEditorsLocked(newLocked);
    } catch (e) {
      console.error(e);
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/lock`);
        const { locked } = await res.json();
        setEditorsLocked(!!locked);
      } catch {}
      alert("Could not toggle editor lock. Please try again.");
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
