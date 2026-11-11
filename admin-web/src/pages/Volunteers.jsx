import { useState, useEffect } from 'react';
import { FiSearch, FiPhone, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../api/axios';
import Loader from '../components/Loader';

const Volunteers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/volunteers');
      setItems(Array.isArray(res.data) ? res.data : res.data?.volunteers || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((v) =>
    (v.name || v.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Volunteers</h1>
          <p className="text-gray-500 text-sm">Volunteer signups</p>
        </div>
        <div className="text-sm text-gray-500">Total: <span className="font-bold text-primary">{filtered.length}</span></div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search volunteer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
      </div>
      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100"><p className="text-gray-500">No volunteers found</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Skills / Interests</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                          {(v.name || v.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 whitespace-nowrap">{v.name || v.fullName}</p>
                          {v.email && <p className="text-xs text-gray-500">{v.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 whitespace-nowrap text-gray-700">
                        <FiPhone size={14} className="text-primary shrink-0" />{v.phone || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(Array.isArray(v.interests) && v.interests.length ? v.interests : v.skills ? [v.skills] : []).length === 0 ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          (Array.isArray(v.interests) && v.interests.length ? v.interests : [v.skills]).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{s}</span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${v.status === 'active' ? 'bg-green-100 text-green-700' : v.status === 'contacted' ? 'bg-blue-100 text-blue-700' : v.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>
                        {v.status || 'submitted'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                        <FiCalendar size={12} />{v.createdAt ? format(new Date(v.createdAt), 'MMM dd, yyyy') : '-'}
                      </div>
                    </td>
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

export default Volunteers;
