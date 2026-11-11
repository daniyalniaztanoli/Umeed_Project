import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiExternalLink,
} from "react-icons/fi";
import api, { resolveImageUrl } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const statusBadge = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  failed: "bg-purple-100 text-purple-700",
};

const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDonation();
  }, [id]);

  const fetchDonation = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/donations/${id}`);
      setDonation(res.data);
    } catch {
      toast.error("Failed to load donation");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await api.put(`/donations/${id}/status`, { status });
      toast.success(
        `Donation ${status === "confirmed" ? "confirmed" : status}`,
      );
      setDonation((d) => (d ? { ...d, status } : d));
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader />;
  if (!donation)
    return <div className="p-6 text-gray-500">Donation not found</div>;

  const proofImage = resolveImageUrl(donation.proofUrl);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/donations")}
        className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
      >
        <FiArrowLeft size={16} /> Back to Donations
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: details */}
        <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Donation Details
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge[donation.status] || "bg-gray-100 text-gray-700"}`}
            >
              {donation.status}
            </span>
          </div>
          <dl className="divide-y divide-gray-100">
            {[
              [
                "Donor",
                donation.donor?.name || donation.donorName || "Anonymous",
              ],
              ["Amount", `Rs. ${donation.amount?.toLocaleString()}`],
              [
                "Type",
                (donation.type || donation.category || "-").replace("_", " "),
              ],
              ["Method", (donation.method || "-").replace("_", " ")],
              ["Receipt #", donation.receiptNumber || "-"],
              ["Reference", donation.reference || "-"],
              [
                "Contact",
                donation.donorContact || donation.donor?.contact || "-",
              ],
              [
                "Date",
                donation.createdAt
                  ? new Date(donation.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-",
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-3 text-sm gap-4">
                <dt className="text-gray-500 font-medium shrink-0">{label}</dt>
                <dd className="text-gray-800 font-semibold text-right">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Actions
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                disabled={updating || donation.status === "confirmed"}
                onClick={() => updateStatus("confirmed")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <FiCheck size={16} /> Confirm
              </button>
              <button
                disabled={updating || donation.status === "rejected"}
                onClick={() => updateStatus("rejected")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold shadow-sm hover:bg-red-700 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <FiX size={16} /> Reject
              </button>
              <button
                disabled={updating || donation.status === "failed"}
                onClick={() => updateStatus("failed")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-red-600 text-sm font-semibold border border-red-300 hover:bg-red-50 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <FiAlertTriangle size={16} /> Mark Failed
              </button>
            </div>
          </div>
        </div>

        {/* Right: proof image */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-4">
            Payment Proof
          </p>
          {proofImage ? (
            <div className="space-y-3">
              <a
                href={proofImage}
                target="_blank"
                rel="noreferrer"
                className="block group"
              >
                <img
                  src={proofImage}
                  alt="Payment proof"
                  className="w-full rounded-lg border border-gray-200 object-contain bg-gray-50 group-hover:opacity-90 transition"
                />
              </a>
              <a
                href={proofImage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
              >
                <FiExternalLink size={14} /> Open full image
              </a>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
              <p className="text-gray-400 text-sm">
                No proof image uploaded for this donation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationDetail;
