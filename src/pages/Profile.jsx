import { useState } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../utils/roleHelpers';

function checkPasswordStrength(password) {
  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  return { checks, isStrong: checks.every((c) => c.valid) };
}

function Profile() {
  const currentUser = getCurrentUser();
  const [name, setName] = useState(currentUser?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const strength = checkPasswordStrength(newPassword);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword && !strength.isStrong) {
      setError('Please choose a stronger password, or leave it blank to keep your current one.');
      return;
    }

    setSaving(true);
    try {
      const payload = { name };
      if (newPassword) payload.password = newPassword;

      const res = await api.put('/auth/me', payload);
      localStorage.setItem('vantara_user', JSON.stringify(res.data.user));
      setMessage('Profile updated successfully.');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-xl shadow p-8 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-vantaraGreen mb-6">👤 My Profile</h1>

        {message && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">{message}</div>}
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              value={currentUser?.email || ''}
              disabled
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-50 text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">New Password (optional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold"
            />
            {newPassword.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {strength.checks.map((c, i) => (
                  <li key={i} className={`text-xs flex items-center gap-1.5 ${c.valid ? 'text-green-600' : 'text-gray-400'}`}>
                    {c.valid ? '✓' : '○'} {c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-vantaraGreen text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;