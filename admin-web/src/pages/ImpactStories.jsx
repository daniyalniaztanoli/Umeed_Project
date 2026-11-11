import { useState, useEffect } from "react";
import {
  FiSearch,
  FiHeart,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
} from "react-icons/fi";
import api, { resolveImageUrl } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const CATS = ["education", "medical", "food", "blood", "general", "welfare"];
const catColor = {
  education: "bg-blue-100 text-blue-700",
  medical: "bg-red-100 text-red-700",
  food: "bg-orange-100 text-orange-700",
  blood: "bg-rose-100 text-rose-700",
  welfare: "bg-green-100 text-green-700",
  general: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  title: "",
  summary: "",
  body: "",
  category: "general",
  image: null,
};

const ImpactStories = () => {
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
      const res = await api.get("/impact-stories");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (s) => {
    setEditing(s._id);
    setForm({
      title: s.title || "",
      summary: s.summary || "",
      body: s.body || "",
      category: s.category || "general",
      image: null,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.summary.trim())
      return toast.error("Title and summary are required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("summary", form.summary);
      fd.append("body", form.body);
      fd.append("category", form.category);
      if (form.image) fd.append("image", form.image);
      if (editing) {
        await api.put(`/impact-stories/${editing}`, fd);
        toast.success("Story updated");
      } else {
        await api.post("/impact-stories", fd);
        toast.success("Story added");
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

  const togglePublish = async (s) => {
    try {
      await api.put(`/impact-stories/${s._id}`, {
        isPublished: String(!s.isPublished),
      });
      setItems((list) =>
        list.map((x) =>
          x._id === s._id ? { ...x, isPublished: !s.isPublished } : x,
        ),
      );
      toast.success(!s.isPublished ? "Published" : "Unpublished");
    } catch {
      toast.error("Update failed");
    }
  };

  const remove = async (s) => {
    if (!window.confirm("Delete this story?")) return;
    try {
      await api.delete(`/impact-stories/${s._id}`);
      setItems((list) => list.filter((x) => x._id !== s._id));
      toast.success("Story deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = items.filter((s) =>
    `${s.title || ""} ${s.summary || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Impact Stories</h1>
          <p className="text-gray-500 text-sm">
            Success stories shown in the app
          </p>
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
            <FiPlus size={16} /> Add Story
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories..."
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
              {editing ? "Edit Story" : "New Story"}
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
          <input
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Short summary *"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Full story (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-3 items-center flex-wrap">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary capitalize"
            >
              {CATS.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
            <label className="text-sm text-gray-600">
              Image:{" "}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                className="ml-1 text-xs"
              />
            </label>
            <button
              onClick={save}
              disabled={saving}
              className="ml-auto px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">No stories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {s.imageUrl && (
                <img
                  src={resolveImageUrl(s.imageUrl)}
                  alt={s.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <FiHeart size={16} className="text-primary shrink-0" />
                  <h3 className="font-bold text-gray-800">{s.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${catColor[s.category] || "bg-gray-100 text-gray-700"}`}
                  >
                    {s.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {s.isPublished ? "Published" : "Hidden"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{s.summary}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(s)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {s.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => openEdit(s)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-800"
                  >
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => remove(s)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 ml-auto"
                  >
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImpactStories;
