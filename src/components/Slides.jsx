import React, { useCallback, useState } from "react";
import "./Slides.css";
import { BACKEND_BASE_URL } from "../config";

function Slides({ isTeacher, slides = [], currentIndex = 0, sessionCode, loading = false, error = null }) {
  const [aspectRatio, setAspectRatio] = useState(null);

  const handleImageLoad = useCallback((e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight && !aspectRatio) {
      setAspectRatio(`${naturalWidth} / ${naturalHeight}`);
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
