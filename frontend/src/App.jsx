import React from 'react'
import { HashRouter , Route, Routes, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashborad'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import AuthCheck from './components/AuthCheck'
import Test from './Test'

const App = () => {
  return (
    <AuthCheck>
      <HashRouter>
        <Routes>
          {/* Public Routes - Redirect to dashboard if authenticated */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          <Route path="/test" element={
            <PublicRoute>
              <Test />
            </PublicRoute>
          } />

          {/* Protected Routes - Redirect to login if not authenticated */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthCheck>
  )
}

export default App