import React, { useState, useEffect, useRef } from "react";
import "../views/TeacherView.css";
import { BACKEND_BASE_URL } from "../config";

export default function NavigationBar({ leftButtons, sessionCode }) {
  const [editorsLocked, setEditorsLocked] = useState(false);
  const [slidesUrl, setSlidesUrl] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const wsRef = useRef(null);

  // Fetch slides URL
  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/meta.json`)
      .then((res) => res.json())
      .then((data) => setSlidesUrl(data.slidesUrl))
      .catch((err) => console.error("Failed to fetch meta.json:", err));
  }, [sessionCode]);

  // Hydrate the current lock state on mount / when session changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${BACKEND_BASE_URL}/api/sessions/${sessionCode}/lock`
        );
        const data = await res.json();
        if (!cancelled) setEditorsLocked(!!data.locked);
      } catch (e) {
        console.warn("Failed to fetch lock state:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionCode]);

  // Subscribe to WS broadcasts to keep the label in sync across views/tabs
  useEffect(() => {
    const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "lock-editors" && msg.sessionCode === sessionCode) {
          setEditorsLocked(!!msg.locked);
        }
      } catch {
        /* noop */
      }
    };
    ws.onerror = (e) => console.warn("WS error:", e?.message || e);
    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [sessionCode]);

  // Poll for student count every 3 seconds
  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const res = await fetch(
          `${BACKEND_BASE_URL}/api/sessions/${sessionCode}/students`
        );
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
      // Best-effort re-sync
      try {
        const res = await fetch(
          `${BACKEND_BASE_URL}/api/sessions/${sessionCode}/lock`
        );
        const { locked } = await res.json();
        setEditorsLocked(!!locked);
      } catch {}
      alert("Could not toggle editor lock. Please try again.");
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

        <button onClick={toggleLock} className="teacher-button">
          {editorsLocked ? "Unlock Editors" : "Lock Editors"}
        </button>

        <div className="student-count">
          👥 {studentCount} {studentCount === 1 ? "student" : "students"}
        </div>
      </div>

      <button
        className="end-session"
        onClick={async () => {
          try {
            // 1) Persist ended state on the server
            const resp = await fetch(
              `${BACKEND_BASE_URL}/api/sessions/${sessionCode}/end`,
              { method: "POST", headers: { "Content-Type": "application/json" } }
            );
            if (!resp.ok) throw new Error("Failed to end session");

            // 2) Optional: WS broadcast for instant flip (nice to keep)
            const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
            const ws = new WebSocket(wsUrl);
            ws.onopen = () => {
              ws.send(JSON.stringify({ type: "session-ended", sessionCode }));
              ws.close();
            };

            // 3) Redirect teacher to original Slides
            if (slidesUrl) {
              window.location.href = slidesUrl;
            } else {
              alert("Session ended. No Slides URL found for redirect.");
            }
          } catch (e) {
            console.error(e);
            alert("Could not end session. Please try again.");
          }
        }}
      >
        End Session
      </button>
    </div>
  );
}
