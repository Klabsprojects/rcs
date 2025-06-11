import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import the API interceptor - this sets up global session handling
import './services/apiInterceptor';
import MastersPage from './pages/Masters';
import Header from './components/Header';
import DietPlanner from './components/Dietplanner';
import Dashboard from './components/Dashboard';
import IndentCreation from './components/Indent';
import UserCreation from './components/UserCreation';
import LoginPage from './pages/LoginPage';
import AttendanceCreation from './pages/Attendance';
import IndentApproval from './pages/IndentApproval';
import IndentListing from './pages/AdminIndent';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);

    // Listen for storage changes (when user logs out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        setIsAuthenticated(!!e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Header />}

        <main className={isAuthenticated ? "max-w-7xl mx-auto px-4 py-8" : ""}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <DietPlanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/masters"
              element={
                <ProtectedRoute>
                  <MastersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AttendanceCreation />
                </ProtectedRoute>
              }
            />
                  <Route
              path="/indent-request"
              element={
                <ProtectedRoute>
                  <IndentListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/indent"
              element={
                <ProtectedRoute>
                  <IndentCreation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-creation"
              element={
                <ProtectedRoute>
                  <UserCreation />
                </ProtectedRoute>

              }
            />
            <Route
              path="/indent-approval"
              element={
                <ProtectedRoute>
                  <IndentApproval />
                </ProtectedRoute>

              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;