import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Home from './pages/Home';
import History from './pages/History';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './index.css';

function AppContent({ theme, toggleTheme }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const hideLayout = isHomePage || isAuthPage;

  return (
    <div className={`app-container${hideLayout ? ' full-width' : ''}`}>
      {!hideLayout && (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className="content">
        {!hideLayout && (
          <Topbar 
            theme={theme} 
            onToggleTheme={toggleTheme} 
            onMenuClick={() => setSidebarOpen(o => !o)} 
          />
        )}
        <div className={hideLayout ? '' : 'main-view'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <BrowserRouter>
      <AppContent theme={theme} toggleTheme={toggleTheme} />
    </BrowserRouter>
  );
}
