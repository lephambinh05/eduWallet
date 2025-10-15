import React, { useEffect, useState } from 'react';
import PartnerUserCard from '../components/PartnerUserCard';
import partnerAPI from '../api/partnerAPI';

export default function PartnerDashboard() {
  const [purchasers, setPurchasers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    partnerAPI.listPurchasers()
      .then(res => { if (mounted) setPurchasers(res.data || res); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => mounted = false;
  }, []);

  if (loading) return <div>Loading purchasers...</div>;

  return (
    <div>
      <h2>Partner Dashboard</h2>
      {purchasers.length === 0 && <p>No purchasers found.</p>}
      <div>
        {purchasers.map(p => (
          <PartnerUserCard key={p._id} purchase={p} onUpdated={(u) => {
            setPurchasers(prev => prev.map(item => item._id === p._id ? { ...item, userId: u } : item));
          }} />
        ))}
      </div>
    </div>
  );
}
