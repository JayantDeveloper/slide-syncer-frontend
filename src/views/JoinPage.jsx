import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JoinPage.css";

export default function JoinPage() {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.trim()) {
      navigate(`/student/${pin}`);
    }
  };

  return (
    <div className="join-page">
      <form onSubmit={handleSubmit}>
        <h2>Join a Session</h2>
        <input
          type="text"
          placeholder="Enter Session PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button type="submit">Join</button>
      </form>
    </div>
  );
}
