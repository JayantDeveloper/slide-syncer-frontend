import React, { useEffect, useState, useRef } from 'react';
import './TeacherDashboardView.css';
import NavigationBar from "../components/NavigationBar";
import NotesSidebar from '../components/NotesSidebar';
import { useParams, useNavigate } from 'react-router-dom';

const BACKEND_BASE_URL = "http://localhost:4000";

export default function TeacherDashboardView() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState([]);               // ✅ Add notes state
  const [currentIndex, setCurrentIndex] = useState(0);  // ✅ Add current slide index
  const ws = useRef(null);

  // 🔁 Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/sessions/${sessionCode}/students`);
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error('Error fetching student data:', err);
      }
    };

    fetchStudentData();
    const interval = setInterval(fetchStudentData, 3000);
    return () => clearInterval(interval);
  }, [sessionCode]);

  // 📥 Fetch notes from slides/{sessionCode}/notes.json
  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/notes.json`)
      .then(res => res.json())
      .then(setNotes)
      .catch(err => console.error("Failed to load notes:", err));
  }, [sessionCode]);

  // 🔁 Listen for synced slide index via WebSocket
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

  return (
    <div className="tdb-container">
      {/* Top content area (dashboard and sidebar) */}
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
                  {students.map((student, index) => (
                    <div className="tdb-table-row" key={index}>
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
        leftButtons={[
          <button
            key="presentation"
            onClick={() => navigate(`/teacher/${sessionCode}`)}
            className="teacher-button"
          >
            Presentation View
          </button>
        ]}
      />
    </div>
  );
}
