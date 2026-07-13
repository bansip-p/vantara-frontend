import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function FieldGroup({ title, children }) {
  return (
    <div className="border-t pt-4 mt-2 first:border-t-0 first:pt-0 first:mt-0">
      <h3 className="text-sm font-semibold text-vantaraGreen mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function EditAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/staff').then((res) => setStaff(res.data.users)).catch(() => {});
    api.get(`/animals/${id}`).then((res) => {
      const a = res.data.animal;
      setForm({
        name: a.name || '', species: a.species || '', scientificName: a.scientificName || '',
        gender: a.gender || 'Unknown', estimatedAge: a.estimatedAge || '',
        dateOfArrival: a.dateOfArrival ? a.dateOfArrival.slice(0, 10) : '',
        enclosureLocation: a.enclosureLocation || '', currentStatus: a.currentStatus || 'Stable',
        speciesCategory: a.speciesCategory || 'Mammal',

        microchipNumber: a.microchipNumber || '', rescueNumber: a.rescueNumber || '',
        conservationStatus: a.conservationStatus || 'Unknown', origin: a.origin || '',
        governmentCaseNumber: a.governmentCaseNumber || '', forestDepartmentDetails: a.forestDepartmentDetails || '',
        previousOwner: a.previousOwner || '',

        currentWeightKg: a.currentWeightKg || '', heightCm: a.heightCm || '',
        bodyConditionScore: a.bodyConditionScore || '', bloodGroup: a.bloodGroup || '',
        allergyInformation: a.allergyInformation || '', medicalNotes: a.medicalNotes || '',
        currentDiet: a.currentDiet || '',

        currentVeterinarian: a.currentVeterinarian?._id || a.currentVeterinarian || '',
        currentKeeper: a.currentKeeper?._id || a.currentKeeper || '',
        behaviorStatus: a.behaviorStatus || 'Normal', pregnancyStatus: a.pregnancyStatus || 'Not Applicable',
        parentInformation: a.parentInformation || '',
      });
    });
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.put(`/animals/${id}`, form);
      navigate(`/animal/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update animal.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold text-sm";
  const labelClass = "text-sm text-gray-600";

  if (!form) return <p className="p-8 text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="bg-white rounded-xl shadow p-6 sm:p-8 max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-vantaraGreen mb-6">✏️ Edit Animal</h1>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">

          <FieldGroup title="🐾 Basic Identity">
            <div>
              <label className={labelClass}>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Species</label>
                <input name="species" value={form.species} onChange={handleChange} required className={inputClass} />
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
                  <option>Stable</option><option>Under Observation</option><option>Critical</option><option>Recovering</option><option>Deceased</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date of Arrival</label>
                <input name="dateOfArrival" type="date" value={form.dateOfArrival} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Enclosure Location</label>
              <input name="enclosureLocation" value={form.enclosureLocation} onChange={handleChange} className={inputClass} />
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
                <input name="origin" value={form.origin} onChange={handleChange} className={inputClass} />
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
              <input name="parentInformation" value={form.parentInformation} onChange={handleChange} className={inputClass} />
            </div>
          </FieldGroup>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(`/animal/${id}`)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-vantaraGreen text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAnimal;