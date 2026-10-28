const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3100';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  list: () => req('/customers'),
  create: (c) => req('/customers', { method: 'POST', body: c }),
  update: (id, c) => req(`/customers/${id}`, { method: 'PUT', body: c }),
  remove: (id) => req(`/customers/${id}`, { method: 'DELETE' }),
  chat: (message, history) => req('/agent', { method: 'POST', body: { message, history } }),
};
