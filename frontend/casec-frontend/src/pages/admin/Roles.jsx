import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  Shield,
  Users,
  Check,
  ChevronDown,
  ChevronRight,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { rolesAPI, usersAPI } from "../../services/api";

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [expandedRole, setExpandedRole] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    areaPermissions: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, areasRes] = await Promise.all([
        rolesAPI.getAll(),
        rolesAPI.getAreas(),
      ]);

      if (rolesRes.success) {
        setRoles(rolesRes.data);
      }
      if (areasRes.success) {
        setAreas(areasRes.data);
      }
    } catch (err) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      areaPermissions: [],
    });
    setShowForm(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      areaPermissions: role.areaPermissions?.map((ap) => ({
        areaId: ap.areaId,
        canView: ap.canView,
        canEdit: ap.canEdit,
        canDelete: ap.canDelete,
      })) || [],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Role name is required");
      return;
    }

    try {
      setSaving(true);
      let response;

      const payload = {
        name: formData.name,
        description: formData.description,
        areaPermissions: formData.areaPermissions.filter(
          (p) => p.canView || p.canEdit || p.canDelete
        ),
      };

      if (editingRole) {
        response = await rolesAPI.update(editingRole.roleId, payload);
      } else {
        response = await rolesAPI.create(payload);
      }

      if (response.success) {
        setShowForm(false);
        loadData();
      } else {
        setError(response.message || "Failed to save role");
      }
    } catch (err) {
      setError(err?.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roleId) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await rolesAPI.delete(roleId);
      if (response.success) {
        loadData();
      } else {
        setError(response.message || "Failed to delete role");
      }
    } catch (err) {
      setError(err?.message || "Failed to delete role");
    }
  };

  const togglePermission = (areaId, field) => {
    setFormData((prev) => {
      const existing = prev.areaPermissions.find((p) => p.areaId === areaId);
      if (existing) {
        return {
          ...prev,
          areaPermissions: prev.areaPermissions.map((p) =>
            p.areaId === areaId ? { ...p, [field]: !p[field] } : p
          ),
        };
      } else {
        return {
          ...prev,
          areaPermissions: [
            ...prev.areaPermissions,
            { areaId, canView: false, canEdit: false, canDelete: false, [field]: true },
          ],
        };
      }
    });
  };

  const getPermission = (areaId, field) => {
    const perm = formData.areaPermissions.find((p) => p.areaId === areaId);
    return perm ? perm[field] : false;
  };

  const selectAllInCategory = (category, field) => {
    const categoryAreas = areas.filter((a) => a.category === category);
    setFormData((prev) => {
      const newPerms = [...prev.areaPermissions];
      categoryAreas.forEach((area) => {
        const idx = newPerms.findIndex((p) => p.areaId === area.areaId);
        if (idx >= 0) {
          newPerms[idx] = { ...newPerms[idx], [field]: true };
        } else {
          newPerms.push({
            areaId: area.areaId,
            canView: false,
            canEdit: false,
            canDelete: false,
            [field]: true,
          });
        }
      });
      return { ...prev, areaPermissions: newPerms };
    });
  };

  // Group areas by category
  const areasByCategory = areas.reduce((acc, area) => {
    const cat = area.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(area);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-500 mt-1">
            Manage roles and assign admin UI permissions
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Role
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Roles List */}
      <div className="space-y-4">
        {roles.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No roles defined yet. Create your first role!
          </div>
        ) : (
          roles.map((role) => (
            <RoleCard
              key={role.roleId}
              role={role}
              expanded={expandedRole === role.roleId}
              onToggle={() =>
                setExpandedRole(expandedRole === role.roleId ? null : role.roleId)
              }
              onEdit={() => handleEdit(role)}
              onDelete={() => handleDelete(role.roleId)}
              onReload={loadData}
            />
          ))
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingRole ? "Edit Role" : "New Role"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., Content Editor"
                    disabled={editingRole?.isSystem}
                  />
                  {editingRole?.isSystem && (
                    <p className="text-xs text-amber-600 mt-1">
                      System role names cannot be changed
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Brief description of this role"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Admin Area Permissions
                </h3>

                <div className="space-y-6">
                  {Object.entries(areasByCategory).map(([category, categoryAreas]) => (
                    <div key={category} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <span className="font-medium text-gray-700">{category}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => selectAllInCategory(category, "canView")}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            All View
                          </button>
                          <button
                            type="button"
                            onClick={() => selectAllInCategory(category, "canEdit")}
                            className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
                          >
                            All Edit
                          </button>
                        </div>
                      </div>

                      <div className="divide-y">
                        {categoryAreas.map((area) => (
                          <div
                            key={area.areaId}
                            className="px-4 py-3 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {area.name}
                              </span>
                              {area.description && (
                                <p className="text-xs text-gray-500">
                                  {area.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={getPermission(area.areaId, "canView")}
                                  onChange={() =>
                                    togglePermission(area.areaId, "canView")
                                  }
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-600">View</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={getPermission(area.areaId, "canEdit")}
                                  onChange={() =>
                                    togglePermission(area.areaId, "canEdit")
                                  }
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-600">Edit</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={getPermission(area.areaId, "canDelete")}
                                  onChange={() =>
                                    togglePermission(area.areaId, "canDelete")
                                  }
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-600">Delete</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name.trim()}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Role Card Component
function RoleCard({ role, expanded, onToggle, onEdit, onDelete, onReload }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (expanded) {
      loadRoleUsers();
    }
  }, [expanded]);

  const loadRoleUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await rolesAPI.getRoleUsers(role.roleId);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error("Error loading role users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenAssignModal = async () => {
    try {
      const response = await usersAPI.getAll();
      if (response.success) {
        // Filter out users who already have this role
        const existingUserIds = users.map((u) => u.userId);
        setAllUsers(
          response.data.filter((u) => !existingUserIds.includes(u.userId))
        );
      }
      setShowAssignModal(true);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleAssignUser = async (userId) => {
    try {
      setAssigning(true);
      const response = await rolesAPI.assignRole({
        userId,
        roleId: role.roleId,
      });
      if (response.success) {
        setShowAssignModal(false);
        loadRoleUsers();
        onReload();
      }
    } catch (err) {
      console.error("Error assigning user:", err);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignUser = async (userRoleId) => {
    if (!confirm("Remove this user from the role?")) return;

    try {
      const response = await rolesAPI.unassignRole(userRoleId);
      if (response.success) {
        loadRoleUsers();
        onReload();
      }
    } catch (err) {
      console.error("Error unassigning user:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}

        <div className="p-2 bg-emerald-100 rounded-lg">
          <Shield className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">{role.name}</h3>
            {role.isSystem && (
              <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded">
                System
              </span>
            )}
            {!role.isActive && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Inactive
              </span>
            )}
          </div>
          {role.description && (
            <p className="text-gray-500 text-sm truncate">{role.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Users className="w-4 h-4" />
          <span>{role.userCount} users</span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {!role.isSystem && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content - Users */}
      {expanded && (
        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-700">Assigned Users</h4>
            <button
              onClick={handleOpenAssignModal}
              className="flex items-center gap-1 text-sm bg-emerald-100 text-emerald-600 px-3 py-1 rounded hover:bg-emerald-200"
            >
              <UserPlus className="w-4 h-4" />
              Assign User
            </button>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No users assigned to this role
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((userRole) => (
                <div
                  key={userRole.userRoleId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {userRole.userName}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      {userRole.userEmail}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnassignUser(userRole.userRoleId)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Remove from role"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Permissions Summary */}
          {role.areaPermissions && role.areaPermissions.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-gray-700 mb-2">Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {role.areaPermissions
                  .filter((p) => p.canView)
                  .map((p) => (
                    <span
                      key={p.areaId}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                    >
                      {p.areaName}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full max-h-[60vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">Assign User to {role.name}</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-80">
              {allUsers.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No users available to assign
                </p>
              ) : (
                <div className="space-y-2">
                  {allUsers.map((user) => (
                    <button
                      key={user.userId}
                      onClick={() => handleAssignUser(user.userId)}
                      disabled={assigning}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
                    >
                      <div className="text-left">
                        <span className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          {user.email}
                        </span>
                      </div>
                      <UserPlus className="w-4 h-4 text-emerald-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
