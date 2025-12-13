import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ChevronLeft, ChevronRight, Users, Sparkles } from 'lucide-react';
import { eventsAPI, getAssetUrl } from '../services/api';
import { useTheme } from '../components/ThemeProvider';

export default function Home() {
  const { theme } = useTheme();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredEvents.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredEvents.length, isPaused]);

  const fetchFeaturedEvents = async () => {
    try {
      const response = await eventsAPI.getAll({ featured: true, upcoming: true });
      const events = (response.data || []).slice(0, 10);
      setFeaturedEvents(events);
    } catch (error) {
      console.error('Error fetching featured events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-accent">
      {/* Header with Logo and CTA Buttons */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {theme?.logoUrl ? (
              <img
                src={getAssetUrl(theme.logoUrl)}
                alt={theme.organizationName || 'Logo'}
                className="h-16 w-auto object-contain"
              />
            ) : null}
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white">
              {theme?.organizationName || 'CASEC'}<span className="text-accent-light">.</span>
            </h1>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 text-white font-semibold hover:bg-white/10 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-white text-primary font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors shadow-lg"
            >
              Join Us
            </Link>
          </div>
        </div>
      </header>

      {/* Inspiring Hero Section */}
      <section className="px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/90 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Building Bridges, Creating Community
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-6 leading-tight">
            Where Culture Meets
            <span className="block text-accent-light">Community</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join a vibrant community celebrating heritage, fostering connections,
            and creating lasting memories together. Your journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary font-bold text-lg rounded-xl hover:bg-accent hover:text-white transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Become a Member
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-white/50 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      {!loading && featuredEvents.length > 0 && (
        <section className="px-6 py-12 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                Upcoming Featured Events
              </h3>
              <p className="text-white/70">Don't miss out on these exciting community gatherings</p>
            </div>

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Main Carousel */}
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {featuredEvents.map((event, index) => (
                    <div
                      key={event.eventId}
                      className="w-full flex-shrink-0"
                    >
                      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="md:flex">
                          {/* Event Image */}
                          <div className="md:w-1/2 h-64 md:h-80 relative bg-gradient-to-br from-primary/20 to-accent/20">
                            {event.thumbnailUrl ? (
                              <img
                                src={event.thumbnailUrl.startsWith('/api') ? getAssetUrl(event.thumbnailUrl) : event.thumbnailUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Calendar className="w-20 h-20 text-primary/30" />
                              </div>
                            )}
                            {/* Event Type Badge */}
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                                Featured
                              </span>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                            <h4 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">
                              {event.title}
                            </h4>

                            {event.description && (
                              <p className="text-gray-600 mb-6 line-clamp-3">
                                {event.description}
                              </p>
                            )}

                            <div className="space-y-3 mb-6">
                              <div className="flex items-center gap-3 text-gray-700">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span>{formatDate(event.eventDate)}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-3 text-gray-700">
                                  <MapPin className="w-5 h-5 text-primary" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              {event.maxCapacity > 0 && (
                                <div className="flex items-center gap-3 text-gray-700">
                                  <Users className="w-5 h-5 text-primary" />
                                  <span>{event.spotsRemaining || event.maxCapacity} spots available</span>
                                </div>
                              )}
                            </div>

                            <Link
                              to="/login"
                              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors"
                            >
                              Login to Register
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {featuredEvents.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Previous event"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Next event"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {featuredEvents.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  {featuredEvents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentIndex
                          ? 'bg-white w-8'
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <section className="px-6 py-12 bg-black/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-96 mx-auto"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* No Events State */}
      {!loading && featuredEvents.length === 0 && (
        <section className="px-6 py-12 bg-black/20">
          <div className="max-w-6xl mx-auto text-center">
            <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Events Coming Soon</h3>
            <p className="text-white/70">Stay tuned for exciting upcoming events!</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 py-8 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} {theme?.organizationName || 'CASEC'}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
