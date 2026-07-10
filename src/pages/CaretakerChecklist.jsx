import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function CaretakerChecklist() {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [checklist, setChecklist] = useState(null);

  const fetchData = async () => {
    const animalRes = await api.get(`/animals/${animalId}`);
    setAnimal(animalRes.data.animal);

    const checklistRes = await api.get(`/dailycare/today/${animalId}`);
    setChecklist(checklistRes.data.checklist);
  };

  useEffect(() => {
    fetchData();
  }, [animalId]);

  const toggleItem = async (field) => {
    const updated = await api.put(`/dailycare/${checklist._id}`, { [field]: !checklist[field] });
    setChecklist(updated.data.checklist);
  };

  if (!animal || !checklist) return <p className="p-6 text-gray-500">Loading checklist...</p>;

  const items = [
    { key: 'foodGiven', label: '🍽️ Food Given' },
    { key: 'waterGiven', label: '💧 Water Given' },
    { key: 'medicineGiven', label: '💊 Medicine Given' },
    { key: 'enclosureCleaned', label: '🧹 Enclosure Cleaned' },
  ];

  const completedCount = items.filter((i) => checklist[i.key]).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button onClick={() => navigate('/scan')} className="text-sm text-vantaraGreen mb-4">
        ← Back to Scanner
      </button>

      <div className="bg-white rounded-xl shadow p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800">{animal.name}</h1>
        <p className="text-sm text-gray-500 mb-4">{animal.species} · Today's Checklist</p>

        <div className="text-sm text-gray-500 mb-4">{completedCount} of {items.length} tasks completed</div>

        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => toggleItem(item.key)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition ${
                checklist[item.key]
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-lg">{checklist[item.key] ? '✅' : '⬜'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CaretakerChecklist;