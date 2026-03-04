import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const res = await authService.getProfile();
            setUser(res.data);
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const res = await authService.login(credentials);
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (data) => {
        const res = await authService.register(data);
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
}
