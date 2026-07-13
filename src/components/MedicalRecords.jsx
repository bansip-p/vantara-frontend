import { useEffect, useState } from 'react';
import api from '../services/api';
import { hasRole } from '../utils/roleHelpers';

const VISIT_TYPES = ['Routine Checkup', 'Emergency', 'Follow-up', 'Vaccination', 'Surgery', 'Diagnosis Only'];
const RECOVERY_OPTIONS = ['Not Applicable', 'Recovering', 'Fully Recovered', 'Ongoing Treatment', 'Critical'];

function emptyForm() {
  return {
    visitType: 'Routine Checkup',
    diagnosis: '',
    treatment: '',
    doctorNotes: '',
    surgeryPerformed: false,
    operationNotes: '',
    dischargeSummary: '',
    weightKg: '',
    temperatureC: '',
    heartRate: '',
    recoveryStatus: 'Not Applicable',
    nextCheckupDate: '',
    prescriptions: [{ medicineName: '', dosage: '', frequency: '', durationDays: '' }],
  };
}

function MedicalRecords({ animalId }) {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchRecords = async () => {
    const res = await api.get(`/medical-records/animal/${animalId}`);
    setRecords(res.data.records);
  };

  useEffect(() => {
    fetchRecords();
  }, [animalId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...form.prescriptions];
    updated[index][field] = value;
    setForm({ ...form, prescriptions: updated });
  };

  const addPrescriptionRow = () => {
    setForm({ ...form, prescriptions: [...form.prescriptions, { medicineName: '', dosage: '', frequency: '', durationDays: '' }] });
  };

  const removePrescriptionRow = (index) => {
    setForm({ ...form, prescriptions: form.prescriptions.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        vitals: {
          weightKg: form.weightKg || undefined,
          temperatureC: form.temperatureC || undefined,
          heartRate: form.heartRate || undefined,
        },
        prescriptions: form.prescriptions.filter((p) => p.medicineName.trim() !== ''),
      };
      await api.post(`/medical-records/animal/${animalId}`, payload);
      setForm(emptyForm());
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      alert('Could not save medical record.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vantaraGold";

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-600">🩺 Medical Records ({records.length})</h2>
        {hasRole('SuperAdmin', 'Veterinarian') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs bg-vantaraGreen text-white px-3 py-1.5 rounded-lg hover:opacity-90"
          >
            {showForm ? 'Cancel' : '+ New Record'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Visit Type</label>
              <select name="visitType" value={form.visitType} onChange={handleChange} className={inputClass + ' bg-white'}>
                {VISIT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Recovery Status</label>
              <select name="recoveryStatus" value={form.recoveryStatus} onChange={handleChange} className={inputClass + ' bg-white'}>
                {RECOVERY_OPTIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Diagnosis</label>
            <textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} rows={2} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Treatment</label>
            <textarea name="treatment" value={form.treatment} onChange={handleChange} rows={2} className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500">Weight (kg)</label>
              <input name="weightKg" type="number" value={form.weightKg} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Temperature (°C)</label>
              <input name="temperatureC" type="number" value={form.temperatureC} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Heart Rate (bpm)</label>
              <input name="heartRate" type="number" value={form.heartRate} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Prescriptions */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Prescriptions</label>
            {form.prescriptions.map((p, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input placeholder="Medicine" value={p.medicineName} onChange={(e) => handlePrescriptionChange(i, 'medicineName', e.target.value)} className="px-2 py-1.5 border rounded text-xs" />
                <input placeholder="Dosage" value={p.dosage} onChange={(e) => handlePrescriptionChange(i, 'dosage', e.target.value)} className="px-2 py-1.5 border rounded text-xs" />
                <input placeholder="Frequency" value={p.frequency} onChange={(e) => handlePrescriptionChange(i, 'frequency', e.target.value)} className="px-2 py-1.5 border rounded text-xs" />
                <div className="flex gap-1">
                  <input placeholder="Days" type="number" value={p.durationDays} onChange={(e) => handlePrescriptionChange(i, 'durationDays', e.target.value)} className="px-2 py-1.5 border rounded text-xs w-full" />
                  {form.prescriptions.length > 1 && (
                    <button type="button" onClick={() => removePrescriptionRow(i)} className="text-red-500 text-xs px-1">✕</button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addPrescriptionRow} className="text-xs text-vantaraGreen">+ Add another medicine</button>
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" name="surgeryPerformed" checked={form.surgeryPerformed} onChange={handleChange} />
            Surgery performed during this visit
          </label>

          {form.surgeryPerformed && (
            <>
              <div>
                <label className="text-xs text-gray-500">Operation Notes</label>
                <textarea name="operationNotes" value={form.operationNotes} onChange={handleChange} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Discharge Summary</label>
                <textarea name="dischargeSummary" value={form.dischargeSummary} onChange={handleChange} rows={2} className={inputClass} />
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-gray-500">Doctor Notes</label>
            <textarea name="doctorNotes" value={form.doctorNotes} onChange={handleChange} rows={2} className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-gray-500">Next Checkup Date</label>
            <input name="nextCheckupDate" type="date" value={form.nextCheckupDate} onChange={handleChange} className={inputClass} />
          </div>

          <button type="submit" disabled={saving} className="w-full bg-vantaraGreen text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Medical Record'}
          </button>
        </form>
      )}

      {records.length === 0 && <p className="text-sm text-gray-400">No medical records yet for this animal.</p>}

      <div className="space-y-3">
        {records.map((r) => (
          <div key={r._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-vantaraGreen uppercase">{r.visitType}</span>
              <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            {r.diagnosis && <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Diagnosis:</span> {r.diagnosis}</p>}
            {r.treatment && <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Treatment:</span> {r.treatment}</p>}
            {r.prescriptions?.length > 0 && (
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Prescribed:</span> {r.prescriptions.map((p) => `${p.medicineName} (${p.dosage}, ${p.frequency})`).join('; ')}
              </p>
            )}
            {r.surgeryPerformed && (
              <p className="text-sm text-blue-700 mb-1"><span className="font-medium">🔪 Surgery performed</span> — {r.operationNotes}</p>
            )}
            {r.recoveryStatus !== 'Not Applicable' && (
              <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Recovery: {r.recoveryStatus}
              </span>
            )}
            <p className="text-xs text-gray-400 mt-2">Recorded by {r.recordedBy?.name || 'Unknown'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicalRecords;