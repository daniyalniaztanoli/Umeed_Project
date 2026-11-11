import { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiDroplet, FiPhone } from 'react-icons/fi';
import api from '../api/axios';
import Loader from '../components/Loader';

const BloodDonors = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/blood-donors');
      setItems(Array.isArray(res.data) ? res.data : res.data?.donors || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((b) =>
    (b.fullName || b.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blood Donors</h1>
          <p className="text-gray-500 text-sm">Registered blood donors</p>
        </div>
        <div className="text-sm text-gray-500">Total: <span className="font-bold text-primary">{filtered.length}</span></div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search donor..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
      </div>
      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100"><p className="text-gray-500">No donors found</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Blood Group</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-2"><FiUser size={14} className="text-primary" />{b.fullName || b.name}</td>
                    <td className="px-4 py-3 font-bold text-red-600 flex items-center gap-1"><FiDroplet size={14} />{b.bloodGroup}</td>
                    <td className="px-4 py-3 flex items-center gap-2"><FiPhone size={14} className="text-primary" />{b.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{b.city || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDonors;
