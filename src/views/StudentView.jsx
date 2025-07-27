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
  const [studentId] = useState(() => localStorage.getItem("studentId") || uuidv4());
  const [studentName] = useState(() => localStorage.getItem("studentName") || "Unnamed Student");
  const [output, setOutput] = useState("");
  const [editorLocked, setEditorLocked] = useState(false);
  const [codingSlides, setCodingSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [pendingSlideIndex, setPendingSlideIndex] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const fetchCodingSlides = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/coding-slides`);
        const { codingSlides } = await res.json();
        setCodingSlides(codingSlides);
      } catch (err) {
        console.error("Failed to load coding slide info:", err);
      }
    };

    fetchCodingSlides();
  }, [sessionCode]);

  useEffect(() => {
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
    };

    return () => ws.close();
  }, [sessionCode]);

  useEffect(() => {
    if (pendingSlideIndex === null || codingSlides.length === 0) return;

    setCurrentSlideIndex(pendingSlideIndex);

    if (codingSlides.includes(pendingSlideIndex)) {
      setEditorContent(STARTER_CODE);
    } else {
      setEditorContent("");
    }
  }, [pendingSlideIndex, codingSlides]);

  useEffect(() => {
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
      }).catch(err => console.error("Failed to post code:", err));
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionCode, studentId, studentName, editorContent, output]);

  const codingSlidesReady = codingSlides.length > 0;
  const isCodeSlide = codingSlidesReady && codingSlides.includes(currentSlideIndex);

  console.log(`🧠 Slide ${currentSlideIndex} - ${isCodeSlide ? "CODING" : "NON-CODING"}`);

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
            <RunButton onOutput={setOutput} />
          </div>
          <TerminalPane onOutputChange={setOutput} />
        </div>
      )}
    </div>
  );
}
