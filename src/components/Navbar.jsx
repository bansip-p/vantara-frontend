import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import api from '../services/api';
import { getCurrentUser, hasRole } from '../utils/roleHelpers';
import Logo from './Logo';

function IconButton({ onClick, label, children }) {
  return (
    <div className="relative group">
      <button onClick={onClick} className="text-white/90 hover:text-white">
        {children}
      </button>
      <span className="pointer-events-none absolute top-full mt-2 right-0 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {label}
      </span>
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [openAlertCount, setOpenAlertCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchAlertCount = async () => {
    try {
      const res = await api.get('/alerts');
      setOpenAlertCount(res.data.alerts.filter((a) => a.status === 'Open').length);
    } catch (err) {}
  };

  useEffect(() => {
    fetchAlertCount();
    socket.on('newAlert', fetchAlertCount);
    socket.on('alertUpdated', fetchAlertCount);
    return () => {
      socket.off('newAlert', fetchAlertCount);
      socket.off('alertUpdated', fetchAlertCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vantara_token');
    localStorage.removeItem('vantara_user');
    socket.disconnect();
    navigate('/login');
  };

  const goTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-vantaraGreen text-white shadow relative">
      <div className="px-4 sm:px-6 py-2.5 flex justify-between items-center">
        {/* Logo */}
        <Logo onClick={() => goTo('/dashboard')} />

        {/* Desktop nav links — hidden on small screens */}
        <div className="hidden md:flex items-center ml-4">
          <button onClick={() => navigate('/scan')} className="text-sm text-white/80 hover:text-white ml-4">
            📷 Scan
          </button>
          {hasRole('SuperAdmin', 'Veterinarian') && (
            <button onClick={() => navigate('/rescue')} className="text-sm text-white/80 hover:text-white ml-4">
              🚑 Rescue
            </button>
          )}
          {hasRole('SuperAdmin', 'ManagementViewer', 'Veterinarian') && (
            <button onClick={() => navigate('/analytics')} className="text-sm text-white/80 hover:text-white ml-4">
              📊 Analytics
            </button>
          )}
        </div>

        {/* Right side: always visible */}
        <div className="flex items-center gap-3 sm:gap-4">
          <IconButton onClick={() => navigate('/help')} label="Help & User Guide">
            <span className="text-lg">❓</span>
          </IconButton>

          <div className="relative group">
            <button onClick={() => navigate('/alerts')} className="relative text-white/90 hover:text-white">
              <span className="text-xl">🔔</span>
              {openAlertCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {openAlertCount > 99 ? '99+' : openAlertCount}
                </span>
              )}
            </button>
            <span className="pointer-events-none absolute top-full mt-2 right-0 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
              View AI Health Alerts
            </span>
          </div>

          {/* User name — hidden on small screens to save space */}
          {user && (
            <button
              onClick={() => goTo('/profile')}
              className="hidden lg:inline text-sm text-white/80 hover:text-white"
            >
              {user.name} <span className="text-white/50">· {user.role}</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="hidden sm:inline-block bg-white/10 hover:bg-white/20 text-sm px-4 py-1.5 rounded-lg transition"
          >
            Logout
          </button>

          {/* Hamburger — only visible on small/medium screens */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white text-xl"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-vantaraGreen border-t border-white/10 px-4 py-3 space-y-1">
          {user && (
            <button
              onClick={() => goTo('/profile')}
              className="block w-full text-left text-sm text-white/70 pb-2 border-b border-white/10 mb-2"
            >
              {user.name} · {user.role} (edit)
            </button>
          )}
          <button onClick={() => goTo('/scan')} className="block w-full text-left text-sm text-white/90 py-2">
            📷 Scan
          </button>
          {hasRole('SuperAdmin', 'Veterinarian') && (
            <button onClick={() => goTo('/rescue')} className="block w-full text-left text-sm text-white/90 py-2">
              🚑 Rescue
            </button>
          )}
          {hasRole('SuperAdmin', 'ManagementViewer', 'Veterinarian') && (
            <button onClick={() => goTo('/analytics')} className="block w-full text-left text-sm text-white/90 py-2">
              📊 Analytics
            </button>
          )}
          <button onClick={handleLogout} className="block w-full text-left text-sm text-white/90 py-2 border-t border-white/10 mt-2 pt-3">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;