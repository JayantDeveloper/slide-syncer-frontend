import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TeacherView from './views/TeacherView';
import StudentView from './views/StudentView';
import TeacherDashboardView from './views/TeacherDashboardView';
import TeacherInspectCode from './views/TeacherInspectCode';
import EnterName from './views/EnterName';
import JoinPage from './views/JoinPage';
import TermsOfService from './views/TermsOfService';
import PrivacyPolicy from './views/PrivacyPolicy';

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
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}

export default App;
