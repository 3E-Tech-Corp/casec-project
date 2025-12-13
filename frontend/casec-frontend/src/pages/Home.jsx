import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { eventsAPI, getAssetUrl } from '../services/api';
import { useTheme } from '../components/ThemeProvider';

export default function Home() {
  const { theme } = useTheme();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastFeaturedEvents, setPastFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const upcomingScrollRef = useRef(null);
  const pastScrollRef = useRef(null);
  const [upcomingPaused, setUpcomingPaused] = useState(false);
  const [pastPaused, setPastPaused] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-scroll for upcoming events
  useEffect(() => {
    if (upcomingEvents.length <= 3 || upcomingPaused) return;

    const container = upcomingScrollRef.current;
    if (!container) return;

    const scrollInterval = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 220, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, [upcomingEvents.length, upcomingPaused]);

  // Auto-scroll for past events
  useEffect(() => {
    if (pastFeaturedEvents.length <= 3 || pastPaused) return;

    const container = pastScrollRef.current;
    if (!container) return;

    const scrollInterval = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 220, behavior: 'smooth' });
      }
    }, 3500);

    return () => clearInterval(scrollInterval);
  }, [pastFeaturedEvents.length, pastPaused]);

  const fetchEvents = async () => {
    try {
      // Fetch upcoming events
      const upcomingResponse = await eventsAPI.getAll({ upcoming: true });
      const upcoming = (upcomingResponse.data || []).slice(0, 15);
      setUpcomingEvents(upcoming);

      // Fetch all events to filter past featured ones
      const allResponse = await eventsAPI.getAll({ upcoming: false });
      const now = new Date();
      const pastFeatured = (allResponse.data || [])
        .filter(e => e.isFeatured && new Date(e.eventDate) < now)
        .slice(0, 15);
      setPastFeaturedEvents(pastFeatured);
    } catch (error) {
      console.error('Error fetching events:', error);
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
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const scrollLeft = (ref) => {
    ref.current?.scrollBy({ left: -440, behavior: 'smooth' });
  };

  const scrollRight = (ref) => {
    ref.current?.scrollBy({ left: 440, behavior: 'smooth' });
  };

  const EventCard = ({ event, isPast = false }) => (
    <Link
      to={`/event/${event.eventId}`}
      className={`flex-shrink-0 w-52 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-[1.03] ${isPast ? 'opacity-90' : ''}`}
    >
      {/* Thumbnail */}
      <div className="h-28 relative bg-gradient-to-br from-primary/20 to-accent/20">
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
            <Calendar className="w-8 h-8 text-primary/30" />
          </div>
        )}
        {event.isFeatured && !isPast && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full">
            Featured
          </span>
        )}
        {isPast && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 bg-gray-800/80 text-white text-[10px] rounded">Past</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
          {event.title}
        </h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-primary" />
            <span>{formatDate(event.eventDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-primary" />
            <span>{formatTime(event.eventDate)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  const EventsCarousel = ({
    title,
    icon: Icon,
    events,
    isPast = false,
    scrollRef,
    onMouseEnter,
    onMouseLeave
  }) => (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-6 mb-4">
        <h3 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
          <Icon className="w-6 h-6" />
          {title}
        </h3>
      </div>

      {loading ? (
        <div className="flex gap-4 px-6 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-52 h-56 bg-white/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scrollLeft(scrollRef)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrolling Container */}
          <div
            ref={scrollRef}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="flex gap-4 px-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {events.map((event) => (
              <EventCard key={event.eventId} event={event} isPast={isPast} />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scrollRight(scrollRef)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Gradient Edges */}
          <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/10 rounded-xl p-8 text-center">
            <Icon className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/70">
              {isPast ? 'No past featured events' : 'No upcoming events scheduled'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-accent flex flex-col">
      {/* Hero Section - Logo, Name, and CTAs Centered */}
      <section className="px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Large Logo with Name */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center justify-center gap-4">
              {theme?.logoUrl ? (
                <img
                  src={getAssetUrl(theme.logoUrl)}
                  alt={theme.organizationName || 'Logo'}
                  className="h-32 md:h-48 w-auto object-contain"
                />
              ) : null}
              <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white">
                {theme?.organizationName || 'CASEC'}<span className="text-accent-light">.</span>
              </h1>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Link
              to="/login"
              className="px-8 py-3 text-white font-semibold text-lg border-2 border-white/50 rounded-xl hover:bg-white/10 transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-primary font-bold text-lg rounded-xl hover:bg-accent hover:text-white transition-all shadow-xl"
            >
              Join Us
            </Link>
          </div>

          {/* Inspirational Quote Block */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-white/20">
            <blockquote className="text-2xl md:text-3xl font-display font-bold text-white leading-relaxed mb-4">
              "{theme?.homeQuote || 'Building bridges across cultures, creating connections that last a lifetime.'}"
            </blockquote>
            <p className="text-white/80 text-lg">
              {theme?.homeQuoteSubtext || 'Join our vibrant community celebrating heritage, fostering friendships, and making memories together.'}
            </p>
          </div>
        </div>
      </section>

      {/* Events Section - Full Width Carousels */}
      <section className="py-12 bg-black/20 backdrop-blur-sm flex-1 space-y-10">
        {/* Upcoming Events Carousel */}
        <EventsCarousel
          title="Upcoming Events"
          icon={Calendar}
          events={upcomingEvents}
          scrollRef={upcomingScrollRef}
          onMouseEnter={() => setUpcomingPaused(true)}
          onMouseLeave={() => setUpcomingPaused(false)}
        />

        {/* Past Featured Events Carousel */}
        <EventsCarousel
          title="Past Featured Events"
          icon={Clock}
          events={pastFeaturedEvents}
          isPast
          scrollRef={pastScrollRef}
          onMouseEnter={() => setPastPaused(true)}
          onMouseLeave={() => setPastPaused(false)}
        />
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 bg-black/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} {theme?.organizationName || 'CASEC'}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
