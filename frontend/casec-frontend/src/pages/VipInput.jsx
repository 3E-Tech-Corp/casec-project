import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Crown, Check, X, Search, User, Phone, Hash } from "lucide-react";
import { seatingChartsAPI } from "../services/api";

export default function VipInput() {
  const { chartId } = useParams();
  const [loading, setLoading] = useState(true);
  const [chart, setChart] = useState(null);
  const [sections, setSections] = useState([]);
  const [seats, setSeats] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Form state
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedRow, setSelectedRow] = useState("");
  const [selectedSeatNum, setSelectedSeatNum] = useState("");
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  
  // Search/filter
  const [searchTerm, setSearchTerm] = useState("");

  // Load chart data
  useEffect(() => {
    loadChart();
  }, [chartId]);

  const loadChart = async () => {
    try {
      setLoading(true);
      const response = await seatingChartsAPI.getPublic(chartId);
      if (response.success) {
        setChart(response.data);
        setSections(response.data.sections || []);
        setSeats(response.data.seats || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load seating chart");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique rows for selected section
  const availableRows = useMemo(() => {
    if (!selectedSection) return [];
    const sectionSeats = seats.filter(s => s.sectionId === parseInt(selectedSection));
    return [...new Set(sectionSeats.map(s => s.rowLabel))].sort();
  }, [selectedSection, seats]);

  // Get seat numbers for selected section/row
  const availableSeatNums = useMemo(() => {
    if (!selectedSection || !selectedRow) return [];
    return seats
      .filter(s => s.sectionId === parseInt(selectedSection) && s.rowLabel === selectedRow && s.status !== 'NotExist')
      .map(s => s.seatNumber)
      .sort((a, b) => a - b);
  }, [selectedSection, selectedRow, seats]);

  // Find selected seat
  const selectedSeat = useMemo(() => {
    if (!selectedSection || !selectedRow || !selectedSeatNum) return null;
    return seats.find(s => 
      s.sectionId === parseInt(selectedSection) && 
      s.rowLabel === selectedRow && 
      s.seatNumber === parseInt(selectedSeatNum)
    );
  }, [selectedSection, selectedRow, selectedSeatNum, seats]);

  // VIP seats list
  const vipSeats = useMemo(() => {
    return seats
      .filter(s => s.isVIP)
      .map(s => {
        const section = sections.find(sec => sec.sectionId === s.sectionId);
        return { ...s, sectionName: section?.name || section?.shortName || 'Unknown' };
      })
      .sort((a, b) => {
        if (a.sectionName !== b.sectionName) return a.sectionName.localeCompare(b.sectionName);
        if (a.rowLabel !== b.rowLabel) return a.rowLabel.localeCompare(b.rowLabel);
        return a.seatNumber - b.seatNumber;
      });
  }, [seats, sections]);

  // Filtered VIP seats
  const filteredVipSeats = useMemo(() => {
    if (!searchTerm) return vipSeats;
    const term = searchTerm.toLowerCase();
    return vipSeats.filter(s => 
      s.attendeeName?.toLowerCase().includes(term) ||
      s.sectionName.toLowerCase().includes(term) ||
      s.rowLabel.toLowerCase().includes(term) ||
      String(s.seatNumber).includes(term)
    );
  }, [vipSeats, searchTerm]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeat) {
      setMessage({ type: 'error', text: 'Please select a seat' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await seatingChartsAPI.vipInput(chartId, {
        seatId: selectedSeat.seatId,
        isVIP: true,
        attendeeName: attendeeName || null,
        attendeePhone: attendeePhone || null,
        tableNumber: tableNumber ? parseInt(tableNumber) : null
      });

      if (response.success) {
        setMessage({ type: 'success', text: `VIP seat saved: ${sections.find(s => s.sectionId === selectedSeat.sectionId)?.name || ''} Row ${selectedRow} Seat ${selectedSeatNum}` });
        // Update local state
        setSeats(prev => prev.map(s => 
          s.seatId === selectedSeat.seatId 
            ? { ...s, isVIP: true, attendeeName: attendeeName || s.attendeeName, attendeePhone: attendeePhone || s.attendeePhone, tableNumber: tableNumber ? parseInt(tableNumber) : s.tableNumber }
            : s
        ));
        // Clear form for next entry
        setSelectedSeatNum("");
        setAttendeeName("");
        setAttendeePhone("");
        setTableNumber("");
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to save' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error saving VIP seat' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Remove VIP status
  const handleRemoveVip = async (seat) => {
    if (!confirm(`Remove VIP status from ${seat.sectionName} Row ${seat.rowLabel} Seat ${seat.seatNumber}?`)) return;
    
    try {
      const response = await seatingChartsAPI.vipInput(chartId, {
        seatId: seat.seatId,
        isVIP: false
      });

      if (response.success) {
        setSeats(prev => prev.map(s => 
          s.seatId === seat.seatId ? { ...s, isVIP: false } : s
        ));
        setMessage({ type: 'success', text: 'VIP status removed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error removing VIP status' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-xl mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">VIP Seat Input</h1>
          </div>
          <p className="text-purple-300">{chart?.name}</p>
          {chart?.eventName && <p className="text-gray-400 text-sm">{chart.eventName}</p>}
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
            'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Add VIP Seat
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Section */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    setSelectedRow("");
                    setSelectedSeatNum("");
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select section...</option>
                  {sections.map(s => (
                    <option key={s.sectionId} value={s.sectionId}>
                      {s.name || s.shortName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Row</label>
                <select
                  value={selectedRow}
                  onChange={(e) => {
                    setSelectedRow(e.target.value);
                    setSelectedSeatNum("");
                  }}
                  disabled={!selectedSection}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  <option value="">Select row...</option>
                  {availableRows.map(r => (
                    <option key={r} value={r}>Row {r}</option>
                  ))}
                </select>
              </div>

              {/* Seat Number */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Seat Number</label>
                <select
                  value={selectedSeatNum}
                  onChange={(e) => setSelectedSeatNum(e.target.value)}
                  disabled={!selectedRow}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  <option value="">Select seat...</option>
                  {availableSeatNums.map(n => {
                    const seat = seats.find(s => 
                      s.sectionId === parseInt(selectedSection) && 
                      s.rowLabel === selectedRow && 
                      s.seatNumber === n
                    );
                    return (
                      <option key={n} value={n}>
                        Seat {n} {seat?.isVIP ? '👑 VIP' : ''} {seat?.attendeeName ? `(${seat.attendeeName})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Attendee Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Attendee Name (optional)
                </label>
                <input
                  type="text"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="Enter name..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={attendeePhone}
                  onChange={(e) => setAttendeePhone(e.target.value)}
                  placeholder="Enter phone..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Table Number */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Table Number (optional)
                </label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Enter table #..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving || !selectedSeat}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 font-bold rounded-lg
                  hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    Mark as VIP
                  </>
                )}
              </button>
            </form>
          </div>

          {/* VIP List */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                👑 VIP Seats ({vipSeats.length})
              </span>
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search VIP seats..."
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredVipSeats.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No VIP seats yet</p>
              ) : (
                filteredVipSeats.map(seat => (
                  <div
                    key={seat.seatId}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-yellow-500/20"
                  >
                    <div>
                      <div className="text-white font-medium">
                        {seat.sectionName} • Row {seat.rowLabel} • Seat {seat.seatNumber}
                      </div>
                      {seat.attendeeName && (
                        <div className="text-sm text-yellow-400">{seat.attendeeName}</div>
                      )}
                      {seat.attendeePhone && (
                        <div className="text-xs text-gray-400">{seat.attendeePhone}</div>
                      )}
                      {seat.tableNumber && (
                        <div className="text-xs text-gray-400">Table #{seat.tableNumber}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveVip(seat)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Remove VIP status"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          CASEC 2026 Spring Gala • VIP Seat Management
        </div>
      </div>
    </div>
  );
}
