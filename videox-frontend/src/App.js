import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./authPages/LoginPage/LoginPage";
import RegisterPage from "./authPages/RegisterPage/RegisterPage";
import DashboardPage from "./Dashboard/DashboardPage";
import AlertNotification from "./shared/components/AlertNotification";
import ProtectedRoute from "./shared/components/ProtectedRoute";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
      <AlertNotification />
    </>
  );
}

export default App;
