import { useEffect, useState } from 'react';
import api from '../services/api';
import AlertCard from '../components/AlertCard';
import socket from '../services/socket';

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Open');
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.alerts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    socket.on('newAlert', () => fetchAlerts());
    socket.on('alertUpdated', () => fetchAlerts());
    return () => {
      socket.off('newAlert');
      socket.off('alertUpdated');
    };
  }, []);

  const handleAcknowledge = async (alertId) => {
    await api.put(`/alerts/${alertId}/status`, { status: 'Acknowledged' });
    fetchAlerts();
  };

  const filteredAlerts = statusFilter === 'All' ? alerts : alerts.filter((a) => a.status === statusFilter);
  const openCount = alerts.filter((a) => a.status === 'Open').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-vantaraGreen">🚨 AI Health Alerts</h1>
        <span className="text-sm text-gray-500">{openCount} Open · {alerts.length} Total</span>
      </div>

      <div className="flex gap-2 mb-6">
        {['Open', 'Acknowledged', 'Resolved', 'All'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === s
                ? 'bg-vantaraGreen text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading alerts...</p>}

      {!loading && filteredAlerts.length === 0 && (
        <p className="text-sm text-gray-400 bg-white rounded-xl shadow p-6 text-center">
          No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} alerts to show.
        </p>
      )}

      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <AlertCard key={alert._id} alert={alert} onAcknowledge={handleAcknowledge} />
        ))}
      </div>
    </div>
  );
}

export default AlertsPage;