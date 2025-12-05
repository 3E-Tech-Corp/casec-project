import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Camera } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuthStore } from '../store/useStore';

export default function EnhancedProfile() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        profession: user.profession || '',
        hobbies: user.hobbies || '',
        bio: user.bio || '',
        linkedInUrl: user.linkedInUrl || '',
        twitterHandle: user.twitterHandle || '',
      });
      setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append('file', avatarFile);

    try {
      const response = await usersAPI.uploadAvatar(formData);
      if (response.success) {
        updateUser({ avatarUrl: response.data.avatarUrl });
        setAvatarFile(null);
        alert('Avatar updated successfully!');
      }
    } catch (err) {
      alert('Avatar upload failed: ' + (err.message || 'Please try again'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      if (avatarFile) {
        await handleAvatarUpload();
      }

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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600 text-lg">Manage your personal information and avatar</p>
      </div>

      <div className="card">
        {/* Avatar Section */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-6 pb-6 border-b">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold border-4 border-primary">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-accent text-white rounded-full p-3 hover:bg-accent-dark shadow-lg transition-all"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <p className="text-accent font-semibold">{user?.membershipTypeName}</p>
            <p className="text-gray-600 text-sm">{user?.email}</p>
            {avatarFile && (
              <button
                onClick={handleAvatarUpload}
                className="btn btn-accent text-sm mt-3 inline-flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Avatar</span>
              </button>
            )}
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h3>
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
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">About You</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hobbies & Interests</label>
                <input type="text" className="input w-full" placeholder="e.g., Tennis, Photography, Cooking" value={formData.hobbies} onChange={(e) => setFormData({...formData, hobbies: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea rows={4} className="input w-full resize-none" placeholder="Tell members about yourself..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                <input type="url" className="input w-full" placeholder="https://linkedin.com/in/yourname" value={formData.linkedInUrl} onChange={(e) => setFormData({...formData, linkedInUrl: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Twitter Handle</label>
                <input type="text" className="input w-full" placeholder="@yourhandle" value={formData.twitterHandle} onChange={(e) => setFormData({...formData, twitterHandle: e.target.value})} />
              </div>
            </div>
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
