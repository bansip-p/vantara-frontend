import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

function AddAnimal() {
  const [form, setForm] = useState({
    name: '',
    species: '',
    scientificName: '',
    gender: 'Unknown',
    estimatedAge: '',
    dateOfArrival: '',
    enclosureLocation: '',
    currentStatus: 'Stable',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [createdAnimal, setCreatedAnimal] = useState(null); // holds the result after successful creation
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/animals', form);
      let animal = response.data.animal;

      // If a photo was selected, upload it immediately as a second step
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const photoRes = await api.put(`/animals/${animal._id}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        animal = photoRes.data.animal;
      }

      setCreatedAnimal(animal); // show the success/QR screen instead of navigating away immediately
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add animal.');
    }
  };

  // ─── SUCCESS SCREEN: shown right after creation, so QR can be printed/copied before leaving ───
  if (createdAnimal) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-xl shadow p-8 max-w-md mx-auto text-center">
          <p className="text-green-600 text-3xl mb-2">✅</p>
          <h1 className="text-xl font-bold text-vantaraGreen mb-1">{createdAnimal.name} Registered!</h1>
          <p className="text-sm text-gray-500 mb-6">{createdAnimal.species}</p>

          <div className="flex justify-center bg-white p-4 rounded-lg border mb-3">
            <QRCodeSVG value={createdAnimal.qrCode} size={180} />
          </div>
          <p className="text-xs text-gray-400 mb-6 break-all">{createdAnimal.qrCode}</p>

          <p className="text-xs text-gray-500 mb-6">
            This QR code was generated automatically. Print it and attach it near the animal's enclosure
            so caretakers can scan it for daily checklists.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/animal/${createdAnimal._id}`)}
              className="flex-1 bg-vantaraGreen text-white py-2 rounded-lg text-sm font-medium hover:opacity-90"
            >
              View Full Profile
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── REGISTRATION FORM ───
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-xl shadow p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-vantaraGreen mb-6">➕ Register New Animal</h1>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" placeholder="Gajraj" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Species</label>
            <input name="species" value={form.species} onChange={handleChange} required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" placeholder="Asian Elephant" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Scientific Name</label>
            <input name="scientificName" value={form.scientificName} onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" placeholder="Elephas maximus" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold bg-white">
                <option>Unknown</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Estimated Age</label>
              <input name="estimatedAge" type="number" value={form.estimatedAge} onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" placeholder="25" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Current Status</label>
            <select name="currentStatus" value={form.currentStatus} onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold bg-white">
              <option>Stable</option>
              <option>Under Observation</option>
              <option>Critical</option>
              <option>Recovering</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Date of Arrival</label>
            <input name="dateOfArrival" type="date" value={form.dateOfArrival} onChange={handleChange} required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Enclosure Location</label>
            <input name="enclosureLocation" value={form.enclosureLocation} onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold" placeholder="Zone A - Elephant Sanctuary" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files[0])}
              className="w-full mt-1 text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <p className="text-xs text-gray-400 mt-1">You can also add or change this later from the animal's profile page.</p>
          </div>

          <p className="text-xs text-gray-400 border-t pt-3">
            📱 A unique QR code will be generated automatically once you register — no need to enter one.
          </p>

          <button type="submit"
            className="w-full bg-vantaraGreen text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition">
            Register Animal
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddAnimal;