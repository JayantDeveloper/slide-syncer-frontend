import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TeacherView from './views/TeacherView';
import StudentView from './views/StudentView';
import TeacherDashboardView from './views/TeacherDashboardView';
import TeacherInspectCode from './views/TeacherInspectCode';
import EnterName from './views/EnterName';
import JoinPage from './views/JoinPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JoinPage />} /> 
        <Route path="/teacher/:sessionCode" element={<TeacherView />} />
        <Route path="/teacher/dashboard/:sessionCode" element={<TeacherDashboardView />} />
        <Route path="/teacher/student/:sessionCode/:studentId" element={<TeacherInspectCode />} />
        <Route path="/student/:sessionCode" element={<EnterName />} />
        <Route path="/student/:sessionCode/:studentId" element={<StudentView />} />
      </Routes>
    </Router>
  );
}

export default App;
