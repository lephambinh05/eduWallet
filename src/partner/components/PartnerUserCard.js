import React, { useState } from 'react';
import partnerAPI from '../api/partnerAPI';

export default function PartnerUserCard({ purchase, onUpdated }) {
  const user = purchase.userId || {};
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });

  const save = async () => {
    try {
      const res = await partnerAPI.updatePurchaser(purchase._id, form);
      onUpdated(res.data.user || res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, margin: 8 }}>
      <h4>{user.fullName || user.username}</h4>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Course: {purchase.courseId && purchase.courseId.name}</p>
      {editing ? (
        <div>
          <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
          <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <button onClick={save}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <button onClick={() => setEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  );
}
