import { useState } from 'react';
import api from '../services/api';

function LogObservation({ animalId, onUpdated }) {
  const [form, setForm] = useState({
    movementChangePercent: 0,
    foodIntakeChangePercent: 0,
    weightChangePercent: 0,
    stressLevel: 'Low',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'stressLevel' ? value : Number(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.put(`/animals/${animalId}/recalculate`, form);
      onUpdated(response.data.digitalTwin); // send new score back up to the profile page
    } catch (err) {
      alert('Could not log observation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="text-sm font-semibold text-gray-600 mb-4">📝 Log New Observation</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-500">Movement Change (%)</label>
          <input
            type="range"
            name="movementChangePercent"
            min="-100"
            max="50"
            value={form.movementChangePercent}
            onChange={handleChange}
            className="w-full"
          />
          <p className="text-xs text-gray-400">{form.movementChangePercent}% vs normal</p>
        </div>

        <div>
          <label className="text-xs text-gray-500">Food Intake Change (%)</label>
          <input
            type="range"
            name="foodIntakeChangePercent"
            min="-100"
            max="50"
            value={form.foodIntakeChangePercent}
            onChange={handleChange}
            className="w-full"
          />
          <p className="text-xs text-gray-400">{form.foodIntakeChangePercent}% vs normal</p>
        </div>

        <div>
          <label className="text-xs text-gray-500">Weight Change (%)</label>
          <input
            type="range"
            name="weightChangePercent"
            min="-20"
            max="20"
            value={form.weightChangePercent}
            onChange={handleChange}
            className="w-full"
          />
          <p className="text-xs text-gray-400">{form.weightChangePercent}% vs normal</p>
        </div>

        <div>
          <label className="text-xs text-gray-500">Stress Level</label>
          <select
            name="stressLevel"
            value={form.stressLevel}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-vantaraGreen text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Analyzing...' : 'Submit Observation & Run AI Analysis'}
        </button>
      </form>
    </div>
  );
}

export default LogObservation;