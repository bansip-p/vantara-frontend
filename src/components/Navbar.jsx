import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import api from '../services/api';
import { getCurrentUser, hasRole } from '../utils/roleHelpers';

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

  return (
    <nav className="bg-vantaraGreen text-white px-8 py-4 flex justify-between items-center shadow relative">
      <div className="flex items-center">
        <div className="font-bold text-lg cursor-pointer" onClick={() => navigate('/dashboard')}>
          🐘 Vantara AI Guardian
        </div>

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

      <div className="flex items-center gap-4">
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

        {user && (
          <span className="text-sm text-white/80">
            {user.name} <span className="text-white/50">· {user.role}</span>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 text-sm px-4 py-1.5 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;