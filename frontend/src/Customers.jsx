import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

const empty = { name: '', email: '', phone: '' };

export default function Customers({ version }) {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError('');
      setRows(await api.list());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, version]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editId) await api.update(editId, form);
      else await api.create(form);
      setForm(empty);
      setEditId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (c) => {
    setEditId(c.customer_id);
    setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '' });
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete ${c.name}?`)) return;
    try {
      await api.remove(c.customer_id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const shown = rows.filter((c) =>
    [c.name, c.email, c.phone].some((v) => (v ?? '').toLowerCase().includes(query.toLowerCase())));

  return (
    <div className="grid">
      <section className="card">
        <h2>{editId ? 'Edit customer' : 'Add customer'}</h2>
        <form onSubmit={submit}>
          <label>Name
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <div className="actions">
            <button className="primary" type="submit">{editId ? 'Save changes' : 'Add customer'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Customers <span className="badge">{rows.length}</span></h2>
          <input className="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {error && <div className="error">{error}</div>}
        {loading ? <p className="muted">Loading…</p> : (
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Created</th><th /></tr></thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.customer_id}>
                  <td>{c.customer_id}</td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="row-actions">
                    <button onClick={() => edit(c)}>Edit</button>
                    <button className="danger" onClick={() => remove(c)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan="6" className="muted center">No customers found</td></tr>}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
