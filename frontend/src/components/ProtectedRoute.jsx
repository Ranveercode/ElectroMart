import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ isAuthenticated, adminOnly, currentUser, children }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && (!currentUser || currentUser.role !== "admin")) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;