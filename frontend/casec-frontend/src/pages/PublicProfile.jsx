import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Linkedin, Twitter, Award, Calendar } from 'lucide-react';
import api from '../services/api';

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}/public-profile`);
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <button onClick={() => navigate(-1)} className="btn btn-primary mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-16">
        <div className="card">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0 text-center">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-48 h-48 rounded-2xl object-cover shadow-xl border-4 border-white"
                />
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-6xl font-bold shadow-xl border-4 border-white">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
              )}
              {profile.profession && (
                <p className="text-primary font-semibold text-lg mt-3">{profile.profession}</p>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.boardTitle && (
                  <div className="flex items-center space-x-2 text-accent text-xl font-bold mb-2">
                    <Award className="w-6 h-6" />
                    <span>{profile.boardTitle}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-gray-500 mt-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Social Links */}
              {(profile.linkedInUrl || profile.twitterHandle) && (
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Connect</h3>
                  <div className="flex space-x-4">
                    {profile.linkedInUrl && (
                      <a
                        href={profile.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {profile.twitterHandle && (
                      <a
                        href={`https://twitter.com/${profile.twitterHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                        <span>Twitter</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        {profile.boardTitle && (
          <div className="card mt-6 bg-gradient-to-br from-accent/10 to-accent/5">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Board Leadership
            </h3>
            <p className="text-gray-700">
              As {profile.boardTitle}, {profile.firstName} plays a vital role in guiding CASEC's
              mission to build stronger community connections and foster meaningful relationships
              among our members.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
