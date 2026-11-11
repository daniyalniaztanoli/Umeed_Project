import { useState, useEffect } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiUsers,
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const COLORS = ['#22C55E', '#FDE68A', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#6B7280'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [welfareStats, setWelfareStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [complaintRes, welfareRes] = await Promise.all([
        api.get('/complaints/stats'),
        api.get('/welfare/stats'),
      ]);
      setStats(complaintRes.data);
      setWelfareStats(welfareRes.data);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const categoryData =
    stats?.byCategory?.map((item) => ({
      name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1),
      count: item.count,
    })) || [];

  const locationData =
    stats?.byLocation?.slice(0, 5).map((item) => ({
      name: item._id?.length > 15 ? item._id.slice(0, 15) + '...' : item._id,
      count: item.count,
    })) || [];

  const statusData = [
    { name: 'Pending', value: stats?.pending || 0 },
    { name: 'Assigned', value: stats?.assigned || 0 },
    { name: 'In Progress', value: stats?.inProgress || 0 },
    { name: 'Resolved', value: stats?.resolved || 0 },
    { name: 'Reopened', value: stats?.reopened || 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Overview of campus complaints and welfare activities
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiAlertCircle}
          label="Total Complaints"
          value={stats?.total || 0}
          color="primary"
        />
        <StatCard
          icon={FiClock}
          label="Pending"
          value={stats?.pending || 0}
          color="yellow"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Resolved"
          value={stats?.resolved || 0}
          color="green"
        />
        <StatCard
          icon={FiHeart}
          label="Welfare Requests"
          value={welfareStats?.total || 0}
          color="red"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={FiUsers}
          label="Total Disbursed"
          value={`PKR ${welfareStats?.totalDisbursed?.toLocaleString() || 0}`}
          color="blue"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Approved Welfare"
          value={welfareStats?.approved || 0}
          color="green"
        />
        <StatCard
          icon={FiClock}
          label="Avg Resolution Time"
          value={`${stats?.avgResolutionTimeHours || 0}h`}
          color="yellow"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Complaints by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#22C55E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Complaints by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Top Complaint Locations
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#FDE68A" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Welfare by Type */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Welfare Requests by Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={
                welfareStats?.byType?.map((item) => ({
                  name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1),
                  count: item.count,
                })) || []
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;