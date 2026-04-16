// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import BackendStatus from "./components/BackendStatus";
import HomePage from "./pages/HomePage";
import ImageModePage from "./pages/ImageModePage";
import PdfModePage from "./pages/PdfModePage";
import FanModePage from "./pages/FanModePage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import PaymentPage from "./pages/PaymentPage";
import AdminRoute from "./components/AdminRoute";
import AdminPage from "./pages/AdminPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/image-mode"
        element={
          <ProtectedRoute>
            <ImageModePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pdf-mode"
        element={
          <ProtectedRoute>
            <PdfModePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fan-mode"
        element={
          <ProtectedRoute>
            <FanModePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <BackendStatus />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
