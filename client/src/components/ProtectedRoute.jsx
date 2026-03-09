import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Loading from "./Loading";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, appLoading } = useAppContext();

  if (appLoading) return <div className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;