import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout
import MainLayout from './Components/Layout/MainLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';

// App Modules
import Dashboard from './pages/Dashboard/Dashboard';
import Employee from './pages/Employee/Employee';
import Attandance from './pages/Attandance/Attandance';
import TimeSheets from './pages/TimeSheets/TimeSheets';
import Projects from './pages/Projects/Projects';
import Tasks from './pages/Tasks/Tasks';
import Holiday from './pages/Holiday/Holiday';
import Applications from './pages/Applications/Applications';
import Accusations from './pages/Accusations/Accusations';
import Blogs from './pages/Blogs/Blogs';
import Profile from './pages/Profile/Profile';
import Chat from './pages/Chat/Chat';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />

        {/* Dedicated Full-Screen Chat Application Workspace (No HRMS Sidebar) */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard & Module Routes with Standard Sidebar */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employee />} />
          <Route path="attendance" element={<Attandance />} />
          <Route path="timesheets" element={<TimeSheets />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="holidays" element={<Holiday />} />
          <Route path="applications" element={<Applications />} />
          <Route path="accusations" element={<Accusations />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
