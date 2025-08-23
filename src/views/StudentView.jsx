import React, { useEffect, useState, useRef } from "react";
import Slides from "../components/Slides";
import EditorPane from "../components/EditorPane";
import RunButton from "../components/RunButton";
import TerminalPane from "../components/TerminalPane";
import "./StudentView.css";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";
import { BACKEND_BASE_URL } from "../config";

const STARTER_CODE = `# Write your code here\nprint("Hello, World!")\n`;

export default function StudentView() {
  const { sessionCode } = useParams();

  const [editorContent, setEditorContent] = useState("");
  const [studentId] = useState(() => {
    const existing = localStorage.getItem("studentId");
    const id = existing || uuidv4();
    if (!existing) localStorage.setItem("studentId", id);
    return id;
  });
  const [studentName] = useState(() => {
    const existing = localStorage.getItem("studentName");
    const name = existing || "Unnamed Student";
    if (!existing) localStorage.setItem("studentName", name);
    return name;
  });

  const [output, setOutput] = useState("");
  const [editorLocked, setEditorLocked] = useState(false);
  const [codingSlides, setCodingSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [pendingSlideIndex, setPendingSlideIndex] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  const wsRef = useRef(null);

  // On initial load/refresh, verify the session is still active
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `${BACKEND_BASE_URL}/api/sessions/${sessionCode}/exists`,
        );
        const { exists, active } = await r.json();
        if (!cancelled && (!exists || !active)) setSessionEnded(true);
        if (!cancelled && exists && active) setSessionEnded(false);
      } catch (e) {
        console.error("exists check failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionCode]);

  // Load which slides are coding slides
  useEffect(() => {
    const fetchCodingSlides = async () => {
      try {
        const res = await fetch(
          `${BACKEND_BASE_URL}/api/sessions/${sessionCode}/coding-slides`,
        );
        const { codingSlides } = await res.json();
        setCodingSlides(codingSlides);
      } catch (err) {
        console.error("Failed to load coding slide info:", err);
      }
    };
    fetchCodingSlides();
  }, [sessionCode]);

  // WebSocket: sync slides, lock editors, and detect session end
  useEffect(() => {
    if (sessionEnded) return; // don't open WS after end

    const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "lock-editors" && data.sessionCode === sessionCode) {
        setEditorLocked(data.locked);
      }

      if (data.type === "sync") {
        setPendingSlideIndex(data.slide);
      }

      if (data.type === "session-ended" && data.sessionCode === sessionCode) {
        console.log("🚪 Session ended by teacher");
        setSessionEnded(true);
        try {
          ws.close();
        } catch {}
      }
    };

    ws.onerror = (e) => console.error("WS error", e);
    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [sessionCode, sessionEnded]);

  // When a new slide is received, update editor content if it's a coding slide
  useEffect(() => {
    if (sessionEnded) return;
    if (pendingSlideIndex === null || codingSlides.length === 0) return;

    setCurrentSlideIndex(pendingSlideIndex);

    if (codingSlides.includes(pendingSlideIndex)) {
      setEditorContent(STARTER_CODE);
    } else {
      setEditorContent("");
    }
  }, [pendingSlideIndex, codingSlides, sessionEnded]);

  // Heartbeat: post code/output to teacher dashboard (stop after end)
  useEffect(() => {
    if (sessionEnded) return; // don't post after end

    const interval = setInterval(() => {
      fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          name: studentName,
          code: editorContent || "",
          output: output || "",
        }),
      }).catch((err) => console.error("Failed to post code:", err));
    }, 3000);

    return () => clearInterval(interval);
  }, [
    sessionCode,
    studentId,
    studentName,
    editorContent,
    output,
    sessionEnded,
  ]);

  const codingSlidesReady = codingSlides.length > 0;
  const isCodeSlide =
    codingSlidesReady && codingSlides.includes(currentSlideIndex);

  if (sessionEnded) {
    return (
      <div className="session-ended-screen">
        <h1>This session has ended.</h1>
        <p>Thanks for coding with us!</p>
      </div>
    );
  }

  return (
    <div className="student-container">
      <div className={`student-left ${!isCodeSlide ? "full-width" : ""}`}>
        <div className={`slide-wrapper ${!isCodeSlide ? "shrink" : ""}`}>
          <Slides isTeacher={false} sessionCode={sessionCode} />
        </div>
      </div>

      {isCodeSlide && (
        <div className="student-right">
          <div className="editor-container">
            <EditorPane
              value={editorContent}
              onCodeChange={setEditorContent}
              readOnly={editorLocked}
            />
            <RunButton code={editorContent} onOutput={setOutput} />
          </div>
          <TerminalPane onOutputChange={setOutput} />
        </div>
      )}
    </div>
  );
}
