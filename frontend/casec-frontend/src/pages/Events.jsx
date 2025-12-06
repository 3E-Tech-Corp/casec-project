import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Users, ExternalLink, Sparkles, Megaphone, Handshake, Eye } from 'lucide-react';
import { eventsAPI } from '../services/api';

export default function EnhancedEvents() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [selectedType, selectedCategory, events]);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      if (response.success) {
        setEvents(response.data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await eventsAPI.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (selectedType !== 'all') {
      filtered = filtered.filter(e => e.eventType === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.eventCategory === selectedCategory);
    }

    setFilteredEvents(filtered);
  };

  const handleRegister = async (eventId, eventType, registrationUrl) => {
    // If it's a partner event with external registration
    if (eventType === 'PartnerEvent' && registrationUrl) {
      window.open(registrationUrl, '_blank');
      return;
    }

    // If it's an announcement, just show info
    if (eventType === 'Announcement') {
      alert('This is an announcement. No registration required.');
      return;
    }

    // Regular CASEC event registration
    try {
      const response = await eventsAPI.register(eventId, { numberOfGuests: 0 });
      if (response.success) {
        alert('Successfully registered!');
        loadEvents();
      }
    } catch (err) {
      alert('Registration failed: ' + (err.message || 'Please try again'));
    }
  };

  const getEventTypeInfo = (type) => {
    const types = {
      'CasecEvent': { icon: '🎉', color: 'bg-primary', textColor: 'text-primary', label: 'CASEC Event' },
      'PartnerEvent': { icon: '🤝', color: 'bg-blue-600', textColor: 'text-blue-600', label: 'Partner Event' },
      'Announcement': { icon: '📢', color: 'bg-amber-600', textColor: 'text-amber-600', label: 'Announcement' }
    };
    return types[type] || types['CasecEvent'];
  };

  if (loading) return <div className="text-center py-12">Loading events...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Community Events</h1>
        <p className="text-gray-600 text-lg">Discover CASEC events, partner opportunities, and community announcements</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Types</option>
              <option value="CasecEvent">🎉 CASEC Events</option>
              <option value="PartnerEvent">🤝 Partner Events</option>
              <option value="Announcement">📢 Announcements</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedType !== 'all' || selectedCategory !== 'all') && (
          <div className="mt-4 pt-4 border-t flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedType !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {getEventTypeInfo(selectedType).label}
                <button onClick={() => setSelectedType('all')} className="ml-2">×</button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="ml-2">×</button>
              </span>
            )}
            <button
              onClick={() => { setSelectedType('all'); setSelectedCategory('all'); }}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const eventDate = new Date(event.eventDate);
          const typeInfo = getEventTypeInfo(event.eventType);

          return (
            <div
              key={event.eventId}
              className={`card ${event.isFeatured ? 'ring-4 ring-accent shadow-2xl' : ''} border-l-4 ${typeInfo.color}`}
            >
              {/* Featured Badge */}
              {event.isFeatured && (
                <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Featured</span>
                </div>
              )}

              {/* Event Type Badge */}
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-bold mb-4 ${typeInfo.color} text-white`}>
                <span>{typeInfo.icon}</span>
                <span>{typeInfo.label}</span>
              </div>

              {/* Header with Date */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  {event.eventCategory && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                      {event.eventCategory}
                    </span>
                  )}
                  <p className="text-gray-600 text-sm mt-2">{event.description}</p>
                </div>
                <div className="text-center bg-primary text-white rounded-lg p-3 ml-4 flex-shrink-0">
                  <div className="text-2xl font-bold">{eventDate.getDate()}</div>
                  <div className="text-xs">{eventDate.toLocaleDateString('default', { month: 'short' })}</div>
                </div>
              </div>

              {/* Partner Info */}
              {event.partnerName && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <Handshake className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">Partner Event</span>
                  </div>
                  <p className="text-sm text-blue-800">Hosted by {event.partnerName}</p>
                  {event.partnerWebsite && (
                    <a
                      href={event.partnerWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center space-x-1 mt-1"
                    >
                      <span>Visit website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Event Details */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {event.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{eventDate.toLocaleString()}</span>
                </div>
                {event.isRegistrationRequired && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{event.spotsRemaining} spots remaining</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  {event.eventType !== 'Announcement' && (
                    <div className="text-2xl font-bold text-accent flex items-center">
                      <DollarSign className="w-5 h-5" />
                      {event.eventFee}
                    </div>
                  )}
                  <Link
                    to={`/events/${event.eventId}`}
                    className="text-primary hover:text-primary-dark flex items-center space-x-1 text-sm font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Link>
                </div>

                {/* Different buttons based on event type */}
                {event.eventType === 'Announcement' ? (
                  <div className="flex items-center space-x-2 text-amber-600">
                    <Megaphone className="w-5 h-5" />
                    <span className="font-semibold">Information Only</span>
                  </div>
                ) : event.eventType === 'PartnerEvent' && event.registrationUrl ? (
                  <button
                    onClick={() => handleRegister(event.eventId, event.eventType, event.registrationUrl)}
                    className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <span>Register on Partner Site</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ) : event.isRegistrationRequired ? (
                  <button
                    onClick={() => handleRegister(event.eventId, event.eventType)}
                    disabled={event.isUserRegistered || event.spotsRemaining === 0}
                    className={`btn ${event.isUserRegistered ? 'btn-secondary' : 'btn-accent'}`}
                  >
                    {event.isUserRegistered ? '✓ Registered' : event.spotsRemaining === 0 ? 'Full' : 'Register'}
                  </button>
                ) : (
                  <span className="text-green-600 font-semibold">No Registration Required</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-20">
          <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-600 mb-2">No Events Found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later for new events.</p>
        </div>
      )}
    </div>
  );
}
