import { useEffect, useState } from 'react';
import api from '../services/api';

const MEAL_TYPES = ['morning', 'midday', 'evening', 'supplement'];
const UNITS = ['kg', 'g', 'liters', 'units'];

function DietRecommendation({ animalId }) {
  const [diet, setDiet] = useState(null);
  const [logs, setLogs] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // New meal form state
  const [mealType, setMealType] = useState('morning');
  const [foodName, setFoodName] = useState('');
  const [foodQuantity, setFoodQuantity] = useState('');
  const [foodUnit, setFoodUnit] = useState('kg');
  const [followedRecommendation, setFollowedRecommendation] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    api.get(`/diet/${animalId}`).then((res) => setDiet(res.data.dietPlan));
    refreshNutritionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalId]);

  const refreshNutritionData = () => {
    setLoadingLogs(true);
    Promise.all([
      api.get(`/diet/log/${animalId}`),
      api.get(`/diet/compliance/${animalId}`),
    ])
      .then(([logsRes, complianceRes]) => {
        setLogs(logsRes.data.logs);
        setCompliance(complianceRes.data);
      })
      .catch(() => setError('Could not load nutrition history.'))
      .finally(() => setLoadingLogs(false));
  };

  const handleLogMeal = async (e) => {
    e.preventDefault();
    if (!foodName || !foodQuantity) {
      setError('Please enter a food item and quantity.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post(`/diet/log/${animalId}`, {
        mealType,
        foodItems: [{ name: foodName, quantity: Number(foodQuantity), unit: foodUnit }],
        followedRecommendation,
        notes,
      });
      // Reset form
      setFoodName('');
      setFoodQuantity('');
      setNotes('');
      refreshNutritionData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log meal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!diet) return null;

  return (
    <div className="space-y-6 mt-6">
      {/* Existing AI Diet Recommendation card — unchanged */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">🥗 AI Diet Recommendation</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Recommended Food</p>
            <p className="text-xl font-bold text-vantaraGreen">{diet.foodQuantityKg} kg/day</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Category</p>
            <p className="text-sm font-medium text-gray-800 mt-2">{diet.nutritionCategory}</p>
          </div>
        </div>

        {diet.supplements.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Recommended Supplements</p>
            <div className="flex flex-wrap gap-2">
              {diet.supplements.map((s, i) => (
                <span key={i} className="text-xs bg-vantaraGold/10 text-vantaraGold border border-vantaraGold/30 px-2 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {diet.reasons.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Reasoning</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {diet.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Compliance banner */}
      {compliance && (
        <div
          className={`rounded-xl shadow p-4 flex items-center justify-between ${
            compliance.isCompliant ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <div>
            <p className={`text-sm font-semibold ${compliance.isCompliant ? 'text-green-700' : 'text-amber-700'}`}>
              {compliance.isCompliant ? '✅ Feeding on track' : '⚠️ Feeding below schedule'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {compliance.mealsLogged} / {compliance.expectedMeals} meals logged in the last 24h
            </p>
          </div>
        </div>
      )}

      {/* Log a meal */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">📋 Log a Meal</h2>

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleLogMeal} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {MEAL_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Followed Recommendation?</label>
              <select
                value={followedRecommendation ? 'yes' : 'no'}
                onChange={(e) => setFollowedRecommendation(e.target.value === 'yes')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-xs text-gray-500 block mb-1">Food Item</label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Hay"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Quantity</label>
              <input
                type="number"
                value={foodQuantity}
                onChange={(e) => setFoodQuantity(e.target.value)}
                placeholder="5"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Unit</label>
              <select
                value={foodUnit}
                onChange={(e) => setFoodUnit(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-vantaraGreen text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? 'Logging...' : 'Log Meal'}
          </button>
        </form>
      </div>

      {/* Feeding history */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">🕒 Feeding History</h2>

        {loadingLogs ? (
          <p className="text-xs text-gray-500">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-xs text-gray-500">No meals logged yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {logs.map((log) => (
              <li key={log._id} className="py-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 capitalize">{log.mealType}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {log.foodItems.map((f) => `${f.name} (${f.quantity}${f.unit})`).join(', ')}
                  </p>
                  {log.notes && <p className="text-xs text-gray-400 mt-1">{log.notes}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Logged by {log.recordedBy?.name || 'Unknown'} ({log.recordedBy?.role || 'N/A'})
                  </p>
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DietRecommendation;