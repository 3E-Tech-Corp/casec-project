import { useState, useEffect, useCallback } from "react";
import {
  Image,
  Video,
  FileText,
  Music,
  File,
  Search,
  Grid,
  List,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  BarChart3,
  Settings,
  HardDrive,
  Check,
  AlertTriangle,
  Play,
} from "lucide-react";
import { assetsAPI, getAssetUrl } from "../../services/api";

const CATEGORIES = [
  { value: "", label: "All Types" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "document", label: "Documents" },
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeIcon(contentType) {
  if (!contentType) return <File className="w-5 h-5" />;
  if (contentType.startsWith("image/")) return <Image className="w-5 h-5 text-blue-500" />;
  if (contentType.startsWith("video/")) return <Video className="w-5 h-5 text-purple-500" />;
  if (contentType.startsWith("audio/")) return <Music className="w-5 h-5 text-green-500" />;
  if (contentType.includes("pdf") || contentType.includes("word") || contentType.includes("document"))
    return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

// ---------- Stats Dashboard ----------
function StatsDashboard({ stats }) {
  if (!stats) return null;
  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.activeAssets}</div>
          <div className="text-sm text-gray-500">Active Assets</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.deletedAssets}</div>
          <div className="text-sm text-gray-500">Deleted</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{formatBytes(stats.totalSizeBytes)}</div>
          <div className="text-sm text-gray-500">Total Size</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalAssets}</div>
          <div className="text-sm text-gray-500">Total (all)</div>
        </div>
      </div>

      {/* By category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> By Category
          </h4>
          {stats.byCategory?.length > 0 ? (
            <div className="space-y-2">
              {stats.byCategory.map((cat) => (
                <div key={cat.category} className="flex justify-between items-center text-sm">
                  <span>{cat.category}</span>
                  <span className="text-gray-500">
                    {cat.fileCount} files · {formatBytes(cat.totalSizeBytes)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data</p>
          )}
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <HardDrive className="w-4 h-4" /> By Folder
          </h4>
          {stats.byFolder?.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {stats.byFolder.map((f) => (
                <div key={f.folder} className="flex justify-between items-center text-sm">
                  <span className="font-mono text-xs">{f.folder}</span>
                  <span className="text-gray-500">
                    {f.fileCount} files · {formatBytes(f.totalSizeBytes)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Migration Tab ----------
function MigrationTab() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const runPreview = async () => {
    setLoading(true);
    try {
      const res = await assetsAPI.migratePreview();
      setPreview(res);
      setResult(null);
    } catch (err) {
      alert("Error: " + (err?.message || "Failed to preview migration"));
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    if (!window.confirm("Are you sure you want to run the migration? This will move files and update DB records."))
      return;
    setRunning(true);
    try {
      const res = await assetsAPI.migrate();
      setResult(res);
      setPreview(null);
    } catch (err) {
      alert("Error: " + (err?.message || "Failed to run migration"));
    } finally {
      setRunning(false);
    }
  };

  const report = result || preview;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={runPreview}
          disabled={loading || running}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          Preview Migration
        </button>
        <button
          onClick={runMigration}
          disabled={loading || running}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run Migration
        </button>
      </div>

      {report && (
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <h4 className="font-semibold">
            {report.isPreview ? "Migration Preview" : "Migration Result"}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-gray-500">Total Assets</div>
              <div className="font-bold">{report.totalAssets}</div>
            </div>
            <div>
              <div className="text-gray-500">Needs Migration</div>
              <div className="font-bold text-orange-600">{report.needsMigration}</div>
            </div>
            <div>
              <div className="text-gray-500">Already Migrated</div>
              <div className="font-bold text-green-600">{report.alreadyMigrated}</div>
            </div>
            {!report.isPreview && (
              <>
                <div>
                  <div className="text-gray-500">Success</div>
                  <div className="font-bold text-green-600">{report.successCount}</div>
                </div>
                <div>
                  <div className="text-gray-500">Errors</div>
                  <div className="font-bold text-red-600">{report.errorCount}</div>
                </div>
                <div>
                  <div className="text-gray-500">File Not Found</div>
                  <div className="font-bold text-yellow-600">{report.fileNotFoundCount}</div>
                </div>
              </>
            )}
          </div>

          {report.items?.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-1 text-left">FileId</th>
                    <th className="px-2 py-1 text-left">Old Path</th>
                    <th className="px-2 py-1 text-left">New Path</th>
                    <th className="px-2 py-1 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((item) => (
                    <tr key={item.fileId} className="border-t">
                      <td className="px-2 py-1">{item.fileId}</td>
                      <td className="px-2 py-1 font-mono">{item.oldPath}</td>
                      <td className="px-2 py-1 font-mono">{item.newPath}</td>
                      <td className="px-2 py-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${
                            item.status === "success"
                              ? "bg-green-100 text-green-700"
                              : item.status === "error"
                              ? "bg-red-100 text-red-700"
                              : item.status === "file_not_found"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.error && (
                          <span className="ml-1 text-red-500" title={item.error}>⚠</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Preview Modal (Lightbox) ----------
function PreviewModal({ asset, onClose, onEdit }) {
  if (!asset) return null;

  const isImage = asset.contentType?.startsWith("image/");
  const isVideo = asset.contentType?.startsWith("video/");

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Asset info header */}
      <div className="absolute top-4 left-4 text-white z-10">
        <div className="text-lg font-semibold">#{asset.fileId} — {asset.originalFileName}</div>
        <div className="text-sm text-white/70">{asset.contentType} · {formatBytes(asset.fileSize)}</div>
      </div>

      {/* Edit button */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
        className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg z-10"
      >
        <Settings className="w-4 h-4" />
        Edit Details
      </button>

      {/* Content */}
      <div 
        className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage && (
          <img
            src={getAssetUrl(`/asset/${asset.fileId}`)}
            alt={asset.originalFileName}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
        )}
        {isVideo && (
          <video
            src={getAssetUrl(`/asset/${asset.fileId}`)}
            controls
            autoPlay
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
          />
        )}
        {!isImage && !isVideo && (
          <div className="bg-white rounded-lg p-8 text-center">
            {getTypeIcon(asset.contentType)}
            <p className="mt-4 text-gray-600">{asset.originalFileName}</p>
            <a
              href={getAssetUrl(`/asset/${asset.fileId}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Detail Modal ----------
function AssetDetailModal({ asset, onClose, onUpdate }) {
  const [caption, setCaption] = useState(asset?.caption || "");
  const [status, setStatus] = useState(asset?.status || "Private");
  const [sortOrder, setSortOrder] = useState(asset?.sortOrder || 0);
  const [saving, setSaving] = useState(false);

  if (!asset) return null;

  const isImage = asset.contentType?.startsWith("image/");
  const isVideo = asset.contentType?.startsWith("video/");

  const handleSave = async () => {
    setSaving(true);
    try {
      await assetsAPI.updateMeta(asset.fileId, { caption, status, sortOrder });
      onUpdate?.();
      onClose();
    } catch (err) {
      alert("Error saving: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Asset #{asset.fileId}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Preview */}
          {isImage && (
            <div className="flex justify-center bg-gray-100 rounded-lg p-2">
              <img
                src={getAssetUrl(`/asset/${asset.fileId}`)}
                alt={asset.originalFileName}
                className="max-h-64 object-contain rounded"
              />
            </div>
          )}
          {isVideo && (
            <div className="flex justify-center bg-gray-100 rounded-lg p-2">
              <video
                src={getAssetUrl(`/asset/${asset.fileId}`)}
                controls
                className="max-h-64 rounded"
              />
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">File:</span> {asset.originalFileName}</div>
            <div><span className="text-gray-500">Type:</span> {asset.contentType}</div>
            <div><span className="text-gray-500">Size:</span> {formatBytes(asset.fileSize)}</div>
            <div><span className="text-gray-500">Folder:</span> {asset.folder || "—"}</div>
            <div><span className="text-gray-500">Object:</span> {asset.objectType ? `${asset.objectType}/${asset.objectId}` : "—"}</div>
            <div><span className="text-gray-500">Uploaded:</span> {formatDate(asset.createdAt)}</div>
            <div><span className="text-gray-500">Path:</span> <span className="font-mono text-xs">{asset.storagePath}</span></div>
            <div><span className="text-gray-500">Provider:</span> {asset.storageProvider}</div>
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Optional caption..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
                  <option value="MembersOnly">Members Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Component ----------
export default function AssetManager() {
  const [activeTab, setActiveTab] = useState("browse"); // browse | stats | migration
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [assets, setAssets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(48);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [objectTypeFilter, setObjectTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Selection & Modals
  const [selected, setSelected] = useState(new Set());
  const [previewAsset, setPreviewAsset] = useState(null);  // Lightbox preview
  const [detailAsset, setDetailAsset] = useState(null);    // Edit modal

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        ...(typeFilter && { type: typeFilter }),
        ...(folderFilter && { folder: folderFilter }),
        ...(objectTypeFilter && { objectType: objectTypeFilter }),
        ...(searchQuery && { search: searchQuery }),
        includeDeleted,
      };
      const res = await assetsAPI.browse(params);
      setAssets(res.items || []);
      setTotalCount(res.totalCount || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error("Error loading assets:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, typeFilter, folderFilter, objectTypeFilter, searchQuery, includeDeleted]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await assetsAPI.getStats();
      setStats(res);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "browse") loadAssets();
  }, [activeTab, loadAssets]);

  useEffect(() => {
    if (activeTab === "stats") loadStats();
  }, [activeTab, loadStats]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadAssets();
  };

  const toggleSelect = (fileId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === assets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(assets.map((a) => a.fileId)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} asset(s)? This is a soft delete.`)) return;
    try {
      await assetsAPI.bulkDelete([...selected]);
      setSelected(new Set());
      loadAssets();
    } catch (err) {
      alert("Error: " + (err?.message || "Bulk delete failed"));
    }
  };

  const handleSingleDelete = async (fileId) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await assetsAPI.delete(fileId);
      loadAssets();
    } catch (err) {
      alert("Error: " + (err?.message || "Delete failed"));
    }
  };

  const tabs = [
    { id: "browse", label: "Browse Assets", icon: <Image className="w-4 h-4" /> },
    { id: "stats", label: "Statistics", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "migration", label: "Migration Tool", icon: <RefreshCw className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Asset Manager</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white shadow text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Browse Tab */}
      {activeTab === "browse" && (
        <div className="space-y-4">
          {/* Filters bar */}
          <div className="bg-white rounded-lg border p-4">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-gray-500 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by filename..."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Folder</label>
                <input
                  type="text"
                  value={folderFilter}
                  onChange={(e) => setFolderFilter(e.target.value)}
                  placeholder="e.g. clubs"
                  className="border rounded-lg px-3 py-2 text-sm w-32"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Object Type</label>
                <input
                  type="text"
                  value={objectTypeFilter}
                  onChange={(e) => setObjectTypeFilter(e.target.value)}
                  placeholder="e.g. Event"
                  className="border rounded-lg px-3 py-2 text-sm w-32"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeDeleted"
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                />
                <label htmlFor="includeDeleted" className="text-sm text-gray-600">Include deleted</label>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Search
              </button>
            </form>
          </div>

          {/* Toolbar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {totalCount} asset{totalCount !== 1 ? "s" : ""}
              </span>
              {selected.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete {selected.size}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:underline"
              >
                {selected.size === assets.length && assets.length > 0 ? "Deselect All" : "Select All"}
              </button>
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <File className="w-12 h-12 mx-auto mb-2" />
              <p>No assets found</p>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {assets.map((asset) => {
                const isImage = asset.contentType?.startsWith("image/");
                const isVideo = asset.contentType?.startsWith("video/");
                const isSelected = selected.has(asset.fileId);
                return (
                  <div
                    key={asset.fileId}
                    className={`group relative bg-white rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-blue-500" : ""
                    } ${asset.isDeleted ? "opacity-50" : ""}`}
                  >
                    {/* Checkbox */}
                    <div
                      className="absolute top-1.5 left-1.5 z-10"
                      onClick={(e) => { e.stopPropagation(); toggleSelect(asset.fileId); }}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? "bg-blue-600 border-blue-600" : "bg-white/80 border-gray-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div
                      className="aspect-square bg-gray-100 flex items-center justify-center relative"
                      onClick={() => setPreviewAsset(asset)}
                    >
                      {isImage ? (
                        <img
                          src={getAssetUrl(`/asset/${asset.fileId}`)}
                          alt={asset.originalFileName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : isVideo ? (
                        <>
                          <video
                            src={getAssetUrl(`/asset/${asset.fileId}`)}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                          />
                          {/* Play icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <Play className="w-6 h-6 text-purple-600 ml-1" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          {getTypeIcon(asset.contentType)}
                          <span className="text-xs text-gray-400 px-1 truncate max-w-full">
                            {asset.contentType?.split("/")[1] || "file"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-1.5">
                      <div className="text-xs font-medium text-blue-600">#{asset.fileId}</div>
                      <div className="text-xs truncate" title={asset.originalFileName}>
                        {asset.originalFileName}
                      </div>
                      <div className="text-xs text-gray-400">{formatBytes(asset.fileSize)}</div>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSingleDelete(asset.fileId); }}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-3 py-2 text-left w-8">
                      <input
                        type="checkbox"
                        checked={selected.size === assets.length && assets.length > 0}
                        onChange={selectAll}
                      />
                    </th>
                    <th className="px-3 py-2 text-left">File</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Size</th>
                    <th className="px-3 py-2 text-left">Folder</th>
                    <th className="px-3 py-2 text-left">Object</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr
                      key={asset.fileId}
                      className={`border-b hover:bg-gray-50 ${asset.isDeleted ? "opacity-50" : ""}`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selected.has(asset.fileId)}
                          onChange={() => toggleSelect(asset.fileId)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {asset.contentType?.startsWith("image/") ? (
                            <img
                              src={getAssetUrl(`/asset/${asset.fileId}`)}
                              alt=""
                              className="w-8 h-8 rounded object-cover cursor-pointer hover:opacity-80"
                              loading="lazy"
                              onClick={() => setPreviewAsset(asset)}
                            />
                          ) : asset.contentType?.startsWith("video/") ? (
                            <div 
                              className="relative w-8 h-8 rounded overflow-hidden cursor-pointer hover:opacity-80"
                              onClick={() => setPreviewAsset(asset)}
                            >
                              <video
                                src={getAssetUrl(`/asset/${asset.fileId}`)}
                                className="w-8 h-8 object-cover"
                                preload="metadata"
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          ) : (
                            getTypeIcon(asset.contentType)
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs text-blue-600 font-medium">#{asset.fileId}</span>
                            <button
                              onClick={() => setPreviewAsset(asset)}
                              className="text-gray-900 hover:text-blue-600 hover:underline truncate max-w-[200px] text-left"
                              title={asset.originalFileName}
                            >
                              {asset.originalFileName}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{asset.contentType}</td>
                      <td className="px-3 py-2 text-gray-500">{formatBytes(asset.fileSize)}</td>
                      <td className="px-3 py-2 text-gray-500 font-mono text-xs">{asset.folder || "—"}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {asset.objectType ? `${asset.objectType}/${asset.objectId}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{formatDate(asset.createdAt)}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${
                            asset.status === "Public"
                              ? "bg-green-100 text-green-700"
                              : asset.status === "MembersOnly"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setPreviewAsset(asset)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSingleDelete(asset.fileId)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div>
          {statsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <StatsDashboard stats={stats} />
          )}
        </div>
      )}

      {/* Migration Tab */}
      {activeTab === "migration" && <MigrationTab />}

      {/* Preview Modal (Lightbox) */}
      {previewAsset && (
        <PreviewModal
          asset={previewAsset}
          onClose={() => setPreviewAsset(null)}
          onEdit={() => {
            setDetailAsset(previewAsset);
            setPreviewAsset(null);
          }}
        />
      )}

      {/* Detail/Edit Modal */}
      {detailAsset && (
        <AssetDetailModal
          asset={detailAsset}
          onClose={() => setDetailAsset(null)}
          onUpdate={loadAssets}
        />
      )}
    </div>
  );
}
