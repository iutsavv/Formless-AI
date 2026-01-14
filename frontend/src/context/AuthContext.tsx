import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/client';

interface User {
    id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        const { data, error } = await api.getMe();
        if (data?.user) {
            setUser(data.user);
        } else {
            localStorage.removeItem('token');
        }
        setIsLoading(false);
    };

    const login = async (email: string, password: string) => {
        const { data, error } = await api.login(email, password);

        if (error) {
            return { success: false, error };
        }

        if (data) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true };
        }

        return { success: false, error: 'Unknown error occurred' };
    };

    const register = async (email: string, password: string) => {
        const { data, error } = await api.register(email, password);

        if (error) {
            return { success: false, error };
        }

        if (data) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true };
        }

        return { success: false, error: 'Unknown error occurred' };
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
