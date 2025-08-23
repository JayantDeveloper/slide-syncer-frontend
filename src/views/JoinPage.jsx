import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JoinPage.css";
import { BACKEND_BASE_URL } from "../config";

export default function JoinPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedPin = pin.trim();
    if (!trimmedPin) {
      setError("Please enter a session PIN.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/sessions/${trimmedPin}/exists`);
      const data = await res.json(); // expected: { exists: boolean, active: boolean }

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
      } else if (!data.exists) {
        setError("That PIN doesn't match any session.");
      } else if (!data.active) {
        setError("This session has ended.");
      } else {
        navigate(`/student/${trimmedPin}`);
      }
    } catch (err) {
      console.error("Error checking PIN:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="join-page-container">
      <div className="join-content">
        <div className="join-header">
          <div className="kiwi-icon">🥝</div>
          <h1>CodeKiwi</h1>
          <p>Join your coding session</p>
        </div>

        <form className="join-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="pin">Session PIN</label>
            <input
              id="pin"
              type="text"
              placeholder="Enter your session PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="join-input"
              disabled={isLoading}
              autoFocus
            />
            {error && <div className="join-error">{error}</div>}
          </div>

          <button type="submit" className="join-button" disabled={!pin.trim() || isLoading}>
            {isLoading ? "Checking..." : "Join Session"}
          </button>
        </form>

        <div className="join-footer">
          <p>Don't have a PIN? Ask your instructor.</p>
        </div>
      </div>
    </div>
  );
}
