import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './EnterName.css';

export default function EnterName() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { sessionCode } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch(`http://localhost:4000/api/sessions/${sessionCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (res.ok) {
        const studentId = data.studentId;
        localStorage.setItem("studentId", studentId);         
        localStorage.setItem("studentName", name.trim());
        navigate(`/student/${sessionCode}/${studentId}`);
      }
       else {
        alert(data.error || "Failed to join session.");
      }
    } catch (err) {
      console.error("Join failed:", err);
      alert("Error connecting to server.");
    }
  };


  return (
    <div className="enter-name-container">
      <form className="enter-name-form" onSubmit={handleSubmit}>
        <h2>Enter Your Name</h2>
        <input
          className="enter-name-input"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <button className="enter-name-button" type="submit">
          Join Session
        </button>
      </form>
    </div>
  );
}
