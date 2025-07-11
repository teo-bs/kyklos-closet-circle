
import { Navigate } from 'react-router-dom';

const Login = () => {
  // Redirect to home page since auth is now handled by ProtectedRoute
  return <Navigate to="/" replace />;
};

export default Login;
