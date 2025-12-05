import { useEffect, useState } from 'react';
import { Users, Calendar, Award, TrendingUp } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuthStore } from '../store/useStore';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await usersAPI.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
          Welcome Back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Here's what's happening in your CASEC community
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-primary to-primary-light text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-2">Your Membership</p>
              <h3 className="text-2xl font-bold mb-1">{dashboardData?.user?.membershipTypeName}</h3>
              <p className="text-white/80 text-sm">Active until Dec 2025</p>
            </div>
            <Award className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-2">Your Clubs</p>
              <h3 className="text-4xl font-bold text-primary mb-1">
                {dashboardData?.clubCount || 0}
              </h3>
              <p className="text-gray-500 text-sm">clubs joined</p>
            </div>
            <Users className="w-12 h-12 text-primary/20" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-2">Upcoming Events</p>
              <h3 className="text-4xl font-bold text-accent mb-1">
                {dashboardData?.eventCount || 0}
              </h3>
              <p className="text-gray-500 text-sm">events registered</p>
            </div>
            <Calendar className="w-12 h-12 text-accent/20" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-display font-bold text-gray-900">Recent Activity</h2>
        </div>

        {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.recentActivities.map((activity) => (
              <div
                key={activity.logId}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.activityType}</p>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No recent activity. Start by joining clubs or registering for events!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Explore Clubs</h3>
          <p className="text-gray-600 mb-4">
            Join clubs that match your interests and connect with like-minded members.
          </p>
          <a href="/clubs" className="btn btn-accent inline-block">
            Browse Clubs
          </a>
        </div>

        <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Upcoming Events</h3>
          <p className="text-gray-600 mb-4">
            Register for community events and activities happening soon.
          </p>
          <a href="/events" className="btn btn-primary inline-block">
            View Events
          </a>
        </div>
      </div>
    </div>
  );
}
