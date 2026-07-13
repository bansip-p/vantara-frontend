import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

function FieldGroup({ title, children }) {
  return (
    <div className="border-t pt-4 mt-2 first:border-t-0 first:pt-0 first:mt-0">
      <h3 className="text-sm font-semibold text-vantaraGreen mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function AddAnimal() {
  const [form, setForm] = useState({
    name: '', species: '', scientificName: '', gender: 'Unknown', estimatedAge: '',
    dateOfArrival: '', enclosureLocation: '', currentStatus: 'Stable', speciesCategory: 'Mammal',

    microchipNumber: '', rescueNumber: '', conservationStatus: 'Unknown', origin: '',
    governmentCaseNumber: '', forestDepartmentDetails: '', previousOwner: '',

    currentWeightKg: '', heightCm: '', bodyConditionScore: '', bloodGroup: '',
    allergyInformation: '', medicalNotes: '', currentDiet: '',

    currentVeterinarian: '', currentKeeper: '', behaviorStatus: 'Normal',
    pregnancyStatus: 'Not Applicable', parentInformation: '',
  });
  const [staff, setStaff] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [createdAnimal, setCreatedAnimal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/staff').then((res) => setStaff(res.data.users)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/animals', form);
      let animal = response.data.animal;

      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const photoRes = await api.put(`/animals/${animal._id}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        animal = photoRes.data.animal;
      }

      setCreatedAnimal(animal);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add animal.');
    }
  };

  const inputClass = "w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold text-sm";
  const labelClass = "text-sm text-gray-600";

  if (createdAnimal) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="bg-white rounded-xl shadow p-8 max-w-md mx-auto text-center">
          <p className="text-green-600 text-3xl mb-2">✅</p>
          <h1 className="text-xl font-bold text-vantaraGreen mb-1">{createdAnimal.name} Registered!</h1>
          <p className="text-sm text-gray-500 mb-6">{createdAnimal.species}</p>
          <div className="flex justify-center bg-white p-4 rounded-lg border mb-3">
            <QRCodeSVG value={createdAnimal.qrCode} size={180} />
          </div>
          <p className="text-xs text-gray-400 mb-6 break-all">{createdAnimal.qrCode}</p>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/animal/${createdAnimal._id}`)}
              className="flex-1 bg-vantaraGreen text-white py-2 rounded-lg text-sm font-medium hover:opacity-90">
              View Full Profile
            </button>
            <button onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="bg-white rounded-xl shadow p-6 sm:p-8 max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-vantaraGreen mb-6">➕ Register New Animal</h1>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">

          <FieldGroup title="🐾 Basic Identity">
            <div>
              <label className={labelClass}>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Gajraj" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Species</label>
                <input name="species" value={form.species} onChange={handleChange} required className={inputClass} placeholder="Asian Elephant" />
              </div>
              <div>
                <label className={labelClass}>Scientific Name</label>
                <input name="scientificName" value={form.scientificName} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Species Category</label>
                <select name="speciesCategory" value={form.speciesCategory} onChange={handleChange} className={inputClass + ' bg-white'}>
                  <option>Mammal</option><option>Bird</option><option>Reptile</option><option>Amphibian</option><option>Fish</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={inputClass + ' bg-white'}>
                  <option>Unknown</option><option>Male</option><option>Female</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Estimated Age</label>
                <input name="estimatedAge" type="number" value={form.estimatedAge} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Current Status</label>
                <select name="currentStatus" value={form.currentStatus} onChange={handleChange} className={inputClass + ' bg-white'}>
                  <option>Stable</option><option>Under Observation</option><option>Critical</option><option>Recovering</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date of Arrival</label>
                <input name="dateOfArrival" type="date" value={form.dateOfArrival} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Enclosure Location</label>
              <input name="enclosureLocation" value={form.enclosureLocation} onChange={handleChange} className={inputClass} placeholder="Zone A - Elephant Sanctuary" />
            </div>
          </FieldGroup>

          <FieldGroup title="📋 Identity & Legal">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Microchip Number</label>
                <input name="microchipNumber" value={form.microchipNumber} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Rescue Number</label>
                <input name="rescueNumber" value={form.rescueNumber} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Conservation Status</label>
                <select name="conservationStatus" value={form.conservationStatus} onChange={handleChange} className={inputClass + ' bg-white'}>
                  <option>Unknown</option><option>Least Concern</option><option>Near Threatened</option>
                  <option>Vulnerable</option><option>Endangered</option><option>Critically Endangered</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Origin</label>
                <input name="origin" value={form.origin} onChange={handleChange} className={inputClass} placeholder="Wild rescue - Gir Forest" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Government Case Number</label>
                <input name="governmentCaseNumber" value={form.governmentCaseNumber} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Previous Owner</label>
                <input name="previousOwner" value={form.previousOwner} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Forest Department Details</label>
              <textarea name="forestDepartmentDetails" value={form.forestDepartmentDetails} onChange={handleChange} rows={2} className={inputClass} />
            </div>
          </FieldGroup>

          <FieldGroup title="🩺 Physical & Medical">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input name="currentWeightKg" type="number" value={form.currentWeightKg} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Height (cm)</label>
                <input name="heightCm" type="number" value={form.heightCm} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Body Condition (1-9)</label>
                <input name="bodyConditionScore" type="number" min="1" max="9" value={form.bodyConditionScore} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Blood Group</label>
                <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Current Diet</label>
                <input name="currentDiet" value={form.currentDiet} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Allergy Information</label>
              <input name="allergyInformation" value={form.allergyInformation} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Medical Notes</label>
              <textarea name="medicalNotes" value={form.medicalNotes} onChange={handleChange} rows={2} className={inputClass} />
            </div>
          </FieldGroup>

          <FieldGroup title="👥 Care Team & Behavior">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Current Veterinarian</label>
                <select name="currentVeterinarian" value={form.currentVeterinarian} onChange={handleChange} className={inputClass + ' bg-white'}>
                  <option value="">— Not assigned —</option>
                  {staff.filter((s) => s.role === 'Veterinarian').map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Current Keeper</label>
                <select name="currentKeeper" value={form.currentKeeper} onChange={handleChange} className={inputClass + ' bg-white'}>
                  <option value="">— Not assigned —</option>
                  {staff.filter((s) => s.role === 'Caretaker').map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Behavior Status</label>
                <select name="behaviorStatus" value={form.behaviorStatus} onChange={handleChange} className={inputClass + ' bg-white'}>
                  <option>Calm</option><option>Normal</option><option>Alert</option><option>Aggressive</option><option>Fearful</option><option>Withdrawn</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Pregnancy Status</label>
                <select name="pregnancyStatus" value={form.pregnancyStatus} onChange={handleChange} className={inputClass + ' bg-white'}>
                  <option>Not Applicable</option><option>Not Pregnant</option><option>Pregnant</option><option>Nursing</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Parent Information</label>
              <input name="parentInformation" value={form.parentInformation} onChange={handleChange} className={inputClass} placeholder="Mother: Rani (ID xxxx)" />
            </div>
          </FieldGroup>

          <FieldGroup title="📷 Photo">
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
          </FieldGroup>

          <p className="text-xs text-gray-400 border-t pt-3">
            📱 A unique QR code will be generated automatically once you register.
          </p>

          <button type="submit" className="w-full bg-vantaraGreen text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition">
            Register Animal
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddAnimal;