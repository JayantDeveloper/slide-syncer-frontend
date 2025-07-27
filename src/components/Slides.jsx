import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Slides.css';
import { BACKEND_BASE_URL } from "../config";

function Slides({ isTeacher }) {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ws = useRef(null);
  const { sessionCode } = useParams();

  useEffect(() => {
    if (!sessionCode) {
      setError('No session code provided');
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_BASE_URL}/slides/${sessionCode}/index.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load slides');
        return res.json();
      })
      .then(data => {
        setSlides(data.slides || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    const wsUrl = BACKEND_BASE_URL.replace(/^http/, 'ws');
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'sync') {
        setCurrentIndex(data.slide);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [sessionCode]);

  if (loading) return <div className="slides-container">Loading slides...</div>;
  if (error) return <div className="slides-container">Error: {error}</div>;
  if (slides.length === 0) return <div className="slides-container">No slides found</div>;

  return (
    <div className="slides-container">
      <h2>Session: {sessionCode}</h2>
      <img
        src={`${BACKEND_BASE_URL}${slides[currentIndex]}`}
        alt={`Slide ${currentIndex + 1}`}
        className="slide-image"
      />

      {isTeacher && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '14px', color: '#444' }}>
            Share this link with students:
          </label>
          <div
            style={{
              backgroundColor: '#f1f1f1',
              padding: '8px 10px',
              borderRadius: '6px',
              wordBreak: 'break-all',
              marginTop: '5px',
              fontSize: '14px',
            }}
          >
            {`${window.location.origin}/student/${sessionCode}`}
          </div>
        </div>
      )}
    </div>
  );
}

export default Slides;
