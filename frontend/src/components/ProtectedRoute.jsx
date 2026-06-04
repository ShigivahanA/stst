import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        addToast('Please login to access this portal', 'error');
        navigate('/login');
      } else if (requiredRole && user.role !== requiredRole) {
        addToast('Access denied. Admin privileges required.', 'error');
        navigate('/');
      }
    }
  }, [user, loading, navigate, addToast, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-artisan-dark flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-artisan-grey border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return user && (!requiredRole || user.role === requiredRole) ? children : null;
}
