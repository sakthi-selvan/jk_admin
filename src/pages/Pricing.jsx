import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../api/admin';
import { formatINR, Modal, PageHeader } from '../components/ui';
import './Pricing.css';

const EMPTY_FORM = {
  name: '',
  display_name: '',
  base_fare: 40,
  per_km_rate: 12,
  hourly_rate: 280,
  platform_fee: 40,
  night_surcharge_percent: 15,
  gst_percent: 5,
  waiting_charge_per_min: 0,
  seater_capacity: 4,
  is_active: true,
  display_order: 99,
};

function Pricing() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    loadCategories();
  }, []);

  const previewFare = useMemo(() => {
    const base = Number(form.base_fare) || 0;
    const perKm = Number(form.per_km_rate) || 0;
    const platform = Number(form.platform_fee) || 0;
    const gstPct = Number(form.gst_percent) || 0;
    const sampleKm = 8;
    const sub = base + perKm * sampleKm + platform;
    const gst = (sub * gstPct) / 100;
    return Math.round(sub + gst);
  }, [form]);

  const openEdit = (cat) => {
    setCreating(false);
    setEditing(cat);
    setForm({
      name: cat.name || '',
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

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm(EMPTY_FORM);
    setMessage('');
  };

  const closeModal = () => {
    setEditing(null);
    setCreating(false);
    setForm(EMPTY_FORM);
  };

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      const payload = {
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
      };
      if (creating) {
        await adminAPI.createVehicleCategory({
          ...payload,
          name: form.name.trim().toLowerCase().replace(/\s+/g, '_'),
        });
        setMessage('Category created');
      } else if (editing) {
        await adminAPI.updateVehicleCategory(editing.id, payload);
        setMessage('Pricing saved');
      }
      await loadCategories();
      closeModal();
    } catch (err) {
      setMessage(err?.response?.data?.detail || 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (cat) => {
    if (!window.confirm(`Deactivate ${cat.display_name}?`)) return;
    try {
      await adminAPI.deactivateVehicleCategory(cat.id);
      await loadCategories();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to deactivate');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading pricing…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Vehicle Pricing"
        subtitle="Live fare knobs for the customer app"
        actions={
          <>
            <button type="button" className="ui-btn" onClick={loadCategories}>Refresh</button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={openCreate}>Add category</button>
          </>
        }
      />

      {error && <div className="error-box">{error}</div>}
      {message && !creating && !editing && <div className="pricing-message">{message}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Base</th>
              <th>Per km</th>
              <th>Hourly</th>
              <th>Platform</th>
              <th>Night %</th>
              <th>GST %</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <div className="pricing-name">{cat.display_name}</div>
                  <div className="pricing-key">{cat.name}</div>
                </td>
                <td>{formatINR(cat.base_fare)}</td>
                <td>₹{Number(cat.per_km_rate).toFixed(1)}</td>
                <td>{formatINR(cat.hourly_rate ?? 280)}</td>
                <td>{formatINR(cat.platform_fee ?? 40)}</td>
                <td>{Number(cat.night_surcharge_percent ?? 15)}%</td>
                <td>{Number(cat.gst_percent ?? 5)}%</td>
                <td>
                  <span className={`pricing-badge ${cat.is_active ? 'on' : 'off'}`}>
                    {cat.is_active ? 'Active' : 'Off'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="ui-btn" onClick={() => openEdit(cat)}>Edit</button>
                  {cat.is_active && (
                    <button type="button" className="ui-btn ui-btn-danger" onClick={() => handleDeactivate(cat)}>
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={creating || !!editing}
        title={creating ? 'Add vehicle category' : `Edit ${editing?.display_name || ''}`}
        onClose={closeModal}
        actions={
          <>
            <button type="button" className="ui-btn" onClick={closeModal}>Cancel</button>
            <button type="submit" form="pricing-form" className="ui-btn ui-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form id="pricing-form" onSubmit={handleSave}>
          <div className="form-grid">
            {creating && (
              <label className="full">
                Internal name (slug)
                <input
                  value={form.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  placeholder="e.g. mini"
                  required
                />
              </label>
            )}
            <label className="full">
              Display name
              <input
                value={form.display_name}
                onChange={(e) => onChange('display_name', e.target.value)}
                required
              />
            </label>
            <label>
              Base fare
              <input type="number" min="0" step="1" value={form.base_fare} onChange={(e) => onChange('base_fare', e.target.value)} />
            </label>
            <label>
              Per km
              <input type="number" min="0" step="0.1" value={form.per_km_rate} onChange={(e) => onChange('per_km_rate', e.target.value)} />
            </label>
            <label>
              Hourly
              <input type="number" min="0" value={form.hourly_rate} onChange={(e) => onChange('hourly_rate', e.target.value)} />
            </label>
            <label>
              Platform fee
              <input type="number" min="0" value={form.platform_fee} onChange={(e) => onChange('platform_fee', e.target.value)} />
            </label>
            <label>
              Night %
              <input type="number" min="0" value={form.night_surcharge_percent} onChange={(e) => onChange('night_surcharge_percent', e.target.value)} />
            </label>
            <label>
              GST %
              <input type="number" min="0" value={form.gst_percent} onChange={(e) => onChange('gst_percent', e.target.value)} />
            </label>
            <label>
              Wait / min
              <input type="number" min="0" step="0.1" value={form.waiting_charge_per_min} onChange={(e) => onChange('waiting_charge_per_min', e.target.value)} />
            </label>
            <label>
              Seats
              <input type="number" min="1" value={form.seater_capacity} onChange={(e) => onChange('seater_capacity', e.target.value)} />
            </label>
            <label>
              Display order
              <input type="number" value={form.display_order} onChange={(e) => onChange('display_order', e.target.value)} />
            </label>
            <label>
              Active
              <select value={form.is_active ? '1' : '0'} onChange={(e) => onChange('is_active', e.target.value === '1')}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </label>
          </div>
          <div className="fare-preview">
            Sample 8 km trip estimate (base + km + platform + GST):{' '}
            <strong>{formatINR(previewFare)}</strong>
          </div>
          {message && <div className="pricing-error" style={{ marginTop: 12 }}>{message}</div>}
        </form>
      </Modal>
    </div>
  );
}

export default Pricing;
