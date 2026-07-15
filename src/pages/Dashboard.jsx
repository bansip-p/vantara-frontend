import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { hasRole } from '../utils/roleHelpers';
import socket from '../services/socket';

const PAGE_SIZE_OPTIONS = [12, 25, 50, 100, 200];

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
  const [pageSize, setPageSize] = useState(100);

  const [lowStockItems, setLowStockItems] = useState([]);

  const fetchData = async () => {
    try {
      const [animalsRes, alertsRes, inventoryRes] = await Promise.all([
        api.get('/animals'),
        api.get('/alerts'),
        api.get('/inventory', { params: { lowStockOnly: true } }),
      ]);
      setAnimals(animalsRes.data.animals);
      setAlerts(alertsRes.data.alerts.filter((a) => a.status === 'Open'));
      setLowStockItems(inventoryRes.data.items);
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

  // Reset to page 1 whenever filters or page size change (avoids landing on an empty page)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, speciesFilter, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAnimals.length / pageSize));
  const paginatedAnimals = filteredAnimals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusColor = {
    Stable: 'bg-green-100 text-green-700',
    'Under Observation': 'bg-yellow-100 text-yellow-700',
    Critical: 'bg-red-100 text-red-700',
    Recovering: 'bg-blue-100 text-blue-700',
    Deceased: 'bg-gray-100 text-gray-600',
  };

  // --- Command Center derived stats ---
  const criticalAnimals = useMemo(
    () => animals.filter((a) => a.currentStatus === 'Critical'),
    [animals]
  );

  const alertsBySeverity = useMemo(() => {
    const counts = { Critical: 0, Warning: 0, Info: 0 };
    alerts.forEach((a) => {
      if (counts[a.severity] !== undefined) counts[a.severity] += 1;
    });
    return counts;
  }, [alerts]);

  const overdueCareCount = useMemo(
    () => alerts.filter((a) => a.alertType === 'Checkup Overdue' || a.alertType === 'Medicine Overdue').length,
    [alerts]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
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

      {/* Command Center — stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Total Animals</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{animals.length}</p>
          {criticalAnimals.length > 0 && (
            <p className="text-xs text-red-600 font-medium mt-1">{criticalAnimals.length} Critical</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Open Alerts</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{alerts.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            <span className="text-red-600 font-medium">{alertsBySeverity.Critical} Critical</span>
            {' · '}
            <span className="text-amber-600 font-medium">{alertsBySeverity.Warning} Warning</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Low Stock Items</p>
          <p className={`text-2xl font-bold mt-1 ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
            {lowStockItems.length}
          </p>
          {lowStockItems.length > 0 && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {lowStockItems.slice(0, 2).map((i) => i.name).join(', ')}
              {lowStockItems.length > 2 ? '…' : ''}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Overdue Care</p>
          <p className={`text-2xl font-bold mt-1 ${overdueCareCount > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
            {overdueCareCount}
          </p>
          <p className="text-xs text-gray-400 mt-1">Checkups + Medicine</p>
        </div>
      </div>

      {/* Critical Animals quick-list */}
      {criticalAnimals.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl shadow p-4 mb-6">
          <p className="text-sm font-semibold text-red-700 mb-2">🚨 Critical Animals Needing Attention</p>
          <div className="flex flex-wrap gap-2">
            {criticalAnimals.map((animal) => (
              <button
                key={animal._id}
                onClick={() => navigate(`/animal/${animal._id}`)}
                className="text-xs bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
              >
                {animal.name} · {animal.species}
              </button>
            ))}
          </div>
        </div>
      )}

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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-vantaraGold"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
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
    </div>
  );
}

export default Dashboard;