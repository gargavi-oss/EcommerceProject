import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
            </div>
        );
    }

    return user ? children : <Navigate to="/login" />;
}

export function AdminRoute({ children }) {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;
    if (!isAdmin) return <Navigate to="/" />;

    return children;
}
