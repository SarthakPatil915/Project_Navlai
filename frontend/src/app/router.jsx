import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '@/layouts/RootLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import AdminLayout from '@/layouts/AdminLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminRoute from '@/components/auth/AdminRoute'

// Pages
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import EventsPage from '@/pages/dashboard/EventsPage'
import EventDetailPage from '@/pages/dashboard/EventDetailPage'
import CreateEventPage from '@/pages/dashboard/CreateEventPage'
import MyEnrollmentsPage from '@/pages/dashboard/MyEnrollmentsPage'
import MyEventsPage from '@/pages/dashboard/MyEventsPage'
import ProfilePage from '@/pages/dashboard/ProfilePage'
import DirectionsPage from '@/pages/dashboard/DirectionsPage'
import OrganizerScanPage from '@/pages/dashboard/OrganizerScanPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminEventsPage from '@/pages/admin/AdminEventsPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminEnrollmentsPage from '@/pages/admin/AdminEnrollmentsPage'
import ScanQRPage from '@/pages/admin/ScanQRPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import InspirationPage from '@/pages/InspirationPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'inspiration', element: <InspirationPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:id', element: <EventDetailPage /> },
      { path: 'events/create', element: <CreateEventPage /> },
      { path: 'my-enrollments', element: <MyEnrollmentsPage /> },
      { path: 'my-events', element: <MyEventsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'directions/:enrollmentId', element: <DirectionsPage /> },
      { path: 'scan-qr', element: <OrganizerScanPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'events', element: <AdminEventsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'enrollments', element: <AdminEnrollmentsPage /> },
      { path: 'scan-qr', element: <ScanQRPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
