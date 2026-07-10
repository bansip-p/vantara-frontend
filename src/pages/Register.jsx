import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Caretaker' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/register', form);
      const { token, user } = response.data;

      localStorage.setItem('vantara_token', token);
      localStorage.setItem('vantara_user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-vantaraGreen">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-vantaraGreen mb-1">🐘 Create Account</h1>
        <p className="text-gray-500 mb-6">Join the Vantara AI Guardian Platform</p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

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
              minLength={6}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vantaraGold"
              placeholder="••••••••"
            />
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
            className="w-full bg-vantaraGreen text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition"
          >
            Create Account
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