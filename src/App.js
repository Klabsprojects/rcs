import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import DietPlanner from './components/Dietplanner';
import Dashboard from './components/Dashboard';
import IndentCreation from './components/Indent';
import UserCreation from './components/UserCreation';
import LoginPage from './pages/LoginPage';

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
                // <ProtectedRoute>
                  <UserCreation />
                // </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;