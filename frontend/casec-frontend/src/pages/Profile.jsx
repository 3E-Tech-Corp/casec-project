import { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuthStore } from '../store/useStore';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        profession: user.profession || '',
        hobbies: user.hobbies || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await usersAPI.updateProfile(formData);
      if (response.success) {
        updateUser(formData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      alert('Update failed: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600 text-lg">Manage your personal information</p>
      </div>

      <div className="card">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <p className="text-accent font-semibold">{user?.membershipTypeName}</p>
            <p className="text-gray-600 text-sm">{user?.email}</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <input type="text" className="input w-full" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <input type="text" className="input w-full" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input type="tel" className="input w-full" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profession</label>
              <input type="text" className="input w-full" value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hobbies</label>
            <input type="text" className="input w-full" value={formData.hobbies} onChange={(e) => setFormData({...formData, hobbies: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea rows={4} className="input w-full resize-none" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary flex items-center space-x-2">
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
