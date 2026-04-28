import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import Editor from "@monaco-editor/react";
import "xterm/css/xterm.css";
import "./TeacherInspectCode.css";
import NavigationBar from "../components/NavigationBar";
import NotesSidebar from "../components/NotesSidebar";
import { BACKEND_BASE_URL } from "../config";

export default function TeacherInspectCode() {
  const { sessionCode, studentId } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [notes, setNotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editorsLocked, setEditorsLocked] = useState(false);
  const terminalRef = useRef(null);
  const termInstance = useRef(null);
  const lastOutputRef = useRef("");
  const ws = useRef(null);

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/notes.json`)
      .then((res) => res.json())
      .then(setNotes)
      .catch((err) => console.error("Failed to load notes:", err));

    fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/lock`)
      .then((res) => res.json())
      .then((data) => setEditorsLocked(!!data.locked))
      .catch(() => {});

    const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "sync") setCurrentIndex(data.slide);
      if (data.type === "lock-editors" && data.sessionCode === sessionCode) {
        setEditorsLocked(!!data.locked);
      }
    };

    return () => { if (ws.current) ws.current.close(); };
  }, [sessionCode]);

  // Initialize terminal once on mount
  useEffect(() => {
    if (!terminalRef.current || termInstance.current) return;

    const term = new Terminal({
      disableStdin: true,
      fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
      fontSize: 14,
      lineHeight: 1.6,
      convertEol: true,
      theme: { background: "#1e1e1e", foreground: "#cccccc" },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    termInstance.current = term;

    return () => { term.dispose(); termInstance.current = null; };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/students/${studentId}`);
        const data = await res.json();
        setCode(data.code || "");
        setStudentName(data.name || "Unknown");

        const newOutput = data.output || "No terminal output yet.";
        if (termInstance.current && newOutput !== lastOutputRef.current) {
          lastOutputRef.current = newOutput;
          termInstance.current.reset();
          newOutput.split("\n").forEach((line, i, arr) => {
            const isLast = i === arr.length - 1;
            if (isLast && line.trim() === "✔ Done") {
              termInstance.current.write("\x1b[32m✔ Done\x1b[0m\r\n");
            } else {
              termInstance.current.write(line + "\r\n");
            }
          });
        }
      } catch (err) {
        console.error("Failed to fetch student data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [sessionCode, studentId]);

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

  return (
    <div className="teacher-container">
      <div className="slide-area">
        <h2 className="inspect-header">Inspecting: {studentName}</h2>
        <div className="teacher-editor-terminal">
          <div className="teacher-editor-container">
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              options={{
                readOnly: true,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 20,
                fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
              }}
            />
          </div>
          <div className="teacher-terminal-pane" ref={terminalRef} />
        </div>
        <NavigationBar
          sessionCode={sessionCode}
          editorsLocked={editorsLocked}
          onToggleLock={toggleLock}
          leftButtons={[
            <button
              key="presentation"
              onClick={() => navigate(`/teacher/${sessionCode}`)}
              className="teacher-button"
            >
              Presentation View
            </button>,
            <button
              key="dashboard"
              onClick={() => navigate(`/teacher/dashboard/${sessionCode}`)}
              className="teacher-button"
            >
              Dashboard View
            </button>,
          ]}
        />
      </div>
      <NotesSidebar currentIndex={currentIndex} notes={notes} />
    </div>
  );
}
