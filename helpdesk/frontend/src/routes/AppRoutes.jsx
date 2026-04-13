import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../pages/LoginPage/LoginPage'
import DashboardPage from '../pages/DashboardPage/DashboardPage'
import TicketsPage from '../pages/TicketsPage/TicketsPage'
import TicketDetallePage from '../pages/TicketDetallePage/TicketDetallePage'
import NuevoTicketPage from '../pages/NuevoTicketPage/NuevoTicketPage'
import Navbar from '../components/Navbar'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/nuevo"
        element={
          <ProtectedRoute>
            <Layout><NuevoTicketPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <Layout><TicketDetallePage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Layout><TicketsPage /></Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
