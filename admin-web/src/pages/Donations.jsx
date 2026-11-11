import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../api/axios';
import Loader from '../components/Loader';

const Donations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDonations(); }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donations');
      setDonations(Array.isArray(res.data) ? res.data : res.data?.donations || []);
    } catch {
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = donations.filter((d) =>
    (d.donor?.name || d.donorName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Donations</h1>
          <p className="text-gray-500 text-sm">All recorded donations</p>
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
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100"><p className="text-gray-500">No donations found</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Donor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Receipt</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/donations/${d._id}`)}>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><FiUser size={14} className="text-primary shrink-0" /><span>{d.donor?.name || d.donorName || 'Anonymous'}</span></div></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1 font-semibold whitespace-nowrap">Rs. {d.amount?.toLocaleString()}</div></td>
                    <td className="px-4 py-3 capitalize text-gray-700 whitespace-nowrap">{d.type || d.donationType || d.category || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{d.receiptNumber || '-'}</td>
                    <td className="px-4 py-3 text-xs capitalize text-gray-600"><span className={`px-2 py-0.5 rounded-full font-semibold ${d.status === 'confirmed' ? 'bg-green-100 text-green-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : d.status === 'failed' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.status || '-'}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500"><div className="flex items-center gap-1 whitespace-nowrap"><FiCalendar size={12} />{d.createdAt ? format(new Date(d.createdAt), 'MMM dd, yyyy') : '-'}</div></td>
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

export default Donations;
