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
    <div className="join-page-container">
      <div className="join-content">
        <div className="join-header">
          <div className="tomato-icon">🍅</div>
          <h1>TomatoCode</h1>
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
            />
          </div>

          <button type="submit" className="join-button" disabled={!pin.trim()}>
            Join Session
          </button>
        </form>

        <div className="join-footer">
          <p>Don't have a PIN? Ask your instructor.</p>
        </div>
      </div>
    </div>
  );
}