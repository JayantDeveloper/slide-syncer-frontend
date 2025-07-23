import React, { useEffect, useRef, useState } from "react";
import Slides from "../components/Slides";
import NavigationBar from "../components/NavigationBar";
import NotesSidebar from "../components/NotesSidebar";
import "./TeacherView.css";
import { useParams, useNavigate } from "react-router-dom";

const BACKEND_BASE_URL = "http://localhost:4000";

export default function TeacherView() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    if (!sessionCode) return;

    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/index.json`)
      .then(res => res.json())
      .then(data => {
        setSlides(data.slides || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load slides");
        setLoading(false);
      });

    // 🔹 Fetch notes.json too
    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/notes.json`)
      .then(res => res.json())
      .then(setNotes)
      .catch(err => {
        console.warn("No notes found or failed to load notes:", err);
      });

    const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "sync") {
        setCurrentIndex(data.slide);
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [sessionCode]);

  const changeSlide = (newIndex) => {
    if (newIndex >= 0 && newIndex < slides.length) {
      setCurrentIndex(newIndex);
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "change", slide: newIndex }));
      }
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
            currentSlide={slides[currentIndex]}
            currentIndex={currentIndex}
          />
        </div>

        <NavigationBar
          sessionCode={sessionCode}
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
            </button>
          ]}
        />
      </div>
      <NotesSidebar currentIndex={currentIndex} notes={notes} />
    </div>
  );
}
