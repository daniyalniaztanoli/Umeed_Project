import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../api/axios';
import Loader from '../components/Loader';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      setEvents(Array.isArray(res.data) ? res.data : res.data?.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = events.filter((e) =>
    (e.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Events & Campaigns</h1>
          <p className="text-gray-500 text-sm">Manage events and campaigns</p>
        </div>
        <div className="text-sm text-gray-500">Total: <span className="font-bold text-primary">{filtered.length}</span></div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
      </div>
      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100"><p className="text-gray-500">No events found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <div key={e._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">{e.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{e.description}</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p className="flex items-center gap-2"><FiCalendar size={12} />{e.date ? format(new Date(e.date), 'MMM dd, yyyy') : '-'}</p>
                <p className="flex items-center gap-2"><FiMapPin size={12} />{e.location || '-'}</p>
                <p className="flex items-center gap-2"><FiUsers size={12} />{e.volunteersCount ?? 0} volunteers</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
