import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { logout, fetchCurrentUser } from './redux/slices/authSlice';

// SEO & Meta
import SeoManager from './Components/Common/SeoManager';

// Layout
import MainLayout from './Components/Layout/MainLayout';
import PermissionRoute from './Components/Common/PermissionRoute';

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

// Public Auth Route Wrapper (Redirects authenticated users to /dashboard)
function PublicAuthRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // 1. Auto-handle 401 unauthorized signals across any API call
    const handleUnauthorized = () => {
      dispatch(logout());
    };
    window.addEventListener('gotech_unauthorized', handleUnauthorized);

    // 2. Refresh & validate user profile if token is present
    if (token || isAuthenticated) {
      dispatch(fetchCurrentUser());
    }

    return () => {
      window.removeEventListener('gotech_unauthorized', handleUnauthorized);
    };
  }, [dispatch, token, isAuthenticated]);

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
      <SeoManager />
      <Routes>
        {/* Entry / Auth Routes: / directly renders Login */}
        <Route
          path="/"
          element={
            <PublicAuthRoute>
              <Login />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/auth/login"
          element={
            <PublicAuthRoute>
              <Login />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            <PublicAuthRoute>
              <ForgotPassword />
            </PublicAuthRoute>
          }
        />

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
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<PermissionRoute permission={['view_employee', 'manage_employee', 'create_employee']}><Employee /></PermissionRoute>} />
          <Route path="/employees/:id" element={<PermissionRoute permission={['view_employee', 'manage_employee', 'create_employee']}><EmployeeDetails /></PermissionRoute>} />
          <Route path="/attendance" element={<PermissionRoute permission={['add_attendance', 'view_attendance', 'manage_attendance', 'manage_attandance']}><Attandance /></PermissionRoute>} />
          <Route path="/timesheets" element={<PermissionRoute permission={['add_timesheet', 'view_timesheet', 'manage_timesheet']}><TimeSheets /></PermissionRoute>} />
          <Route path="/projects" element={<PermissionRoute permission={['view_project', 'manage_project', 'create_project', 'add_project']}><Projects /></PermissionRoute>} />
          <Route path="/tasks" element={<PermissionRoute permission={['view_task', 'manage_task', 'add_task']}><Tasks /></PermissionRoute>} />
          <Route path="/holidays" element={<PermissionRoute permission={['view_holiday', 'manage_holiday', 'add_holiday']}><Holiday /></PermissionRoute>} />
          
          {/* Payroll Routes */}
          <Route path="/payroll" element={<PermissionRoute permission={['view_payroll', 'manage_payroll']}><PayRol /></PermissionRoute>} />
          <Route path="/payroll/org-employees" element={<PermissionRoute permission={['view_payroll', 'manage_payroll']}><OrgEmployeePayRol /></PermissionRoute>} />
          <Route path="/payroll/students" element={<PermissionRoute permission={['view_payroll', 'manage_payroll']}><StudenPayRol /></PermissionRoute>} />
          <Route path="/payroll/it-solutions" element={<PermissionRoute permission={['view_payroll', 'manage_payroll']}><ItSolutionPayRol /></PermissionRoute>} />

          {/* Learning & Career */}
          <Route path="/learninghub" element={<PermissionRoute permission={['view_learninghub', 'manage_learninghub', 'access_enrolled_content']}><LearningHub /></PermissionRoute>} />
          <Route path="/learninghub/batches" element={<PermissionRoute permission={['manage_batches', 'manage_learninghub']}><BatchManager /></PermissionRoute>} />
          <Route path="/learninghub/trainer" element={<PermissionRoute permission={['manage_learninghub', 'manage_classes', 'grade_submissions']}><TrainerHub /></PermissionRoute>} />
          <Route path="/learninghub/trainee" element={<PermissionRoute permission={['access_enrolled_content', 'submit_assignments', 'take_assessments', 'view_learninghub']}><TraineeLearningHub /></PermissionRoute>} />
          <Route path="/learninghub/:id" element={<CourseDetails />} />
          <Route path="/careerpost" element={<PermissionRoute permission={['view_career', 'manage_career']}><CareerPost /></PermissionRoute>} />
          <Route path="/careerpost/:id" element={<JobDetails />} />
          <Route path="/applications" element={<PermissionRoute permission={['manage_applications', 'manage_career']}><Applications /></PermissionRoute>} />
          <Route path="/applications/:id" element={<PermissionRoute permission={['manage_applications', 'manage_career']}><ApplicationDetails /></PermissionRoute>} />

          {/* Client Consultations & Leads */}
          <Route path="/contacts" element={<PermissionRoute permission={['manage_contacts', 'manage_contact', 'view_contacts']}><Contacts /></PermissionRoute>} />

          {/* Communication & Policy */}
          <Route path="/discussions" element={<Discussions />} />
          <Route path="/accusations" element={<Accusations />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/profile" element={<Profile />} />

          {/* Administration & Settings */}
          <Route path="/settings" element={<PermissionRoute permission={['manage_settings', 'settings', 'manage_roles', 'manage_permissions']}><Settings /></PermissionRoute>} />
          <Route path="/settings/roles" element={<PermissionRoute permission={['manage_roles', 'roles_permissions']}><ManageRole /></PermissionRoute>} />
          <Route path="/settings/permissions" element={<PermissionRoute permission={['manage_permissions', 'roles_permissions']}><ManagePermission /></PermissionRoute>} />
          
          {/* Universal Recycle Bin */}
          <Route path="/recycle-bin" element={<PermissionRoute permission={['view_recycle_bin', 'manage_recycle_bin']}><RecycleBin /></PermissionRoute>} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
