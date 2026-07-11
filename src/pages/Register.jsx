import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function checkPasswordStrength(password) {
  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One special character (! @ # $ %)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const passedCount = checks.filter((c) => c.valid).length;
  return { checks, passedCount, isStrong: passedCount === checks.length };
}

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Caretaker' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const strength = checkPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!strength.isStrong) {
      setError('Please choose a stronger password — see the requirements below.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/auth/register', form);
      const { token, user } = response.data;
      localStorage.setItem('vantara_token', token);
      localStorage.setItem('vantara_user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const strengthColor =
    strength.passedCount <= 2 ? 'bg-red-400' : strength.passedCount <= 4 ? 'bg-yellow-400' : 'bg-green-500';

  return (
    <div className="min-h-screen flex items-center justify-center bg-vantaraGreen px-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-vantaraGreen mb-1">🐘 Create Account</h1>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">Join the Vantara AI Guardian Platform</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold"
              placeholder="Dr. Aisha Verma"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold"
              placeholder="[email protected]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold"
              placeholder="••••••••"
            />

            {form.password.length > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${strengthColor}`}
                    style={{ width: `${(strength.passedCount / 5) * 100}%` }}
                  ></div>
                </div>
                <ul className="space-y-0.5">
                  {strength.checks.map((check, i) => (
                    <li key={i} className={`text-xs flex items-center gap-1.5 ${check.valid ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{check.valid ? '✓' : '○'}</span> {check.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold bg-white"
            >
              <option value="Caretaker">Caretaker</option>
              <option value="Veterinarian">Veterinarian</option>
              <option value="RescueTeam">Rescue Team</option>
              <option value="ManagementViewer">Management Viewer</option>
              <option value="SuperAdmin">Super Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-vantaraGreen text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-vantaraGreen font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;