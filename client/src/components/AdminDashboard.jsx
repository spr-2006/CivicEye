import React, { useState } from 'react';
import { Shield, ShieldAlert, AlertTriangle, CheckCircle2, Clock, MapPin, Printer, ArrowRight, UserCheck, MessageSquare } from 'lucide-react';
import { getSLAMetrics } from '../utils/sla';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ tickets = [], onSelectTicket, onOpenSticker, onUpdateStatus }) {
  const { currentUser } = useAuth();
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const overdueTickets = tickets.filter(t => getSLAMetrics(t.createdAt, t.status).isOverdue);

  const filteredTickets = tickets.filter(t => {
    const sla = getSLAMetrics(t.createdAt, t.status);
    const matchesOverdue = !filterOverdue || sla.isOverdue;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesOverdue && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 rounded-3xl p-6 border border-rose-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </span>
              <h2 className="text-2xl font-bold font-display text-white">
                Municipal Dispatch Command Center
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Logged in as <strong className="text-rose-300">{currentUser.name} (City Officer)</strong>. Real-time SLA compliance tracking & dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOverdue(!filterOverdue)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                filterOverdue
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50 sla-overdue-glow'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 hover:bg-rose-900/80'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>🚨 Filter SLA Overdue ({overdueTickets.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-4 border border-rose-500/40 bg-rose-950/20">
          <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider">SLA Overdue (&gt;3 Days)</p>
          <h3 className="text-3xl font-extrabold font-display text-rose-400 mt-1">{overdueTickets.length}</h3>
          <p className="text-[11px] text-rose-300/80 mt-1">Requires immediate dispatch</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Action</p>
          <h3 className="text-3xl font-extrabold font-display text-white mt-1">
            {tickets.filter(t => t.status === 'pending').length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Unassigned citizen tickets</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">In Progress Repairs</p>
          <h3 className="text-3xl font-extrabold font-display text-white mt-1">
            {tickets.filter(t => t.status === 'in_progress').length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Work crews on site</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Resolved Issues</p>
          <h3 className="text-3xl font-extrabold font-display text-white mt-1">
            {tickets.filter(t => t.status === 'resolved').length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Completed repairs</p>
        </div>

      </div>

      {/* ADMIN TICKETS MANAGEMENT TABLE */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Priority Queue Dispatch</span>
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Status Filter:</span>
            {['All', 'pending', 'in_progress', 'resolved'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                  statusFilter === st
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Queue List */}
        <div className="space-y-3">
          {filteredTickets.map(ticket => {
            const sla = getSLAMetrics(ticket.createdAt, ticket.status);

            return (
              <div
                key={ticket.id}
                className={`p-4 rounded-xl border transition-all ${
                  sla.isOverdue
                    ? 'bg-rose-950/25 border-rose-500/60 shadow-lg sla-overdue-glow'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-3">
                    <img
                      src={ticket.photoUrl}
                      alt={ticket.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-950 text-cyan-300 px-2 py-0.5 rounded border border-slate-800">
                          {ticket.id}
                        </span>
                        {sla.isOverdue && (
                          <span className="bg-rose-500/20 text-rose-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-rose-500/40">
                            🚨 3-DAY SLA OVERDUE
                          </span>
                        )}
                        <span className="text-xs text-amber-400 font-semibold">
                          👍 {ticket.upvotesCount} Upvotes
                        </span>
                      </div>

                      <h4
                        onClick={() => onSelectTicket(ticket)}
                        className="font-bold text-sm text-white hover:text-cyan-300 cursor-pointer"
                      >
                        {ticket.title}
                      </h4>

                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {ticket.address}
                        </span>
                        <span>•</span>
                        <span>Opened: {sla.timeAgoText}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Change Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => onUpdateStatus(ticket.id, 'pending')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        ticket.status === 'pending'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Pending
                    </button>

                    <button
                      onClick={() => onUpdateStatus(ticket.id, 'in_progress')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        ticket.status === 'in_progress'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      In Progress
                    </button>

                    <button
                      onClick={() => onUpdateStatus(ticket.id, 'resolved')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40'
                      }`}
                    >
                      🎉 Mark Resolved (+150 Pts)
                    </button>

                    <button
                      onClick={() => onOpenSticker(ticket)}
                      className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700"
                      title="Print QR Sticker"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
