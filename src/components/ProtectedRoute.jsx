import { Navigate } from 'react-router-dom';
import Layout from './Layout';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('vantara_token');

  // No token? Bounce back to login immediately.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists? Show the page, wrapped in our Layout (Navbar included).
  return <Layout>{children}</Layout>;
}

export default ProtectedRoute;