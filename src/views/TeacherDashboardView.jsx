import React, { useEffect, useState } from "react";
import "./TeacherDashboardView.css";
import NavigationBar from "../components/NavigationBar";
import NotesSidebar from "../components/NotesSidebar";
import { useParams, useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "../config";
import { useSessionWebSocket } from "../hooks/useSessionWebSocket";
import { useLockEditor } from "../hooks/useLockEditor";

export default function TeacherDashboardView() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { editorsLocked, setEditorsLocked, toggleLock } = useLockEditor(sessionCode);

  useSessionWebSocket(sessionCode, (data) => {
    if (data.type === "sync") setCurrentIndex(data.slide);
    if (data.type === "lock-editors" && data.sessionCode === sessionCode) {
      setEditorsLocked(!!data.locked);
    }
  });

  useEffect(() => {
    if (!sessionCode) return;
    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/notes.json`)
      .then((res) => res.json())
      .then(setNotes)
      .catch((err) => console.error("Failed to load notes:", err));
  }, [sessionCode]);

  useEffect(() => {
    if (!sessionCode) return;
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/students`);
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error("Error fetching student data:", err);
      }
    };
    fetchStudents();
    const interval = setInterval(fetchStudents, 3000);
    return () => clearInterval(interval);
  }, [sessionCode]);

  return (
    <div className="tdb-container">
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div className="slide-area" style={{ flex: 1 }}>
          <div className="tdb-page-container">
            <div className="tdb-content-wrapper">
              <h2 className="tdb-header">Student Code Dashboard</h2>
              <div className="tdb-table">
                <div className="tdb-table-header">
                  <div className="tdb-th">Student Name</div>
                  <div className="tdb-th">Code Preview</div>
                  <div className="tdb-th">View</div>
                </div>
                <div className="tdb-table-body">
                  {students.map((student) => (
                    <div className="tdb-table-row" key={student.id}>
                      <div className="tdb-td student-name-cell">{student.name}</div>
                      <div className="tdb-td code-preview-cell">
                        <pre className="code-snippet">
                          {student.code?.slice(0, 300) || "No code yet..."}
                        </pre>
                      </div>
                      <div className="tdb-td view-link-cell">
                        <button
                          onClick={() => navigate(`/teacher/student/${sessionCode}/${student.id}`)}
                          className="view-link"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <NotesSidebar currentIndex={currentIndex} notes={notes} />
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
        ]}
      />
    </div>
  );
}
