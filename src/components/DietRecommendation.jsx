import { useEffect, useState } from 'react';
import api from '../services/api';

function DietRecommendation({ animalId }) {
  const [diet, setDiet] = useState(null);

  useEffect(() => {
    api.get(`/diet/${animalId}`).then((res) => setDiet(res.data.dietPlan));
  }, [animalId]);

  if (!diet) return null;

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
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
  );
}

export default DietRecommendation;