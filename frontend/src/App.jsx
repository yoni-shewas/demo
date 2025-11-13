import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CodeEditor from './pages/CodeEditor';
import Assignments from './pages/Assignments';
import Submissions from './pages/Submissions';
import Students from './pages/Students';
import Sections from './pages/Sections';
import Users from './pages/Users';

// Admin Pages
import AdminUsers from './pages/admin/Users';
import AdminBatches from './pages/admin/Batches';
import AdminLessons from './pages/admin/Lessons';

// Instructor Pages
import InstructorLessons from './pages/instructor/Lessons';
import InstructorAssignments from './pages/instructor/Assignments';
import InstructorSubmissions from './pages/instructor/Submissions';

// Student Pages
import StudentCode from './pages/student/Code';
import StudentCodeWorkspace from './pages/student/CodeWorkspace';
import StudentLessons from './pages/student/Lessons';
import StudentAssignments from './pages/student/Assignments';
import StudentSubmissions from './pages/student/Submissions';

// Public Pages
import PublicCodeEditor from './pages/PublicCodeEditor';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/code" element={<PublicCodeEditor />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/register" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Register />
              </ProtectedRoute>
            } 
          />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="code" element={<CodeEditor />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="submissions" element={<Submissions />} />
            
            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
                  <Students />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="sections"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
                  <Sections />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Admin Panel Routes */}
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/batches"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminBatches />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/lessons"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLessons />
                </ProtectedRoute>
              }
            />

            {/* Instructor Portal Routes */}
            <Route
              path="instructor/lessons"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                  <InstructorLessons />
                </ProtectedRoute>
              }
            />
            <Route
              path="instructor/assignments"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                  <InstructorAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="instructor/submissions"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                  <InstructorSubmissions />
                </ProtectedRoute>
              }
            />

            {/* Student Workspace Routes */}
            <Route
              path="student/code"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentCodeWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/code-old"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentCode />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/lessons"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentLessons />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/assignments"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/submissions"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentSubmissions />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
