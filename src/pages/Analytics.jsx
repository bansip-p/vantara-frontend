import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';

const COLORS = ['#1B4332', '#D4A017', '#2D6A4F', '#95D5B2', '#B7791F'];

function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/summary').then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="p-8 text-gray-500">Loading analytics...</p>;

  const speciesData = data.speciesBreakdown.map((s) => ({ name: s._id, value: s.count }));
  const statusData = data.statusBreakdown.map((s) => ({ name: s._id, count: s.count }));
  const riskData = data.riskBreakdown.map((r) => ({ name: r._id, count: r.count }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-vantaraGreen mb-6">📊 Management Analytics</h1>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Animals" value={data.totalAnimals} />
        <StatCard label="Avg Health Score" value={`${data.averageHealthScore}%`} />
        <StatCard label="Open Alerts" value={data.openAlerts} color="text-yellow-600" />
        <StatCard label="Critical Alerts" value={data.criticalAlerts} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       {/* Species Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Species Distribution</h2>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={[...speciesData].sort((a, b) => b.value - a.value)}
              layout="vertical"
              margin={{ left: 40 }}
            >
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1B4332" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Animals by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1B4332" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Level Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">AI Risk Level Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={riskData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#D4A017" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'text-vantaraGreen' }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default Analytics;