import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileForm from './pages/ProfileForm';
import UnknownFields from './pages/UnknownFields';
import Onboarding from './pages/Onboarding';

function AppRoutes() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="loading-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_complete') === 'true';

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to={hasCompletedOnboarding ? "/" : "/onboarding"} replace /> : <Login />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/onboarding" replace /> : <Register />}
            />
            <Route
                path="/onboarding"
                element={
                    <PrivateRoute>
                        <Onboarding />
                    </PrivateRoute>
                }
            />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        {!hasCompletedOnboarding ? <Navigate to="/onboarding" replace /> : <ProfileForm />}
                    </PrivateRoute>
                }
            />
            <Route
                path="/unknown-fields"
                element={
                    <PrivateRoute>
                        <UnknownFields />
                    </PrivateRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            backdropFilter: 'blur(10px)',
                        },
                        success: {
                            iconTheme: {
                                primary: 'var(--success)',
                                secondary: 'white',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: 'var(--error)',
                                secondary: 'white',
                            },
                        },
                    }}
                />
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
