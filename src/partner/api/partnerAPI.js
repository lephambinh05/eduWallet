const apiBase = '/api/partners';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default {
  async listPurchasers() {
    const res = await fetch(`${apiBase}/purchasers`, { headers: { ...authHeaders() } });
    return res.json();
  },
  async getPurchaser(id) {
    const res = await fetch(`${apiBase}/purchasers/${id}`, { headers: { ...authHeaders() } });
    return res.json();
  },
  async updatePurchaser(id, body) {
    const res = await fetch(`${apiBase}/purchasers/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) });
    return res.json();
  },
  async listCourses() {
    const res = await fetch(`${apiBase}/courses`, { headers: { ...authHeaders() } });
    return res.json();
  }
};
