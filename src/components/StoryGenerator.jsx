import { useEffect, useState } from 'react';
import api from '../services/api';

function StoryGenerator({ animalId }) {
  const [stories, setStories] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [medicalHighlights, setMedicalHighlights] = useState('');

  const fetchStories = async () => {
    const res = await api.get(`/reports/animal/${animalId}`);
    setStories(res.data.reports);
  };

  useEffect(() => {
    fetchStories();
  }, [animalId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post(`/reports/generate/${animalId}`, { medicalHighlights });
      setMedicalHighlights('');
      fetchStories();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not generate story.');
    } finally {
      setGenerating(false);
    }
  };

  const togglePublish = async (reportId) => {
    await api.put(`/reports/${reportId}/publish`);
    fetchStories();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="text-sm font-semibold text-gray-600 mb-4">📖 AI Conservation Story Generator</h2>

      <textarea
        value={medicalHighlights}
        onChange={(e) => setMedicalHighlights(e.target.value)}
        placeholder="Optional: add real context, e.g. rescue circumstances, notable recovery details..."
        className="w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold mb-3"
        rows={2}
      />

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="bg-vantaraGreen text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
      >
        {generating ? '✨ Writing story...' : '✨ Generate New Story'}
      </button>

      <div className="mt-6 space-y-4">
        {stories.map((report) => (
          <div key={report._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => togglePublish(report._id)}
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  report.isPublished
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {report.isPublished ? '✅ Published' : 'Publish'}
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {report.generatedContent}
            </p>
          </div>
        ))}
        {stories.length === 0 && (
          <p className="text-sm text-gray-400">No stories generated yet for this animal.</p>
        )}
      </div>
    </div>
  );
}

export default StoryGenerator;