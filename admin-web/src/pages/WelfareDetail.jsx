import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiFile,
  FiCheckCircle,
  FiXCircle,
  FiSend,
} from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const statusColors = {
  submitted: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  disbursed: 'bg-purple-100 text-purple-700',
};

const WelfareDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [remarks, setRemarks] = useState('');
  const [fundType, setFundType] = useState('general');
  const [disburseAmount, setDisburseAmount] = useState('');
  const [disburseMethod, setDisburseMethod] = useState('bank_transfer');
  const [proof, setProof] = useState(null);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/welfare/${id}`);
      setData(res.data);
      setFundType(res.data.request.fundType);
      setDisburseAmount(res.data.request.amountRequested);
    } catch (error) {
      toast.error('Failed to load request');
      navigate('/welfare');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    setActionLoading(true);
    try {
      await api.put(`/welfare/${id}/review`, { remarks });
      toast.success('Marked as under review');
      fetchRequest();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.put(`/welfare/${id}/approve`, { remarks, fundType });
      toast.success('Request approved');
      fetchRequest();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!remarks) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await api.put(`/welfare/${id}/reject`, { remarks });
      toast.success('Request rejected');
      fetchRequest();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburse = async () => {
    if (!disburseAmount || !disburseMethod) {
      toast.error('Amount and method are required');
      return;
    }
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', disburseAmount);
      formData.append('method', disburseMethod);
      formData.append('fundType', fundType);
      if (proof) formData.append('proof', proof);

      await api.put(`/welfare/${id}/disburse`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Funds disbursed successfully');
      fetchRequest();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!data) return null;

  const { request, disbursement } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/welfare')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welfare Request</h1>
          <p className="text-gray-500 text-sm">
            ID: #{request._id.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                  statusColors[request.status]
                }`}
              >
                {request.status.replace('_', ' ')}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                {request.fundType} Fund
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2 capitalize">
              {request.type} Assistance
            </h2>
            <p className="text-gray-700 mb-4">{request.reason}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <FiUser className="text-primary" />
                <span>{request.user?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiCalendar className="text-primary" />
                <span>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiDollarSign className="text-primary" />
                <span className="font-semibold">
                  PKR {request.amountRequested?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Documents */}
            {request.documents && request.documents.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Supporting Documents
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {request.documents.map((doc, i) => (
                    <a
                      key={i}
                      href={`http://localhost:5000${doc}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-primary"
                    >
                      <FiFile size={16} />
                      Document {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {request.remarks && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Admin Remarks:</p>
                <p className="text-sm text-blue-700 mt-1">{request.remarks}</p>
              </div>
            )}
          </div>

          {/* Disbursement Info */}
          {disbursement && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiCheckCircle className="text-green-600" /> Disbursement Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-800">
                    PKR {disbursement.amount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Method</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {disbursement.method?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Fund Type</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {disbursement.fundType}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-semibold text-gray-800">
                    {format(new Date(disbursement.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              {disbursement.proofUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Payment Proof</p>
                  <img
                    src={`http://localhost:5000${disbursement.proofUrl}`}
                    alt="Proof"
                    className="rounded-lg max-h-60 object-cover border"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Remarks */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Remarks</h3>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add remarks..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          {/* Actions */}
          {request.status === 'submitted' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
              <button
                onClick={handleReview}
                disabled={actionLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Mark Under Review'}
              </button>
            </div>
          )}

          {request.status === 'under_review' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Decision</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fund Type
                  </label>
                  <select
                    value={fundType}
                    onChange={(e) => setFundType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="zakat">Zakat</option>
                    <option value="sadaqah">Sadaqah</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiCheckCircle /> Approve
                </button>

                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiXCircle /> Reject
                </button>
              </div>
            </div>
          )}

          {request.status === 'approved' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Disburse Funds</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={disburseAmount}
                    onChange={(e) => setDisburseAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={disburseMethod}
                    onChange={(e) => setDisburseMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Proof
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProof(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-teal-700"
                  />
                </div>

                <button
                  onClick={handleDisburse}
                  disabled={actionLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiSend /> Disburse Funds
                </button>
              </div>
            </div>
          )}

          {request.status === 'disbursed' && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <FiCheckCircle size={20} />
                <span>Funds Disbursed Successfully</span>
              </div>
            </div>
          )}

          {request.status === 'rejected' && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-center gap-2 text-red-700 font-medium">
                <FiXCircle size={20} />
                <span>Request Rejected</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelfareDetail;