import { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../api/axios';
import Loader from '../components/Loader';

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setItems(Array.isArray(res.data) ? res.data : res.data?.notifications || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((n) =>
    (n.title || n.message || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500 text-sm">Sent notifications</p>
        </div>
        <div className="text-sm text-gray-500">Total: <span className="font-bold text-primary">{filtered.length}</span></div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
      </div>
      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100"><p className="text-gray-500">No notifications found</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filtered.map((n) => (
            <div key={n._id} className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary"><FiBell size={16} /></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><FiCalendar size={11} />{n.createdAt ? format(new Date(n.createdAt), 'MMM dd, yyyy') : '-'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
