import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const pageMeta = {
    '/dashboard': { title: 'Live Inference', subtitle: 'Real-time gesture recognition' },
    '/analytics': { title: 'Business Analytics', subtitle: 'Model performance & prediction logs' },
    '/history': { title: 'Sentence History', subtitle: 'Review and replay your translations' },
    '/about': { title: 'About Project', subtitle: 'Technical architecture and pipeline details' },
};

export default function Topbar({ theme, onToggleTheme, onMenuClick }) {
    const location = useLocation();
    const navigate = useNavigate();
    const meta = pageMeta[location.pathname] || { title: 'Gesture AI', subtitle: '' };
    const [user, setUser] = useState(null);

    const checkUser = () => {
        const storedUser = localStorage.getItem('gesture_ai_current_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        checkUser();
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('gesture_ai_current_user');
        setUser(null);
        navigate('/');
    };

    return (
        <header className="top-navbar">
            <div>
                <h2 className="page-title">{meta.title}</h2>
                <p className="page-subtitle">{meta.subtitle}</p>
            </div>

            <div className="nav-actions">
                <span className="status-badge">🟢 Online</span>
                <button className="icon-btn" onClick={onToggleTheme} title="Toggle Theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                
                {user ? (
                    <div className="user-profile-pill">
                        <div className="user-avatar">
                            {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name">{user.fullName}</span>
                        <button className="btn-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="btn-login-link">
                        <button className="btn-login">
                            Log In
                        </button>
                    </Link>
                )}
                
                <button className="icon-btn" onClick={onMenuClick} title="Menu" style={{ display: 'none' }}
                    id="mobile-menu-btn">
                    ☰
                </button>
            </div>
        </header>
    );
}
