import { useState, useEffect } from "react";
import {
  FiSearch,
  FiBook,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiLink,
  FiPhone,
} from "react-icons/fi";
import api from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const TYPES = ["book_bank", "scholarship", "other"];
const typeLabel = {
  book_bank: "Book Bank",
  scholarship: "Scholarship",
  other: "Other",
};
const typeColor = {
  book_bank: "bg-blue-100 text-blue-700",
  scholarship: "bg-green-100 text-green-700",
  other: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  title: "",
  description: "",
  type: "book_bank",
  link: "",
  contact: "",
};

const Resources = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/resources");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (r) => {
    setEditing(r._id);
    setForm({
      title: r.title || "",
      description: r.description || "",
      type: r.type || "book_bank",
      link: r.link || "",
      contact: r.contact || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/resources/${editing}`, form);
        toast.success("Resource updated");
      } else {
        await api.post("/resources", form);
        toast.success("Resource added");
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      fetchItems();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await api.delete(`/resources/${r._id}`);
      setItems((list) => list.filter((x) => x._id !== r._id));
      toast.success("Resource deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = items.filter((r) =>
    `${r.title || ""} ${r.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resources</h1>
          <p className="text-gray-500 text-sm">Book bank & scholarships</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total:{" "}
            <span className="font-bold text-primary">{filtered.length}</span>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition"
          >
            <FiPlus size={16} /> Add Resource
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">
              {editing ? "Edit Resource" : "New Resource"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title *"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {typeLabel[t]}
                </option>
              ))}
            </select>
            <input
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="Link (optional)"
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="Contact (optional)"
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : editing ? "Update" : "Save"}
          </button>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">No resources found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <FiBook size={16} className="text-primary shrink-0" />
                <h3 className="font-bold text-gray-800">{r.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[r.type] || "bg-gray-100 text-gray-700"}`}
                >
                  {typeLabel[r.type] || r.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {r.description || (
                  <span className="text-gray-400 italic">No description</span>
                )}
              </p>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {r.link && (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary flex items-center gap-1 hover:underline"
                  >
                    <FiLink size={13} />
                    Link
                  </a>
                )}
                {r.contact && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <FiPhone size={12} />
                    {r.contact}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => openEdit(r)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-800"
                >
                  <FiEdit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => remove(r)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 ml-auto"
                >
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
