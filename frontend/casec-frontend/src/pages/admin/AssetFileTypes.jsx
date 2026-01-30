import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  FileType,
  Image,
  Video,
  FileText,
  Music,
} from "lucide-react";
import { assetFileTypesAPI } from "../../services/api";

const CATEGORY_OPTIONS = ["Image", "Video", "Document", "Audio"];

function getCategoryIcon(category) {
  switch (category) {
    case "Image": return <Image className="w-4 h-4 text-blue-500" />;
    case "Video": return <Video className="w-4 h-4 text-purple-500" />;
    case "Document": return <FileText className="w-4 h-4 text-red-500" />;
    case "Audio": return <Music className="w-4 h-4 text-green-500" />;
    default: return <FileType className="w-4 h-4 text-gray-500" />;
  }
}

const emptyForm = {
  mimeType: "",
  extensions: "",
  category: "Image",
  maxSizeMB: 20,
  isEnabled: true,
  displayName: "",
};

export default function AssetFileTypes() {
  const [fileTypes, setFileTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    loadFileTypes();
  }, []);

  const loadFileTypes = async () => {
    try {
      setLoading(true);
      const res = await assetFileTypesAPI.getAll();
      setFileTypes(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err?.message || "Failed to load file types");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (ft) => {
    setEditingId(ft.id);
    setFormData({
      mimeType: ft.mimeType,
      extensions: ft.extensions,
      category: ft.category,
      maxSizeMB: ft.maxSizeMB,
      isEnabled: ft.isEnabled,
      displayName: ft.displayName,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.mimeType || !formData.extensions || !formData.displayName) {
      alert("MimeType, Extensions, and Display Name are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await assetFileTypesAPI.update(editingId, formData);
      } else {
        await assetFileTypesAPI.create(formData);
      }
      setShowForm(false);
      loadFileTypes();
    } catch (err) {
      alert("Error: " + (err?.message || "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file type?")) return;
    try {
      await assetFileTypesAPI.delete(id);
      loadFileTypes();
    } catch (err) {
      alert("Error: " + (err?.message || "Delete failed"));
    }
  };

  const handleToggle = async (id) => {
    try {
      await assetFileTypesAPI.toggleEnabled(id);
      loadFileTypes();
    } catch (err) {
      alert("Error: " + (err?.message || "Toggle failed"));
    }
  };

  const filteredTypes = filterCategory
    ? fileTypes.filter((ft) => ft.category === filterCategory)
    : fileTypes;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileType className="w-6 h-6" />
          Asset File Types
        </h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add File Type
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
      )}

      {/* Category filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterCategory("")}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            !filterCategory ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({fileTypes.length})
        </button>
        {CATEGORY_OPTIONS.map((cat) => {
          const count = fileTypes.filter((ft) => ft.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                filterCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {getCategoryIcon(cat)}
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-2 text-left">Display Name</th>
              <th className="px-4 py-2 text-left">MIME Type</th>
              <th className="px-4 py-2 text-left">Extensions</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Max Size</th>
              <th className="px-4 py-2 text-center">Enabled</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTypes.map((ft) => (
              <tr key={ft.id} className={`border-b hover:bg-gray-50 ${!ft.isEnabled ? "opacity-50" : ""}`}>
                <td className="px-4 py-2 font-medium">{ft.displayName}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{ft.mimeType}</td>
                <td className="px-4 py-2 font-mono text-xs">{ft.extensions}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(ft.category)}
                    {ft.category}
                  </div>
                </td>
                <td className="px-4 py-2">{ft.maxSizeMB} MB</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleToggle(ft.id)}
                    className="inline-flex"
                    title={ft.isEnabled ? "Click to disable" : "Click to enable"}
                  >
                    {ft.isEnabled ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(ft)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ft.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTypes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No file types found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit File Type" : "Add File Type"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. JPEG Image"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MIME Type *</label>
                <input
                  type="text"
                  value={formData.mimeType}
                  onChange={(e) => setFormData({ ...formData, mimeType: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="e.g. image/jpeg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extensions * (comma-separated)</label>
                <input
                  type="text"
                  value={formData.extensions}
                  onChange={(e) => setFormData({ ...formData, extensions: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="e.g. .jpg,.jpeg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Size (MB)</label>
                  <input
                    type="number"
                    value={formData.maxSizeMB}
                    onChange={(e) => setFormData({ ...formData, maxSizeMB: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    min="1"
                    max="500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                />
                <label htmlFor="isEnabled" className="text-sm text-gray-700">Enabled</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
