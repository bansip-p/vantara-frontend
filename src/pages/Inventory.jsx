import { useEffect, useState } from 'react';
import api from '../services/api';

const CATEGORIES = ['All', 'Food', 'Medicine', 'Equipment'];

function AdjustStockRow({ item, onAdjusted }) {
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const adjust = async (type) => {
    if (!qty || qty <= 0) {
      setError('Enter a quantity first.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await api.post(`/inventory/${item._id}/adjust`, {
        type,
        quantity: Number(qty),
        reason: reason || (type === 'IN' ? 'Restock' : 'Usage'),
      });
      setQty('');
      setReason('');
      onAdjusted();
    } catch (err) {
      setError(err.response?.data?.message || 'Adjustment failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder="Qty"
        className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
      />
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="flex-1 min-w-[140px] border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
      />
      <button
        onClick={() => adjust('IN')}
        disabled={busy}
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50"
      >
        + Stock In
      </button>
      <button
        onClick={() => adjust('OUT')}
        disabled={busy}
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
      >
        − Stock Out
      </button>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </div>
  );
}

function AddItemForm({ onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [supplier, setSupplier] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name || quantity === '') {
      setError('Name and quantity are required.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await api.post('/inventory', {
        name,
        category,
        quantity: Number(quantity),
        unit,
        lowStockThreshold: Number(lowStockThreshold),
        supplier,
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6 space-y-3">
      <h2 className="text-sm font-semibold text-gray-600 mb-2">➕ Add Inventory Item</h2>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. Hay"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {CATEGORIES.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Supplier (optional)</label>
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Starting Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Unit</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="kg, liters, units..."
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Low Stock Threshold</label>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="bg-vantaraGreen text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {busy ? 'Adding...' : 'Add Item'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Inventory() {
  const [items, setItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchItems = async () => {
    try {
      const params = categoryFilter !== 'All' ? { category: categoryFilter } : {};
      const res = await api.get('/inventory', { params });
      setItems(res.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  const lowStockCount = items.filter((i) => i.quantity <= i.lowStockThreshold).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-vantaraGreen">📦 Inventory</h1>
        <span className="text-sm text-gray-500">
          {lowStockCount > 0 ? `⚠️ ${lowStockCount} Low Stock · ` : ''}{items.length} Total Items
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition whitespace-nowrap flex-shrink-0 ${
                categoryFilter === c
                  ? 'bg-vantaraGreen text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-vantaraGreen text-white hover:opacity-90 w-full sm:w-auto"
        >
          {showAddForm ? 'Close' : '+ Add Item'}
        </button>
      </div>

      {showAddForm && (
        <AddItemForm
          onCreated={() => {
            setShowAddForm(false);
            fetchItems();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {loading && <p className="text-gray-500">Loading inventory...</p>}

      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-400 bg-white rounded-xl shadow p-6 text-center">
          No {categoryFilter !== 'All' ? categoryFilter.toLowerCase() : ''} items yet.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const isLow = item.quantity <= item.lowStockThreshold;
          return (
            <div
              key={item._id}
              className={`bg-white rounded-xl shadow p-4 border-l-4 ${
                isLow ? 'border-amber-400' : 'border-transparent'
              }`}
            >
              <div
                className="flex justify-between items-center cursor-pointer gap-2"
                onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {item.name}{' '}
                    <span className="text-xs font-normal text-gray-400">· {item.category}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 break-words">
                    {item.quantity}{item.unit} in stock
                    {isLow && <span className="text-amber-600 font-medium"> · Low stock (threshold {item.lowStockThreshold}{item.unit})</span>}
                  </p>
                  {item.supplier && <p className="text-xs text-gray-400 mt-0.5 truncate">Supplier: {item.supplier}</p>}
                </div>
                <span className="text-gray-400 text-sm flex-shrink-0">{expandedId === item._id ? '▲' : '▼'}</span>
              </div>

              {expandedId === item._id && (
                <AdjustStockRow item={item} onAdjusted={fetchItems} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Inventory;