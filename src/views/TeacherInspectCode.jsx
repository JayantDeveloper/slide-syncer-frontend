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
  const terminalRef = useRef(null);
  const termInstance = useRef(null);

  // 🔁 New state for notes and current slide index
  const [notes, setNotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const ws = useRef(null);

  // ⬇️ Fetch speaker notes
  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/notes.json`)
      .then(res => res.json())
      .then(setNotes)
      .catch(err => console.error("Failed to load notes:", err));
  }, [sessionCode]);

  // ⬇️ Sync current slide via WebSocket
  useEffect(() => {
    const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
    ws.current = new WebSocket(wsUrl);

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

  // ⬇️ Fetch student data (code and terminal output)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/students/${studentId}`);
        const data = await res.json();
        setCode(data.code || "");
        setStudentName(data.name || "Unknown");

        if (terminalRef.current) {
          const term = termInstance.current;

          if (!term) {
            const newTerm = new Terminal({
              disableStdin: true,
              fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
              fontSize: 14,
              lineHeight: 1.6,
              convertEol: true,
              theme: {
                background: "#1e1e1e",
                foreground: "#cccccc",
                green: "#00ff00",
              },
            });
            const fitAddon = new FitAddon();
            newTerm.loadAddon(fitAddon);
            newTerm.open(terminalRef.current);
            fitAddon.fit();
            termInstance.current = newTerm;
          } else {
            term.reset();
          }

          const outputLines = (data.output || "No terminal output yet.").split("\n");
          outputLines.forEach((line, index) => {
            const isLastLine = index === outputLines.length - 1;
            const isDoneLine = line.trim() === "✔ Done";

            if (isLastLine && isDoneLine) {
              termInstance.current.write("\x1b[32m✔ Done\x1b[0m\r\n"); // green
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
            </button>
          ]}
        />
      </div>
      <NotesSidebar currentIndex={currentIndex} notes={notes} />
    </div>
  );
}
