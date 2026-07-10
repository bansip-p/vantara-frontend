import { useEffect, useState } from 'react';
import api from '../services/api';

function RescueAssistant() {
  const [form, setForm] = useState({
    animalType: '',
    conditionDescription: '',
    emergencyLevel: 'Medium',
    address: '',
  });
  const [cases, setCases] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchCases = async () => {
    const res = await api.get('/rescue');
    setCases(res.data.cases);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/rescue', {
        animalType: form.animalType,
        conditionDescription: form.conditionDescription,
        emergencyLevel: form.emergencyLevel,
        location: { address: form.address },
      });
      setForm({ animalType: '', conditionDescription: '', emergencyLevel: 'Medium', address: '' });
      fetchCases();
    } catch (err) {
      alert('Could not report rescue case.');
    } finally {
      setSubmitting(false);
    }
  };

  const riskColor = { Low: 'text-green-600', Medium: 'text-yellow-600', High: 'text-red-600' };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-vantaraGreen mb-6">🚑 AI Rescue Mission Assistant</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Report New Emergency</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Animal Type</label>
              <input
                name="animalType"
                value={form.animalType}
                onChange={handleChange}
                required
                placeholder="e.g. Elephant, Tiger, Deer"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vantaraGold"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Location</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. Near village boundary, North sector"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vantaraGold"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Condition Description</label>
              <textarea
                name="conditionDescription"
                value={form.conditionDescription}
                onChange={handleChange}
                required
                rows={3}
                placeholder="e.g. Animal appears injured and trapped near a flooded area"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vantaraGold"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Emergency Level</label>
              <select
                name="emergencyLevel"
                value={form.emergencyLevel}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-vantaraGreen text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Analyzing...' : 'Submit & Get AI Recommendation'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {cases.map((c) => (
            <div key={c._id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{c.animalType}</h3>
                <span className={`text-xs font-bold ${riskColor[c.aiRecommendation?.riskLevel] || 'text-gray-600'}`}>
                  {c.aiRecommendation?.riskLevel} Risk
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{c.location?.address}</p>
              <p className="text-sm text-gray-700 mb-3">{c.conditionDescription}</p>

              <div className="text-xs text-gray-600 space-y-1">
                <p><span className="font-medium">Team:</span> {c.aiRecommendation?.recommendedTeam}</p>
                <p><span className="font-medium">Equipment:</span> {c.aiRecommendation?.equipment?.join(', ')}</p>
                <p><span className="font-medium">Medical Prep:</span> {c.aiRecommendation?.medicalPreparation?.join(', ')}</p>
              </div>

              <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RescueAssistant;