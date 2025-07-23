import React from "react";
import "./NotesSidebar.css"; 

export default function NotesSidebar({ currentIndex, notes }) {
  return (
    <div className="notes-sidebar">
      <h3>Notes</h3>
      <p>{notes?.[currentIndex] || "No notes for this slide."}</p>
    </div>
  );
}
