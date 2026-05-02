import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageFade from './components/PageFade';
import DashboardLayout from './layouts/DashboardLayout';


import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import MyRequests from './pages/citizen/MyRequests';
import Complaints from './pages/citizen/Complaints';
import Announcements from './pages/citizen/Announcements';
import Polls from './pages/citizen/Polls';
import SubmitRequest from './pages/citizen/SubmitRequest';
import PaymentCheckout from './pages/citizen/PaymentCheckout';
import PaymentCard from './pages/citizen/PaymentCard';
import Tax from './pages/citizen/Tax';
import Transit from './pages/citizen/Transit';
import MunicipalityBot from './pages/citizen/MunicipalityBot';
import Profile from './pages/common/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRequests from './pages/admin/AdminRequests';
import AdminLogs from './pages/admin/AdminLogs';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminServiceTypes from './pages/admin/AdminServiceTypes';
import AdminUserReport from './pages/admin/AdminUserReport';
import AdminRegister from './pages/private/AdminRegister';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PageFade><LandingPage /></PageFade>} />
          <Route path="/login" element={<PageFade><Login /></PageFade>} />
          <Route path="/register" element={<PageFade><Register /></PageFade>} />
          <Route path="/private/admin-register" element={<PageFade><AdminRegister /></PageFade>} />

          {/* Citizen Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <CitizenDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          {/* Add more citizen routes here */}
          <Route path="/my-requests" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <MyRequests />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/complaints" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <Complaints />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/announcements" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <Announcements />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/polls" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <Polls />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/new-request" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <SubmitRequest />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/payment/:serviceRequestId" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <PaymentCheckout />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/payment/:serviceRequestId/card" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <PaymentCard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/tax" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <Tax />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/transit" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <Transit />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/bot" element={
            <ProtectedRoute roles={['CITIZEN']}>
              <DashboardLayout>
                <MunicipalityBot />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout isAdmin>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/requests" element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout isAdmin>
                <AdminRequests />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/complaints" element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout isAdmin>
                <AdminComplaints />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout isAdmin>
                <AdminUsers />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/logs" element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout isAdmin>
                <AdminLogs />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/announcements" element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout isAdmin>
                <AdminAnnouncements />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/types" element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout isAdmin>
                <AdminServiceTypes />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/users" element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout isAdmin>
                <AdminUserReport />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
