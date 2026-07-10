import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import DietRecommendation from '../components/DietRecommendation';
import LogObservation from '../components/LogObservation';
import StoryGenerator from '../components/StoryGenerator';

function AnimalProfile() {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [twin, setTwin] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [copied, setCopied] = useState(false);

  const fetchProfile = async () => {
    const response = await api.get(`/animals/${id}`);
    setAnimal(response.data.animal);
    setTwin(response.data.digitalTwin);

    const alertsRes = await api.get(`/alerts/animal/${id}`);
    setAlerts(alertsRes.data.alerts);
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.put(`/animals/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnimal(response.data.animal);
    } catch (err) {
      alert('Could not upload photo.');
    }
  };

  const copyQRCode = () => {
    navigator.clipboard.writeText(animal.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!animal || !twin) return <p className="p-8 text-gray-500">Loading profile...</p>;

  const scoreColor =
    twin.healthScore >= 80 ? 'text-green-600' : twin.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  const statusColor = {
    Stable: 'bg-green-100 text-green-700',
    'Under Observation': 'bg-yellow-100 text-yellow-700',
    Critical: 'bg-red-100 text-red-700',
    Recovering: 'bg-blue-100 text-blue-700',
    Deceased: 'bg-gray-100 text-gray-600',
  };

  const severityColor = {
    Info: 'border-blue-300 bg-blue-50 text-blue-700',
    Warning: 'border-yellow-400 bg-yellow-50 text-yellow-700',
    Critical: 'border-red-400 bg-red-50 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {/* LEFT COLUMN: Main profile + QR + Alerts */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header Card */}
          <div className="bg-white rounded-xl shadow p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {animal.profileImage ? (
                  <img
                    src={animal.profileImage.startsWith('http') ? animal.profileImage : `https://vantara-backend-cwtf.onrender.com${animal.profileImage}`}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-vantaraGreen">{animal.name}</h1>
                <p className="text-gray-500">{animal.species} <span className="text-gray-400 text-sm">· {animal.scientificName}</span></p>
              </div>
              <label className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg cursor-pointer">
                📷 Upload Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Digital Health Score</p>
                <p className={`text-4xl font-bold ${scoreColor}`}>{twin.healthScore}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Risk Level</p>
                <p className="text-2xl font-semibold text-gray-800">{twin.aiRiskLevel}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Current Condition</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[animal.currentStatus]}`}>
                  {animal.currentStatus}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Gender</span>
                <span className="font-medium">{animal.gender}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Estimated Age</span>
                <span className="font-medium">{animal.estimatedAge ?? 'Unknown'} years</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Date of Arrival</span>
                <span className="font-medium">{animal.dateOfArrival ? new Date(animal.dateOfArrival).toDateString() : 'Unknown'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Enclosure Location</span>
                <span className="font-medium">{animal.enclosureLocation || 'Not set'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Activity Level</span>
                <span className="font-medium">{twin.activityLevel}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Diet Status</span>
                <span className="font-medium">{twin.dietStatus}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Stress Level</span>
                <span className="font-medium">{twin.stressLevel}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Last AI Check</span>
                <span className="font-medium">{new Date(twin.lastCalculatedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 bg-vantaraGreen/5 border border-vantaraGreen/20 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">AI Prediction</p>
              <p className="text-vantaraGreen font-semibold">{twin.aiPredictionText}</p>
            </div>

            {twin.contributingFactors?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Contributing Factors</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {twin.contributingFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Alert History Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">🚨 Alert History ({alerts.length})</h2>
            {alerts.length === 0 && <p className="text-sm text-gray-400">No alerts recorded for this animal.</p>}
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert._id} className={`border-l-4 rounded-lg p-3 text-sm ${severityColor[alert.severity]}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase">{alert.severity}</span>
                    <span className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p>{alert.observation}</p>
                  <span className="text-xs italic text-gray-500">Status: {alert.status}</span>
                </div>
              ))}
            </div>
          </div>

          <DietRecommendation animalId={id} />
          <LogObservation animalId={id} onUpdated={(updatedTwin) => setTwin(updatedTwin)} />
          <StoryGenerator animalId={id} />
        </div>

        {/* RIGHT COLUMN: QR Code */}
        <div>
          <div className="bg-white rounded-xl shadow p-6 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">📱 Animal QR Code</h2>
            <div className="flex justify-center bg-white p-4 rounded-lg border">
              <QRCodeSVG value={animal.qrCode} size={180} />
            </div>
            <p className="text-center text-xs text-gray-400 mt-3 break-all">{animal.qrCode}</p>
            <button
              onClick={copyQRCode}
              className="w-full mt-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg"
            >
              {copied ? '✅ Copied!' : '📋 Copy Code'}
            </button>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Print this and attach it near the animal's enclosure. Caretakers can scan it or type the code manually at the Scan page.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AnimalProfile;