import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  Users,
  Search,
  Upload,
  ExternalLink,
  Check,
  XCircle,
} from "lucide-react";
import { performersAPI, slideShowsAPI, getAssetUrl } from "../../services/api";

export default function AdminPerformers() {
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPerformer, setEditingPerformer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    chineseName: "",
    englishName: "",
    bio: "",
    photoUrl: "",
    website: "",
    instagram: "",
    youTube: "",
    isActive: true,
  });

  useEffect(() => {
    loadPerformers();
  }, []);

  const loadPerformers = async () => {
    try {
      setLoading(true);
      const response = await performersAPI.getAllAdmin();
      if (response.success) {
        setPerformers(response.data);
      }
    } catch (err) {
      setError(err?.message || "Failed to load performers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPerformer(null);
    setFormData({
      name: "",
      chineseName: "",
      englishName: "",
      bio: "",
      photoUrl: "",
      website: "",
      instagram: "",
      youTube: "",
      isActive: true,
    });
    setShowForm(true);
  };

  const handleEdit = (performer) => {
    setEditingPerformer(performer);
    setFormData({
      name: performer.name || "",
      chineseName: performer.chineseName || "",
      englishName: performer.englishName || "",
      bio: performer.bio || "",
      photoUrl: performer.photoUrl || "",
      website: performer.website || "",
      instagram: performer.instagram || "",
      youTube: performer.youTube || "",
      isActive: performer.isActive,
    });
    setShowForm(true);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await slideShowsAPI.uploadImage(uploadFormData);

      if (response.success && response.data) {
        const photoUrl = response.data.url || response.data.filePath;
        setFormData((prev) => ({ ...prev, photoUrl }));
      } else {
        setError(response.message || "Upload failed");
      }
    } catch (err) {
      setError("Error uploading file: " + (err.message || "Please try again"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingPerformer) {
        await performersAPI.update(editingPerformer.performerId, formData);
      } else {
        await performersAPI.create(formData);
      }

      setShowForm(false);
      loadPerformers();
    } catch (err) {
      setError(err?.message || "Failed to save performer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (performer) => {
    if (!confirm(`Are you sure you want to delete "${performer.name}"?`)) return;

    try {
      const response = await performersAPI.delete(performer.performerId);
      if (response.success) {
        loadPerformers();
      } else {
        setError(response.message || "Failed to delete performer");
      }
    } catch (err) {
      setError(err?.message || "Failed to delete performer");
    }
  };

  const handleToggleActive = async (performer) => {
    try {
      await performersAPI.update(performer.performerId, {
        isActive: !performer.isActive,
      });
      loadPerformers();
    } catch (err) {
      setError(err?.message || "Failed to update performer");
    }
  };

  const filteredPerformers = performers.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(query) ||
      p.chineseName?.toLowerCase().includes(query) ||
      p.englishName?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performers</h1>
          <p className="text-gray-600 mt-1">
            Manage performers that can be linked to program items
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          Add Performer
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search performers..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Performers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPerformers.map((performer) => (
          <div
            key={performer.performerId}
            className={`bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow ${
              !performer.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start p-4 gap-4">
              {/* Photo */}
              <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                {performer.photoUrl ? (
                  <img
                    src={getAssetUrl(performer.photoUrl)}
                    alt={performer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {performer.name}
                  </h3>
                  {performer.isActive ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                {performer.chineseName && (
                  <p className="text-sm text-gray-600">{performer.chineseName}</p>
                )}
                {performer.englishName && performer.englishName !== performer.name && (
                  <p className="text-sm text-gray-500">{performer.englishName}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t">
              <button
                onClick={() => handleToggleActive(performer)}
                className={`text-xs px-2 py-1 rounded ${
                  performer.isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {performer.isActive ? "Active" : "Inactive"}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(performer)}
                  className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(performer)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredPerformers.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchQuery ? "No performers found matching your search." : "No performers yet. Create one to get started."}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                {editingPerformer ? "Edit Performer" : "Create Performer"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {formData.photoUrl ? (
                      <img
                        src={getAssetUrl(formData.photoUrl)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors w-fit">
                      <Upload className="w-4 h-4" />
                      {uploading ? "Uploading..." : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        disabled={uploading}
                      />
                    </label>
                    <input
                      type="text"
                      value={formData.photoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, photoUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Or enter URL manually"
                    />
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Display name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chinese Name
                  </label>
                  <input
                    type="text"
                    value={formData.chineseName}
                    onChange={(e) =>
                      setFormData({ ...formData, chineseName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="中文名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English Name
                  </label>
                  <input
                    type="text"
                    value={formData.englishName}
                    onChange={(e) =>
                      setFormData({ ...formData, englishName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="English name"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Biography..."
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={formData.youTube}
                    onChange={(e) =>
                      setFormData({ ...formData, youTube: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Channel URL"
                  />
                </div>
              </div>

              {/* Active Status */}
              {editingPerformer && (
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingPerformer ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
