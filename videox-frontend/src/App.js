// Main application component
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./authPages/LoginPage/LoginPage"; // Login page
import RegisterPage from "./authPages/RegisterPage/RegisterPage"; // Register page
import DashboardPage from "./Dashboard/DashboardPage"; // Dashboard page
import AlertNotification from "./shared/components/AlertNotification"; // Global alert notification
import ProtectedRoute from "./shared/components/ProtectedRoute"; // Route protection for authenticated users
import HomePage from "./HomePage";

function App() {
  return (
    <>
      {/* Setting up application routes */}
      <Router>
        <Routes>
          {/* Home page */}
          <Route path="/" element={<HomePage />} />
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Protected dashboard route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      {/* Global alert notification component */}
      <AlertNotification />
    </>
  );
}

export default App;
