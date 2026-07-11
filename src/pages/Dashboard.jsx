import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AlertCard from '../components/AlertCard';
import { hasRole } from '../utils/roleHelpers';
import socket from '../services/socket';

const PAGE_SIZE = 12;

function Dashboard() {
  const [animals, setAnimals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      const [animalsRes, alertsRes] = await Promise.all([api.get('/animals'), api.get('/alerts')]);
      setAnimals(animalsRes.data.animals);
      setAlerts(alertsRes.data.alerts.filter((a) => a.status === 'Open'));
    } catch (err) {
      setErrorMsg('Could not load data. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    socket.on('alertUpdated', () => fetchData());
    return () => socket.off('alertUpdated');
  }, []);

  // Unique species list, derived from actual data — stays accurate even as animals are added
  const speciesList = useMemo(() => {
    const unique = [...new Set(animals.map((a) => a.species))].sort();
    return ['All', ...unique];
  }, [animals]);

  const statusList = ['All', 'Stable', 'Under Observation', 'Critical', 'Recovering', 'Deceased'];

  // Apply search + filters together
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.species.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecies = speciesFilter === 'All' || animal.species === speciesFilter;
      const matchesStatus = statusFilter === 'All' || animal.currentStatus === statusFilter;
      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [animals, searchTerm, speciesFilter, statusFilter]);

  // Reset to page 1 whenever filters change (avoids landing on an empty page)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, speciesFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAnimals.length / PAGE_SIZE));
  const paginatedAnimals = filteredAnimals.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleAcknowledge = async (alertId) => {
    await api.put(`/alerts/${alertId}/status`, { status: 'Acknowledged' });
    fetchData();
  };

  const statusColor = {
    Stable: 'bg-green-100 text-green-700',
    'Under Observation': 'bg-yellow-100 text-yellow-700',
    Critical: 'bg-red-100 text-red-700',
    Recovering: 'bg-blue-100 text-blue-700',
    Deceased: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-vantaraGreen">🐘 Vantara AI Guardian Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="text-sm text-gray-500">{animals.length} Animals · {alerts.length} Open Alerts</span>
          {hasRole('SuperAdmin', 'Veterinarian') && (
            <button
              onClick={() => navigate('/add-animal')}
              className="bg-vantaraGreen text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
            >
              + Add Animal
            </button>
          )}
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

  

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search by name or species..."
          className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vantaraGold"
        />
        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-vantaraGold"
        >
          {speciesList.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Species' : s}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-vantaraGold"
        >
          {statusList.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          ))}
        </select>
        {(searchTerm || speciesFilter !== 'All' || statusFilter !== 'All') && (
          <button
            onClick={() => { setSearchTerm(''); setSpeciesFilter('All'); setStatusFilter('All'); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-3"
          >
            ✕ Clear
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-700">
          Animals <span className="text-sm font-normal text-gray-400">({filteredAnimals.length} matching)</span>
        </h2>
      </div>

      {filteredAnimals.length === 0 && (
        <p className="text-sm text-gray-400 bg-white rounded-xl shadow p-6 text-center">
          No animals match your search or filters.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {paginatedAnimals.map((animal) => (
          <div
            key={animal._id}
            onClick={() => navigate(`/animal/${animal._id}`)}
            className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {animal.profileImage ? (
                    <img
                      src={animal.profileImage.startsWith('http') ? animal.profileImage : `https://vantara-backend-cwtf.onrender.com${animal.profileImage}`}
                      alt={animal.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className="w-full h-full items-center justify-center text-lg" style={{ display: animal.profileImage ? 'none' : 'flex' }}>🐾</div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{animal.name}</h2>
                  <p className="text-sm text-gray-500">{animal.species}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[animal.currentStatus]}`}>
                {animal.currentStatus}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-4">QR: {animal.qrCode}</p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm bg-white border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500 px-3">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm bg-white border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;