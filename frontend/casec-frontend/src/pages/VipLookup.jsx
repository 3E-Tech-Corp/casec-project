import React, { useState, useEffect, useCallback } from "react";
import { Search, User, MapPin, Phone, Ticket, Loader2, Star } from "lucide-react";
import api from "../services/api";

export default function VipLookup() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search
  const search = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/seatingcharts/vip-lookup?q=${encodeURIComponent(query)}`);
      if (response.success) {
        setResults(response.data || []);
      } else {
        setError(response.message || "Search failed");
        setResults([]);
      }
    } catch (err) {
      console.error("VIP lookup error:", err);
      setError("Failed to search. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      search(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-yellow-700">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20">🏮</div>
        <div className="absolute top-20 right-20 text-6xl opacity-20">🧧</div>
        <div className="absolute bottom-20 left-20 text-6xl opacity-20">🐴</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-20">✨</div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">
            VIP Ticket Lookup
          </h1>
          <p className="text-yellow-100/80">
            2026 Florida Chinese Spring Festival Gala
          </p>
          <p className="text-yellow-100/60 text-sm mt-1">
            Search by name or seat (e.g., "John" or "C-105")
          </p>
        </div>

        {/* Search Box */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-yellow-600" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter name or seat number..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 backdrop-blur-sm border-2 border-yellow-400 
              text-gray-800 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/50
              shadow-lg"
            autoFocus
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 ? (
          <div className="space-y-4">
            <div className="text-yellow-200 text-sm mb-2">
              Found {results.length} VIP seat{results.length !== 1 ? 's' : ''}
            </div>
            {results.map((seat) => (
              <div
                key={seat.seatId}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border-2 border-yellow-400/50
                  transform hover:scale-[1.02] transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* VIP Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl 
                      flex items-center justify-center shadow-lg">
                      <Star className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-xl font-bold text-gray-800 truncate">
                        {seat.attendeeName || "Guest"}
                      </span>
                    </div>

                    {/* Seat Location */}
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-lg text-gray-700">
                        <span className="font-semibold">{seat.section}</span>
                        {" · "}
                        <span className="text-red-600 font-bold">
                          Row {seat.row}, Seat {seat.seatNumber}
                        </span>
                      </span>
                    </div>

                    {/* Phone if available */}
                    {seat.attendeePhone && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{seat.attendeePhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Ticket Icon */}
                  <div className="flex-shrink-0">
                    <Ticket className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searched && searchQuery.length >= 2 && !loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-yellow-200 text-lg">No VIP seats found</div>
            <div className="text-yellow-100/60 text-sm mt-2">
              Try a different name or seat number
            </div>
          </div>
        ) : !searched ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎭</div>
            <div className="text-yellow-200 text-lg">
              Enter a name or seat to search
            </div>
            <div className="text-yellow-100/60 text-sm mt-2">
              Examples: "Chen", "Orchestra Center", "D-107"
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="text-center mt-12 text-yellow-100/50 text-sm">
          <p>一马当先 · 光耀世界</p>
          <p className="mt-1">Leading the Way · Shining Across the World</p>
        </div>
      </div>
    </div>
  );
}
