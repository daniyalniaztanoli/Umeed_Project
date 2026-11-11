import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiUserCheck,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiImage,
} from 'react-icons/fi';
import { format } from 'date-fns';
import api, { resolveImageUrl } from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  'In Progress': 'bg-purple-100 text-purple-700 border-purple-200',
  Resolved: 'bg-green-100 text-green-700 border-green-200',
  Reopened: 'bg-red-100 text-red-700 border-red-200',
  Rejected: 'bg-gray-100 text-gray-700 border-gray-200',
};

const priorityColors = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-600',
  High: 'bg-orange-100 text-orange-600',
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Assignment state
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState(null);

  useEffect(() => {
    fetchComplaint();
    fetchStaff();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setData(res.data);
      setSelectedPriority(res.data.priority);
      setNewStatus(res.data.status);
    } catch (error) {
      toast.error('Failed to load complaint');
      navigate('/complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaff(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/complaints/${id}/assign`, {
        staffId: selectedStaff,
        priority: selectedPriority,
      });
      toast.success('Complaint assigned successfully');
      fetchComplaint();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      formData.append('remark', remark);
      if (resolutionPhoto) {
        formData.append('photo', resolutionPhoto);
      }

      await api.put(`/complaints/${id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Status updated');
      setRemark('');
      setResolutionPhoto(null);
      fetchComplaint();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!data) return null;

  const { complaint, updates, feedback } = data
    ? { complaint: data, updates: data.timeline || [], feedback: data.feedback }
    : { complaint: null, updates: [], feedback: null };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/complaints')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Complaint Details</h1>
          <p className="text-gray-500 text-sm">
            ID: #{complaint._id.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Complaint Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span
                  className={`inline-block text-xs px-3 py-1 rounded-full font-medium capitalize border ${
                    statusColors[complaint.status]
                  }`}
                >
                  {complaint.status.replace('_', ' ')}
                </span>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                  priorityColors[complaint.priority]
                }`}
              >
                {complaint.priority} priority
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-3">
              {complaint.title || `${complaint.category} Issue`}
            </h2>
            <p className="text-gray-700 mb-4">{complaint.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <FiMapPin className="text-primary" />
                <span>{complaint.location?.building ? `${complaint.location.building}${complaint.location.room ? ` - ${complaint.location.room}` : ''}` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiCalendar className="text-primary" />
                <span>{format(new Date(complaint.createdAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiUser className="text-primary" />
                <span>{complaint.user?.name}</span>
              </div>
              {complaint.assignedTo && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FiUserCheck className="text-primary" />
                  <span>Assigned to: {complaint.assignedTo.user?.name}</span>
                </div>
              )}
            </div>

            {/* Images */}
            {complaint.images?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiImage /> Reported Photos
                </p>
                <div className="flex gap-2 flex-wrap">
                  {complaint.images.map((url, i) => {
                    const src = resolveImageUrl(url);
                    return (
                      <a key={i} href={src} target="_blank" rel="noreferrer">
                        <img
                          src={src}
                          alt="Complaint"
                          className="rounded-lg h-40 object-cover border border-gray-200 cursor-pointer hover:opacity-90"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resolution Photo */}
            {complaint.resolutionPhoto && (
              <div className="mt-4">
                <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                  <FiCheckCircle /> Resolution Proof
                </p>
                <a href={resolveImageUrl(complaint.resolutionPhoto)} target="_blank" rel="noreferrer">
                  <img
                    src={resolveImageUrl(complaint.resolutionPhoto)}
                    alt="Resolution"
                    className="rounded-lg max-h-80 object-cover border border-green-200 cursor-pointer hover:opacity-90"
                  />
                </a>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Timeline</h3>
            <div className="space-y-4">
              {updates.map((update, index) => (
                <div key={update._id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === updates.length - 1
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                        {update.status === 'Resolved' ? (
                        <FiCheckCircle size={16} />
                      ) : update.status === 'Pending' ? (
                        <FiClock size={16} />
                      ) : (
                        <FiAlertCircle size={16} />
                      )}
                    </div>
                    {index < updates.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">
                        {update.status}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(update.createdAt), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{update.remark}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      by {update.updatedBy?.name}
                    </p>
                    {update.photoUrl && (
                      <a href={resolveImageUrl(update.photoUrl)} target="_blank" rel="noreferrer">
                        <img
                          src={resolveImageUrl(update.photoUrl)}
                          alt="Update"
                          className="mt-2 rounded-lg max-h-40 object-cover border cursor-pointer hover:opacity-90"
                        />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">User Feedback</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-2xl ${
                        star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {feedback.rating}/5
                </span>
              </div>
              {feedback.comment && (
                <p className="text-gray-700 italic">"{feedback.comment}"</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Assign Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Assign to Staff
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Member
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Select staff</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.user?.name} ({s.department?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
              <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <button
                onClick={handleAssign}
                disabled={actionLoading}
                className="w-full bg-primary hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Assigning...' : 'Assign Complaint'}
              </button>
            </div>
          </div>

          {/* Status Update Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Update Status
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remark
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder="Add a note about this update..."
                />
              </div>

              {newStatus === 'Resolved' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setResolutionPhoto(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-teal-700"
                  />
                </div>
              )}

              <button
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className="w-full bg-primary hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;