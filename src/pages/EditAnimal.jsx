import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function EditAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/animals/${id}`).then((res) => {
      const a = res.data.animal;
      setForm({
        name: a.name || '',
        species: a.species || '',
        scientificName: a.scientificName || '',
        gender: a.gender || 'Unknown',
        estimatedAge: a.estimatedAge || '',
        dateOfArrival: a.dateOfArrival ? a.dateOfArrival.slice(0, 10) : '',
        enclosureLocation: a.enclosureLocation || '',
        currentStatus: a.currentStatus || 'Stable',
      });
    });
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.put(`/animals/${id}`, form);
      navigate(`/animal/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update animal.');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p className="p-8 text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="bg-white rounded-xl shadow p-6 sm:p-8 max-w-xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-vantaraGreen mb-6">✏️ Edit Animal</h1>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Species</label>
            <input name="species" value={form.species} onChange={handleChange} required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Scientific Name</label>
            <input name="scientificName" value={form.scientificName} onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg bg-white">
                <option>Unknown</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Estimated Age</label>
              <input name="estimatedAge" type="number" value={form.estimatedAge} onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Current Status</label>
            <select name="currentStatus" value={form.currentStatus} onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-white">
              <option>Stable</option>
              <option>Under Observation</option>
              <option>Critical</option>
              <option>Recovering</option>
              <option>Deceased</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Date of Arrival</label>
            <input name="dateOfArrival" type="date" value={form.dateOfArrival} onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Enclosure Location</label>
            <input name="enclosureLocation" value={form.enclosureLocation} onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/animal/${id}`)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-vantaraGreen text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAnimal;