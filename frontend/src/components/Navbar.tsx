import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User, FileQuestion, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <div className="navbar-brand-icon">
                    <Briefcase size={20} />
                </div>
                <span>Formless</span>
            </Link>

            <div className="navbar-nav">
                <Link
                    to="/"
                    className={`nav-link ${isActive('/') ? 'active' : ''}`}
                >
                    <User size={18} />
                    <span>Profile</span>
                </Link>
                <Link
                    to="/unknown-fields"
                    className={`nav-link ${isActive('/unknown-fields') ? 'active' : ''}`}
                >
                    <FileQuestion size={18} />
                    <span>Unknown Fields</span>
                </Link>

                <button onClick={logout} className="btn btn-ghost btn-sm">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
}
