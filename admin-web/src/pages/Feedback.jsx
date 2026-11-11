import { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../api/axios';
import Loader from '../components/Loader';

const Feedback = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback');
      setItems(Array.isArray(res.data) ? res.data : res.data?.feedback || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((f) =>
    `${f.message || ''} ${f.title || ''} ${f.user?.name || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Feedback</h1>
          <p className="text-gray-500 text-sm">User feedback messages</p>
        </div>
        <div className="text-sm text-gray-500">Total: <span className="font-bold text-primary">{filtered.length}</span></div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search feedback..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
      </div>
      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100"><p className="text-gray-500">No feedback found</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filtered.map((f) => (
            <div key={f._id} className="p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <FiUser size={14} className="text-primary shrink-0" />
                <span className="font-semibold text-gray-800 text-sm">{f.user?.name || 'Anonymous'}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.source === 'complaint' ? 'bg-blue-100 text-blue-700' : 'bg-primary/10 text-primary'}`}>
                  {f.source === 'complaint' ? 'Complaint rating' : 'App feedback'}
                </span>
                {f.title && <span className="text-xs text-gray-500 truncate">— {f.title}</span>}
                <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto shrink-0"><FiCalendar size={11} />{f.createdAt ? format(new Date(f.createdAt), 'MMM dd, yyyy') : '-'}</span>
              </div>
              {(f.rating || f.message) && (
                <div className="flex items-start gap-2">
                  {f.rating ? (
                    <div className="flex gap-0.5 shrink-0 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={s <= f.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-sm text-gray-600">{f.message || <span className="text-gray-400 italic">No comment</span>}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;
