import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Import all page components
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// This helper component protects routes that require a user to be logged in
const PrivateRoute = ({ children, adminOnly = false }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // If no token exists, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const isUserAdmin = decodedToken.is_admin || false;

        // If this route is for admins only and the user is not an admin, redirect them
        if (adminOnly && !isUserAdmin) {
            return <Navigate to="/dashboard" replace />;
        }

        // If all checks pass, render the requested component
        return children;

    } catch (error) {
        // If the token is malformed or expired, clear it and redirect to login
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
};

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container my-5">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* User Protected Route */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Admin Protected Route */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

          {/* Redirect the root path "/" to the appropriate page */}
          <Route 
            path="/" 
            element={<Navigate to={localStorage.getItem('token') ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;