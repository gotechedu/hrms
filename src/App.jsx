import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Layout
import MainLayout from './Components/Layout/MainLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';

// App Modules
import Dashboard from './pages/Dashboard/Dashboard';
import Employee from './pages/Employee/Employee';
import EmployeeDetails from './pages/Employee/EmployeeDetails';
import Attandance from './pages/Attandance/Attandance';
import TimeSheets from './pages/TimeSheets/TimeSheets';
import Projects from './pages/Projects/Projects';
import Tasks from './pages/Tasks/Tasks';
import Holiday from './pages/Holiday/Holiday';
import LearningHub from './pages/LearnginHub/LearningHub';
import CourseDetails from './pages/LearnginHub/CourseDetails';
import BatchManager from './pages/LearnginHub/BatchManager';
import TrainerHub from './pages/LearnginHub/TrainerHub';
import TraineeLearningHub from './pages/LearnginHub/TraineeLearningHub';
import CoursePlayer from './pages/LearnginHub/CoursePlayer';
import CareerPost from './pages/CareerPost/CareerPost';
import JobDetails from './pages/CareerPost/JobDetails';
import Applications from './pages/Applications/Applications';
import ApplicationDetails from './pages/Applications/ApplicationDetails';
import Accusations from './pages/Accusations/Accusations';
import Blogs from './pages/Blogs/Blogs';
import Profile from './pages/Profile/Profile';
import Chat from './pages/Chat/Chat';
import Contacts from './pages/Contacts/Contacts';
import Discussions from './pages/Discussions/Discussions';

// Payroll Module Pages
import PayRol from './pages/PayRol/PayRol';
import OrgEmployeePayRol from './pages/PayRol/OrgEmployeePayRol';
import StudenPayRol from './pages/PayRol/StudenPayRol';
import ItSolutionPayRol from './pages/PayRol/ItSolutionPayRol';

// Settings & Administration Pages
import Settings from './pages/Settings/Settings';
import ManageRole from './pages/Settings/ManageRole';
import ManagePermission from './pages/Settings/ManagePermission';

// Recycle Bin Page
import RecycleBin from './pages/RecycleBin/RecycleBin';

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
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            padding: '12px 16px',
            border: '1px solid #1e293b',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid #059669',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid #dc2626',
            },
          },
        }}
      />
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

        {/* Dedicated Full-Screen LMS Course Player (Distraction-Free Immersion) */}
        <Route
          path="/learninghub/player/:enrollmentId"
          element={
            <ProtectedRoute>
              <CoursePlayer />
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
          <Route path="employees/:id" element={<EmployeeDetails />} />
          <Route path="attendance" element={<Attandance />} />
          <Route path="timesheets" element={<TimeSheets />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="holidays" element={<Holiday />} />
          
          {/* Payroll Routes */}
          <Route path="payroll" element={<PayRol />} />
          <Route path="payroll/org-employees" element={<OrgEmployeePayRol />} />
          <Route path="payroll/students" element={<StudenPayRol />} />
          <Route path="payroll/it-solutions" element={<ItSolutionPayRol />} />

          {/* Learning & Career */}
          <Route path="learninghub" element={<LearningHub />} />
          <Route path="learninghub/batches" element={<BatchManager />} />
          <Route path="learninghub/trainer" element={<TrainerHub />} />
          <Route path="learninghub/trainee" element={<TraineeLearningHub />} />
          <Route path="learninghub/:id" element={<CourseDetails />} />
          <Route path="careerpost" element={<CareerPost />} />
          <Route path="careerpost/:id" element={<JobDetails />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:id" element={<ApplicationDetails />} />

          {/* Client Consultations & Leads */}
          <Route path="contacts" element={<Contacts />} />

          {/* Communication & Policy */}
          <Route path="discussions" element={<Discussions />} />
          <Route path="accusations" element={<Accusations />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="profile" element={<Profile />} />

          {/* Administration & Settings */}
          <Route path="settings" element={<Settings />} />
          <Route path="settings/roles" element={<ManageRole />} />
          <Route path="settings/permissions" element={<ManagePermission />} />
          
          {/* Universal Recycle Bin */}
          <Route path="recycle-bin" element={<RecycleBin />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
