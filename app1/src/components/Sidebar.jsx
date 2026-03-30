import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const GESTURE_VOCAB = [
    'afraid', 'agree', 'assistance', 'bad', 'become', 'college',
    'doctor', 'from', 'how', 'pain', 'pray', 'secondary',
    'skin', 'small', 'specific', 'stand', 'today', 'warn',
    'where', 'which', 'work', 'you'
];

const navItems = [
    { path: '/dashboard', icon: '🎥', label: 'Live Inference' },
    { path: '/analytics', icon: '📊', label: 'Analytics' },
    { path: '/history', icon: '📜', label: 'History' },
    { path: '/about', icon: 'ℹ️', label: 'About' },
];

export default function Sidebar({ open, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [vocabOpen, setVocabOpen] = useState(false);

    const handleNav = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <nav className={`sidebar${open ? ' open' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">🤟</div>
                <h1>Gesture AI</h1>
            </div>

            {/* Navigation */}
            <p className="nav-label">Main Menu</p>
            <ul className="nav-links">
                {navItems.map(item => (
                    <li
                        key={item.path}
                        className={location.pathname === item.path ? 'active' : ''}
                        onClick={() => handleNav(item.path)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </li>
                ))}
            </ul>

            {/* Gesture Vocabulary Dropdown */}
            <div className={`dropdown-container${vocabOpen ? ' open' : ''}`}>
               <div className="dropdown-trigger" onClick={() => setVocabOpen(!vocabOpen)}>
                   <span>📚 Vocabulary ({GESTURE_VOCAB.length})</span>
                   <span>{vocabOpen ? '▲' : '▼'}</span>
               </div>
               <div className="dropdown-content">
                   {GESTURE_VOCAB.map(g => (
                       <span key={g} className="dropdown-item">{g}</span>
                   ))}
               </div>
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="status-indicator">
                    <span className="status-dot" />
                    System Online
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '4px 14px' }}>
                    Model: MLP • 22 Classes • TFLite
                </div>
            </div>
        </nav>
    );
}
