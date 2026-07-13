import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import DietRecommendation from '../components/DietRecommendation';
import LogObservation from '../components/LogObservation';
import StoryGenerator from '../components/StoryGenerator';
import { hasRole } from '../utils/roleHelpers';

const BACKEND_URL = 'https://vantara-backend-cwtf.onrender.com';

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value || <span className="text-gray-300">Not set</span>}</span>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${
        active ? 'bg-vantaraGreen text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

function AnimalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [twin, setTwin] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${animal.name}? This will hide the animal from all lists, but its full history will be preserved.`
    );
    if (!confirmed) return;
    try {
      await api.delete(`/animals/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert('Could not remove this animal.');
    }
  };

  const copyQRCode = () => {
    navigator.clipboard.writeText(animal.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!animal || !twin) return <p className="p-8 text-gray-500">Loading profile...</p>;

  const scoreColor = twin.healthScore >= 80 ? 'text-green-600' : twin.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600';

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {/* LEFT/MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header Card — always visible, above tabs */}
          <div className="bg-white rounded-xl shadow p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 text-center sm:text-left">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {animal.profileImage ? (
                  <img
                    src={animal.profileImage.startsWith('http') ? animal.profileImage : `${BACKEND_URL}${animal.profileImage}`}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-vantaraGreen">{animal.name}</h1>
                <p className="text-gray-500">{animal.species} <span className="text-gray-400 text-sm">· {animal.scientificName}</span></p>
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${statusColor[animal.currentStatus]}`}>
                  {animal.currentStatus}
                </span>
              </div>
              <div className="flex sm:flex-col gap-2">
                <label className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg cursor-pointer text-center">
                  📷 Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {hasRole('SuperAdmin', 'Veterinarian') && (
                  <button onClick={() => navigate(`/animal/${id}/edit`)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg">
                    ✏️ Edit
                  </button>
                )}
                {hasRole('SuperAdmin') && (
                  <button onClick={handleDelete}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg">
                    🗑️ Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Digital Health Score</p>
                <p className={`text-4xl font-bold ${scoreColor}`}>{twin.healthScore}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Risk Level</p>
                <p className="text-2xl font-semibold text-gray-800">{twin.aiRiskLevel}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>📋 Overview</TabButton>
            <TabButton active={activeTab === 'legal'} onClick={() => setActiveTab('legal')}>🏛️ Identity & Legal</TabButton>
            <TabButton active={activeTab === 'medical'} onClick={() => setActiveTab('medical')}>🩺 Medical</TabButton>
            <TabButton active={activeTab === 'diet'} onClick={() => setActiveTab('diet')}>🥗 Diet & Nutrition</TabButton>
            <TabButton active={activeTab === 'story'} onClick={() => setActiveTab('story')}>📖 Conservation Story</TabButton>
          </div>

          {/* TAB: Overview */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-xl shadow p-6 space-y-3">
              <Row label="Gender" value={animal.gender} />
              <Row label="Estimated Age" value={animal.estimatedAge ? `${animal.estimatedAge} years` : null} />
              <Row label="Species Category" value={animal.speciesCategory} />
              <Row label="Date of Arrival" value={animal.dateOfArrival ? new Date(animal.dateOfArrival).toDateString() : null} />
              <Row label="Enclosure Location" value={animal.enclosureLocation} />
              <Row label="Current Veterinarian" value={animal.currentVeterinarian?.name} />
              <Row label="Current Keeper" value={animal.currentKeeper?.name} />
              <Row label="Behavior Status" value={animal.behaviorStatus} />
              <Row label="Pregnancy Status" value={animal.pregnancyStatus} />
              <Row label="Parent Information" value={animal.parentInformation} />
              <Row label="Activity Level" value={twin.activityLevel} />
              <Row label="Diet Status" value={twin.dietStatus} />
              <Row label="Stress Level" value={twin.stressLevel} />
              <Row label="Last AI Check" value={new Date(twin.lastCalculatedAt).toLocaleString()} />

              <div className="mt-4 bg-vantaraGreen/5 border border-vantaraGreen/20 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">AI Prediction</p>
                <p className="text-vantaraGreen font-semibold">{twin.aiPredictionText}</p>
              </div>

              {twin.contributingFactors?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">Contributing Factors</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {twin.contributingFactors.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB: Identity & Legal */}
          {activeTab === 'legal' && (
            <div className="bg-white rounded-xl shadow p-6 space-y-3">
              <Row label="Microchip Number" value={animal.microchipNumber} />
              <Row label="Rescue Number" value={animal.rescueNumber} />
              <Row label="Conservation Status" value={animal.conservationStatus} />
              <Row label="Origin" value={animal.origin} />
              <Row label="Government Case Number" value={animal.governmentCaseNumber} />
              <Row label="Previous Owner" value={animal.previousOwner} />
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-1">Forest Department Details</p>
                <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                  {animal.forestDepartmentDetails || <span className="text-gray-300">Not set</span>}
                </p>
              </div>
            </div>
          )}

          {/* TAB: Medical */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow p-6 space-y-3">
                <Row label="Current Weight" value={animal.currentWeightKg ? `${animal.currentWeightKg} kg` : null} />
                <Row label="Height" value={animal.heightCm ? `${animal.heightCm} cm` : null} />
                <Row label="Body Condition Score" value={animal.bodyConditionScore ? `${animal.bodyConditionScore} / 9` : null} />
                <Row label="Blood Group" value={animal.bloodGroup} />
                <Row label="Allergy Information" value={animal.allergyInformation} />
                <div className="pt-2">
                  <p className="text-sm text-gray-500 mb-1">Medical Notes</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                    {animal.medicalNotes || <span className="text-gray-300">No notes recorded</span>}
                  </p>
                </div>
              </div>

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

              <LogObservation animalId={id} onUpdated={(updatedTwin) => setTwin(updatedTwin)} />
            </div>
          )}

          {/* TAB: Diet */}
          {activeTab === 'diet' && <DietRecommendation animalId={id} />}

          {/* TAB: Story */}
          {activeTab === 'story' && <StoryGenerator animalId={id} />}
        </div>

        {/* RIGHT COLUMN: QR Code — always visible */}
        <div>
          <div className="bg-white rounded-xl shadow p-6 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">📱 Animal QR Code</h2>
            <div className="flex justify-center bg-white p-4 rounded-lg border">
              <QRCodeSVG value={animal.qrCode} size={180} />
            </div>
            <p className="text-center text-xs text-gray-400 mt-3 break-all">{animal.qrCode}</p>
            <button onClick={copyQRCode} className="w-full mt-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg">
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