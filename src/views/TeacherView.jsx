import React, { useEffect, useRef, useState } from "react";
import Slides from "../components/Slides";
import NavigationBar from "../components/NavigationBar";
import NotesSidebar from "../components/NotesSidebar";
import "./TeacherView.css";
import { useParams, useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "../config";
import { useSessionWebSocket } from "../hooks/useSessionWebSocket";
import { useLockEditor } from "../hooks/useLockEditor";

const JOIN_BASE = "https://www.codekiwi.app/student";

export default function TeacherView() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);

  // Lobby state
  const [showLobby, setShowLobby] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const toastTimerRef = useRef(null);

  const { editorsLocked, setEditorsLocked, toggleLock } = useLockEditor(sessionCode);
  const wsRef = useSessionWebSocket(sessionCode, (data) => {
    if (data.type === "sync") setCurrentIndex(data.slide);
    if (data.type === "lock-editors" && data.sessionCode === sessionCode) {
      setEditorsLocked(!!data.locked);
    }
  });

  // Load slides + notes in background (lobby shows while loading)
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

  // Poll student count while lobby is showing
  useEffect(() => {
    if (!sessionCode || !showLobby) return;
    const poll = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/students`);
        const data = await res.json();
        setStudentCount((data.students || []).length);
      } catch { /* silent */ }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [sessionCode, showLobby]);

  const copyLink = () => {
    const url = `${JOIN_BASE}/${sessionCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  const changeSlide = (newIndex) => {
    if (newIndex < 0 || newIndex >= slides.length) return;
    setCurrentIndex(newIndex);
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "change", slide: newIndex, sessionCode }));
    }
  };

  // ── Lobby overlay ──────────────────────────────────────────────────────────
  if (showLobby) {
    return (
      <div className="lobby-overlay">
        <div className="lobby-card">
          {/* URL row */}
          <div className="lobby-url-box">codekiwi.app</div>

          {/* Code box */}
          <div className="lobby-code-box">
            <p className="lobby-code-label">Session Code</p>
            <p className="lobby-code">{sessionCode}</p>
            <div className="lobby-waiting">
              <span className="lobby-spinner" />
              Waiting for students…
            </div>
          </div>

          {/* Footer row */}
          <div className="lobby-footer-row">
            <div className="lobby-student-count">
              <span className={`lobby-dot ${studentCount > 0 ? "lobby-dot--active" : ""}`} />
              {studentCount === 0
                ? "No students connected"
                : `${studentCount} student${studentCount === 1 ? "" : "s"} connected`}
            </div>
            <button className="lobby-copy-btn" onClick={copyLink}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Give Students a Link
            </button>
          </div>

          {/* Start button */}
          <button className="lobby-start-btn" onClick={() => setShowLobby(false)}>
            Start Class →
          </button>
        </div>

        {/* Toast */}
        <div className={`lobby-toast ${linkCopied ? "lobby-toast--visible" : ""}`}>
          Link copied to your clipboard&nbsp;✓
        </div>
      </div>
    );
  }

  // ── Teacher view ───────────────────────────────────────────────────────────
  if (loading) return <div className="teacher-loading">Loading slides…</div>;
  if (error) return <div className="teacher-loading">{error}</div>;

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
