/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, try to restore session from localStorage
    useEffect(() => {
        const token = localStorage.getItem('agriToken');
        if (token) {
            api.auth.me()
                .then(data => setUser(data))
                .catch(() => localStorage.removeItem('agriToken'))
                .finally(() => setLoading(false));
        } else {
            Promise.resolve().then(() => setLoading(false));
        }
    }, []);

    const login = async (email, password) => {
        const data = await api.auth.login({ email, password });
        localStorage.setItem('agriToken', data.token);
        setUser(data.user);
        return data;
    };

    const register = async (formData) => {
        const data = await api.auth.register(formData);
        localStorage.setItem('agriToken', data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('agriToken');
        setUser(null);
    };

    const refreshUser = async () => {
        const data = await api.auth.me();
        setUser(data);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
