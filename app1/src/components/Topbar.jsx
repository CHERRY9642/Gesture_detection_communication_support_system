import { useLocation, Link } from 'react-router-dom';

const pageMeta = {
    '/dashboard': { title: 'Live Inference', subtitle: 'Real-time gesture recognition' },
    '/analytics': { title: 'Business Analytics', subtitle: 'Model performance & prediction logs' },
    '/history': { title: 'Sentence History', subtitle: 'Review and replay your translations' },
    '/about': { title: 'About Project', subtitle: 'Technical architecture and pipeline details' },
};

export default function Topbar({ theme, onToggleTheme, onMenuClick }) {
    const location = useLocation();
    const meta = pageMeta[location.pathname] || { title: 'Gesture AI', subtitle: '' };

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
                <Link to="/login" className="btn-login-link">
                    <button className="btn-login">
                        Log In
                    </button>
                </Link>
                <button className="icon-btn" onClick={onMenuClick} title="Menu" style={{ display: 'none' }}
                    id="mobile-menu-btn">
                    ☰
                </button>
            </div>
        </header>
    );
}
