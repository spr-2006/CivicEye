import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, ThumbsUp, AlertTriangle, Printer, Clock, Sparkles, Filter, Search, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { getSLAMetrics } from '../utils/sla';
import { useAuth } from '../context/AuthContext';

// Helper to create custom Leaflet marker icons with dynamic color & SLA overdue pulse
const createCustomIcon = (ticket) => {
  const sla = getSLAMetrics(ticket.createdAt, ticket.status);
  let colorClass = 'pending';
  if (sla.isOverdue) colorClass = 'overdue';
  else if (ticket.status === 'in_progress') colorClass = 'in_progress';
  else if (ticket.status === 'resolved') colorClass = 'resolved';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="map-pin ${colorClass}">${sla.isOverdue ? '🚨' : ticket.upvotesCount}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export default function LiveMapFeed({ tickets = [], onSelectTicket, onOpenSticker, onUpvoteTicket, onOpenReportModal }) {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Categories list
  const categories = ['All', 'Pothole', 'Water Leak / Pipe', 'Pathway Crack', 'Broken Streetlight', 'Fallen Branch / Vegetation'];

  // Filtered tickets logic
  const filteredTickets = tickets.filter(ticket => {
    const sla = getSLAMetrics(ticket.createdAt, ticket.status);
    const matchesCategory = selectedCategory === 'All' || ticket.category === selectedCategory;
    const matchesOverdue = !showOverdueOnly || sla.isOverdue;
    const matchesSearch = searchQuery === '' || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesOverdue && matchesSearch;
  });

  const overdueCount = tickets.filter(t => getSLAMetrics(t.createdAt, t.status).isOverdue).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Active Reports */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Active Reports</p>
            <h3 className="text-2xl font-bold font-display text-white mt-0.5">{tickets.length}</h3>
            <p className="text-[11px] text-cyan-400 mt-1">Crowd-verified issues</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
            📍
          </div>
        </div>

        {/* SLA Overdue Red Alert Box */}
        <div className={`glass-panel rounded-2xl p-4 border transition-all ${
          overdueCount > 0 ? 'border-rose-500/50 bg-rose-950/20 sla-overdue-glow' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span>SLA Overdue Flag</span>
                <span className="text-[10px] bg-rose-500/30 text-rose-200 px-1.5 py-0.2 rounded font-mono">&gt;3 Days</span>
              </p>
              <h3 className="text-2xl font-bold font-display text-rose-400 mt-0.5">{overdueCount}</h3>
              <p className="text-[11px] text-rose-300/80 mt-1">Require urgent city response</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg">
              🚨
            </div>
          </div>
        </div>

        {/* AI Vision Analyzed Count */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI Photo Triage</p>
            <h3 className="text-2xl font-bold font-display text-white mt-0.5">100%</h3>
            <p className="text-[11px] text-emerald-400 mt-1">Auto-categorized by Gemini</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            ✨
          </div>
        </div>

        {/* Crowd Confirmations */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Upvotes & Signals</p>
            <h3 className="text-2xl font-bold font-display text-white mt-0.5">
              {tickets.reduce((sum, t) => sum + t.upvotesCount, 0)}
            </h3>
            <p className="text-[11px] text-amber-400 mt-1">Duplicate crowd upvotes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            👍
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Overdue Checkbox & Search */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-rose-300 bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-500/30">
            <input
              type="checkbox"
              checked={showOverdueOnly}
              onChange={(e) => setShowOverdueOnly(e.target.checked)}
              className="rounded accent-rose-500"
            />
            <span>🚨 SLA Overdue Only (&gt;3 Days)</span>
          </label>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues, address..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>
        </div>

      </div>

      {/* SPLIT VIEW: INTERACTIVE MAP + TICKET CARDS FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE LEAFLET MAP */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-2 shadow-2xl h-[550px] relative overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" /> Live Interactive GIS Map
            </span>
            <span className="text-[11px] text-slate-500">
              Pins show 150m Proximity radius & SLA status
            </span>
          </div>

          <div className="flex-1 w-full rounded-xl overflow-hidden mt-2 relative">
            <MapContainer
              center={[37.7749, -122.4194]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />

              {filteredTickets.map(ticket => (
                <React.Fragment key={ticket.id}>
                  {/* 150m Duplicate Detection Coverage Circle */}
                  <Circle
                    center={[ticket.lat, ticket.lng]}
                    radius={150}
                    pathOptions={{
                      color: ticket.status === 'resolved' ? '#10b981' : '#0284c7',
                      fillColor: ticket.status === 'resolved' ? '#10b981' : '#0284c7',
                      fillOpacity: 0.1,
                      weight: 1
                    }}
                  />

                  {/* Marker Pin */}
                  <Marker
                    position={[ticket.lat, ticket.lng]}
                    icon={createCustomIcon(ticket)}
                    eventHandlers={{
                      click: () => onSelectTicket(ticket)
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1 max-w-xs text-slate-900 font-sans">
                        <span className="font-mono text-[10px] font-bold bg-slate-200 px-1 rounded">
                          {ticket.id}
                        </span>
                        <h4 className="font-bold text-xs mt-1">{ticket.title}</h4>
                        <p className="text-[11px] text-slate-600 truncate">{ticket.address}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-cyan-700">👍 {ticket.upvotesCount} Upvotes</span>
                          <button
                            onClick={() => onSelectTicket(ticket)}
                            className="bg-slate-900 text-white text-[10px] font-medium px-2 py-0.5 rounded"
                          >
                            Details & QR
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: TICKETS FEED LIST */}
        <div className="lg:col-span-5 space-y-3 h-[550px] overflow-y-auto pr-1">
          {filteredTickets.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
              <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-medium">No tickets match current filter</p>
              <button
                onClick={() => { setSelectedCategory('All'); setShowOverdueOnly(false); setSearchQuery(''); }}
                className="text-xs text-cyan-400 hover:underline mt-2 inline-block"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredTickets.map(ticket => {
              const sla = getSLAMetrics(ticket.createdAt, ticket.status);
              
              return (
                <div
                  key={ticket.id}
                  className={`glass-card rounded-2xl p-4 border transition-all ${
                    sla.isOverdue ? 'border-rose-500/60 bg-rose-950/20' : 'border-slate-800'
                  }`}
                >
                  
                  {/* OVERDUE SLA BADGE HEADER (If > 3 Days Old) */}
                  {sla.isOverdue && (
                    <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold px-3 py-1 rounded-xl mb-3 flex items-center justify-between sla-overdue-glow">
                      <span className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        🚨 3-DAY SLA OVERDUE FLAG
                      </span>
                      <span className="font-mono text-[11px]">{sla.daysOpen} days open</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <img
                      src={ticket.photoUrl}
                      alt={ticket.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0 cursor-pointer"
                      onClick={() => onSelectTicket(ticket)}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {ticket.id}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          ticket.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4
                        onClick={() => onSelectTicket(ticket)}
                        className="font-bold text-sm text-slate-100 hover:text-cyan-300 cursor-pointer mt-1 truncate"
                      >
                        {ticket.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {ticket.description}
                      </p>

                      {/* AI Triage Reasoning Tag */}
                      {ticket.aiSuggestedCategory && (
                        <div className="mt-2 text-[11px] text-cyan-300/90 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/20 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">AI Triage: <strong>{ticket.aiSuggestedCategory}</strong> ({ticket.severity} Severity)</span>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpvoteTicket(ticket.id)}
                            className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-all text-[11px] font-semibold"
                            title="Confirm this ticket to prioritize city repair (+10 pts)"
                          >
                            <ThumbsUp className="w-3 h-3 text-emerald-400" />
                            <span>{ticket.upvotesCount}</span>
                          </button>

                          <button
                            onClick={() => onOpenSticker(ticket)}
                            className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-800 text-[11px]"
                            title="Generate printable physical QR sticker for this ticket"
                          >
                            <Printer className="w-3 h-3" />
                            <span className="hidden sm:inline">QR Sticker</span>
                          </button>
                        </div>

                        <button
                          onClick={() => onSelectTicket(ticket)}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium text-[11px]"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
