import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Slides from './Slides';

function App() {
  return (
    <Router>
      <div className="Container">
        <Routes>
          <Route path="/" element={<div>Welcome to Slide Syncer</div>} />
          <Route path="/teacher/:sessionCode" element={<Slides isTeacher={true} />} />
          <Route path="/student/:sessionCode" element={<Slides isTeacher={false} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;