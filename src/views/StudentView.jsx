import React, { useEffect, useState } from "react";
import Slides from "../components/Slides";
import EditorPane from "../components/EditorPane";
import RunButton from "../components/RunButton";
import TerminalPane from "../components/TerminalPane";
import "./StudentView.css";
import { v4 as uuidv4 } from 'uuid';
import { useParams } from "react-router-dom";

const BACKEND_BASE_URL = "http://localhost:4000";

export default function StudentView() {
  const { sessionCode } = useParams();
  const [editorContent, setEditorContent] = useState("");
  const [studentId] = useState(() => localStorage.getItem("studentId") || uuidv4());
  const [studentName] = useState(() => localStorage.getItem("studentName") || "Unnamed Student");
  const [output, setOutput] = useState("");

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

  return (

    <div className="student-container">
      <div className="student-left">
        <Slides isTeacher={false} sessionCode={sessionCode} />
      </div>
      <div className="student-right">
        <div className="editor-container">
          <EditorPane onCodeChange={setEditorContent} />
          <RunButton onOutput={setOutput} />
        </div>
        <TerminalPane onOutputChange={setOutput} />
      </div>
    </div>
  );
}
