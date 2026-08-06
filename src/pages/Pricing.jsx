import { useEffect, useState } from 'react';
import { adminAPI } from '../api/admin';
import './Pricing.css';

const EMPTY_FORM = {
  display_name: '',
  base_fare: 0,
  per_km_rate: 0,
  hourly_rate: 280,
  platform_fee: 40,
  night_surcharge_percent: 15,
  gst_percent: 5,
  waiting_charge_per_min: 0,
  seater_capacity: 4,
  is_active: true,
  display_order: 0,
};

function Pricing() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getVehicleCategories(true);
      setCategories(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load vehicle pricing');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      display_name: cat.display_name || '',
      base_fare: Number(cat.base_fare ?? 0),
      per_km_rate: Number(cat.per_km_rate ?? 0),
      hourly_rate: Number(cat.hourly_rate ?? 280),
      platform_fee: Number(cat.platform_fee ?? 40),
      night_surcharge_percent: Number(cat.night_surcharge_percent ?? 15),
      gst_percent: Number(cat.gst_percent ?? 5),
      waiting_charge_per_min: Number(cat.waiting_charge_per_min ?? 0),
      seater_capacity: Number(cat.seater_capacity ?? 4),
      is_active: !!cat.is_active,
      display_order: Number(cat.display_order ?? 0),
    });
    setMessage('');
  };

  const closeEdit = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setSavingId(editing.id);
      setMessage('');
      await adminAPI.updateVehicleCategory(editing.id, {
        display_name: form.display_name,
        base_fare: Number(form.base_fare),
        per_km_rate: Number(form.per_km_rate),
        hourly_rate: Number(form.hourly_rate),
        platform_fee: Number(form.platform_fee),
        night_surcharge_percent: Number(form.night_surcharge_percent),
        gst_percent: Number(form.gst_percent),
        waiting_charge_per_min: Number(form.waiting_charge_per_min),
        seater_capacity: Number(form.seater_capacity),
        is_active: !!form.is_active,
        display_order: Number(form.display_order),
      });
      setMessage('Pricing saved. Customer app will use the new rates on next fare estimate.');
      await loadCategories();
      closeEdit();
    } catch (err) {
      setMessage(err?.response?.data?.detail || 'Failed to save pricing');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="pricing-page"><p className="pricing-muted">Loading pricing…</p></div>;
  }

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <div>
          <h1>Vehicle Pricing</h1>
          <p className="pricing-sub">
            Edit base fare, per-km, hourly (rental), and add-ons. Changes apply immediately to customer fare estimates.
          </p>
        </div>
        <button className="pricing-refresh" onClick={loadCategories}>Refresh</button>
      </div>

      {error && <div className="pricing-error">{error}</div>}
      {message && <div className="pricing-message">{message}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Base</th>
              <th>Per km</th>
              <th>Hourly</th>
              <th>Platform fee</th>
              <th>Night %</th>
              <th>GST %</th>
              <th>Wait / min</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <div className="pricing-name">{cat.display_name}</div>
                  <div className="pricing-key">{cat.name}</div>
                </td>
                <td>₹{Number(cat.base_fare).toFixed(0)}</td>
                <td>₹{Number(cat.per_km_rate).toFixed(1)}</td>
                <td>₹{Number(cat.hourly_rate ?? 280).toFixed(0)}</td>
                <td>₹{Number(cat.platform_fee ?? 40).toFixed(0)}</td>
                <td>{Number(cat.night_surcharge_percent ?? 15)}%</td>
                <td>{Number(cat.gst_percent ?? 5)}%</td>
                <td>₹{Number(cat.waiting_charge_per_min ?? 0).toFixed(1)}</td>
                <td>
                  <span className={`pricing-badge ${cat.is_active ? 'on' : 'off'}`}>
                    {cat.is_active ? 'Active' : 'Off'}
                  </span>
                </td>
                <td>
                  <button className="pricing-edit-btn" onClick={() => openEdit(cat)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="pricing-modal-mask" onClick={closeEdit}>
          <form className="pricing-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <div className="pricing-modal-hd">
              <h2>Edit {editing.display_name}</h2>
              <button type="button" className="pricing-close" onClick={closeEdit}>×</button>
            </div>

            <div className="pricing-grid">
              <label>
                Display name
                <input value={form.display_name} onChange={(e) => onChange('display_name', e.target.value)} required />
              </label>
              <label>
                Seats
                <input type="number" min="1" value={form.seater_capacity} onChange={(e) => onChange('seater_capacity', e.target.value)} />
              </label>
              <label>
                Base fare (₹)
                <input type="number" min="0" step="1" value={form.base_fare} onChange={(e) => onChange('base_fare', e.target.value)} required />
              </label>
              <label>
                Per km (₹)
                <input type="number" min="0" step="0.1" value={form.per_km_rate} onChange={(e) => onChange('per_km_rate', e.target.value)} required />
              </label>
              <label>
                Hourly / rental (₹)
                <input type="number" min="0" step="1" value={form.hourly_rate} onChange={(e) => onChange('hourly_rate', e.target.value)} />
              </label>
              <label>
                Platform fee add-on (₹)
                <input type="number" min="0" step="1" value={form.platform_fee} onChange={(e) => onChange('platform_fee', e.target.value)} />
              </label>
              <label>
                Night surcharge (%)
                <input type="number" min="0" max="100" step="0.5" value={form.night_surcharge_percent} onChange={(e) => onChange('night_surcharge_percent', e.target.value)} />
              </label>
              <label>
                GST (%)
                <input type="number" min="0" max="100" step="0.5" value={form.gst_percent} onChange={(e) => onChange('gst_percent', e.target.value)} />
              </label>
              <label>
                Waiting charge / min (₹)
                <input type="number" min="0" step="0.5" value={form.waiting_charge_per_min} onChange={(e) => onChange('waiting_charge_per_min', e.target.value)} />
              </label>
              <label>
                Display order
                <input type="number" value={form.display_order} onChange={(e) => onChange('display_order', e.target.value)} />
              </label>
              <label className="pricing-check">
                <input type="checkbox" checked={form.is_active} onChange={(e) => onChange('is_active', e.target.checked)} />
                Active in customer app
              </label>
            </div>

            <div className="pricing-modal-ft">
              <button type="button" className="pricing-cancel" onClick={closeEdit}>Cancel</button>
              <button type="submit" className="pricing-save" disabled={savingId === editing.id}>
                {savingId === editing.id ? 'Saving…' : 'Save pricing'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Pricing;
