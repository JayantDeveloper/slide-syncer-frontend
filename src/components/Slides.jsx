import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import "./Slides.css";
import { BACKEND_BASE_URL } from "../config";

function Slides({ isTeacher }) {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(null); // dynamically detected
  const ws = useRef(null);
  const { sessionCode } = useParams();

  useEffect(() => {
    if (!sessionCode) {
      setError("No session code provided");
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/index.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load slides");
        return res.json();
      })
      .then((data) => {
        setSlides(data.slides || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "sync") setCurrentIndex(data.slide);
    };

    ws.current.onerror = (e) => console.error("WebSocket error:", e);
    return () => ws.current && ws.current.close();
  }, [sessionCode]);

  // Detect the natural width/height from the first successfully loaded image
  const handleImageLoad = useCallback((e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight && !aspectRatio) {
      setAspectRatio(`${naturalWidth} / ${naturalHeight}`); // CSS aspect-ratio value
    }
  }, [aspectRatio]);

  if (loading) return <div className="slides-container">Loading slides...</div>;
  if (error) return <div className="slides-container">Error: {error}</div>;
  if (slides.length === 0) return <div className="slides-container">No slides found</div>;

  const src = `${BACKEND_BASE_URL}${slides[currentIndex]}`;

  return (
    <div className="slides-container">
      <h2 className="session-id">Session: {sessionCode}</h2>

      <div
        className="slide-frame"
        style={aspectRatio ? { aspectRatio } : undefined}
        // If we haven't detected ratio yet, the CSS will fall back to 16/9
      >
        <img
          src={src}
          alt={`Slide ${currentIndex + 1}`}
          className="slide-image"
          onLoad={handleImageLoad}
          draggable={false}
        />
      </div>

      {isTeacher && (
        <div className="share-block">
          <label className="share-label">Share this link with students:</label>
          <div className="share-url">
            {`${window.location.origin}/student/${sessionCode}`}
          </div>
        </div>
      )}
    </div>
  );
}

export default Slides;
