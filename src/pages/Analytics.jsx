import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import api from '../services/api';

const STATUS_COLORS = {
  Stable: '#2D6A4F',
  'Under Observation': '#D4A017',
  Critical: '#DC2626',
  Recovering: '#2563EB',
  Deceased: '#6B7280',
};

const RISK_COLORS = {
  Low: '#2D6A4F',
  Medium: '#D4A017',
  High: '#DC2626',
};

const SPECIES_GRADIENT = ['#1B4332', '#215A44', '#2D6A4F', '#40826D', '#52A788', '#74C69D'];

function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/summary').then((res) => setData(res.data));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading analytics...</p>
      </div>
    );
  }

  const speciesData = [...data.speciesBreakdown]
    .map((s) => ({ name: s._id, value: s.count }))
    .sort((a, b) => b.value - a.value);

  const statusData = data.statusBreakdown.map((s) => ({ name: s._id, count: s.count }));
  const riskData = ['Low', 'Medium', 'High'].map((level) => {
    const found = data.riskBreakdown.find((r) => r._id === level);
    return { name: level, count: found ? found.count : 0 };
  });

  const scoreColor = data.averageHealthScore >= 80 ? '#2D6A4F' : data.averageHealthScore >= 60 ? '#D4A017' : '#DC2626';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-vantaraGreen">📊 Management Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Sanctuary-wide overview, updated in real time</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🐾" label="Total Animals" value={data.totalAnimals} color="#1B4332" />
          <StatCard icon="💚" label="Avg Health Score" value={`${data.averageHealthScore}%`} color={scoreColor} />
          <StatCard icon="🔔" label="Open Alerts" value={data.openAlerts} color="#D4A017" />
          <StatCard icon="🚨" label="Critical Alerts" value={data.criticalAlerts} color="#DC2626" />
        </div>

        {/* Species Distribution */}
        <Card title="Species Distribution" subtitle={`${speciesData.length} species tracked`}>
          <ResponsiveContainer width="100%" height={520}>
            <BarChart data={speciesData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#888' }} axisLine={{ stroke: '#ddd' }} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12, fill: '#444' }} axisLine={{ stroke: '#ddd' }} />
              <Tooltip
                cursor={{ fill: '#f5f5f5' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 13 }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                {speciesData.map((_, index) => (
                  <Cell key={index} fill={SPECIES_GRADIENT[index % SPECIES_GRADIENT.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Status Breakdown */}
          <Card title="Animals by Status">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData} margin={{ top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#444' }} axisLine={{ stroke: '#ddd' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#888' }} axisLine={{ stroke: '#ddd' }} />
                <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 13 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={44}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.name] || '#999'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Legend items={Object.entries(STATUS_COLORS).filter(([name]) => statusData.some((s) => s.name === name))} />
          </Card>

          {/* Risk Breakdown */}
          <Card title="AI Risk Level Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskData} margin={{ top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#444' }} axisLine={{ stroke: '#ddd' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#888' }} axisLine={{ stroke: '#ddd' }} />
                <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 13 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                  {riskData.map((entry, index) => (
                    <Cell key={index} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Legend items={Object.entries(RISK_COLORS)} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div className="flex flex-wrap gap-4 mt-4 justify-center">
      {items.map(([name, color]) => (
        <div key={name} className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
          {name}
        </div>
      ))}
    </div>
  );
}

export default Analytics;