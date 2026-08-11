import React, { useState } from 'react';
import { X, MapPin, Clock, ThumbsUp, Printer, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, MessageSquare } from 'lucide-react';
import { getSLAMetrics } from '../utils/sla';
import { useAuth } from '../context/AuthContext';

export default function TicketDetailModal({ ticket, onClose, onUpvote, onOpenSticker, onUpdateStatus }) {
  const { role, currentUser } = useAuth();
  const [adminNotes, setAdminNotes] = useState(ticket?.adminNotes || '');
  const [updating, setUpdating] = useState(false);

  if (!ticket) return null;

  const sla = getSLAMetrics(ticket.createdAt, ticket.status);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await onUpdateStatus(ticket.id, newStatus, adminNotes);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-800 text-cyan-300 px-2 py-1 rounded border border-slate-700">
              {ticket.id}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
              ticket.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
              'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OVERDUE SLA RED ALERT BANNER */}
        {sla.isOverdue && (
          <div className="mt-4 bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-bold p-3 rounded-xl flex items-center justify-between sla-overdue-glow">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold">🚨 3-DAY SLA COMPLIANCE BREACH</p>
                <p className="text-[11px] text-rose-300 font-normal">
                  Ticket open for {sla.daysOpen} days without municipal resolution. High priority dispatch.
                </p>
              </div>
            </div>
            <span className="font-mono bg-rose-950 px-2 py-1 rounded text-[11px] border border-rose-500/40">
              OVERDUE
            </span>
          </div>
        )}

        {/* Ticket Title & Photo */}
        <div className="mt-4 space-y-3">
          <h2 className="text-xl font-bold text-white font-display leading-snug">
            {ticket.title}
          </h2>

          <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-64">
            <img
              src={ticket.photoUrl}
              alt={ticket.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{ticket.address}</span>
            </div>
          </div>
        </div>

        {/* Description & AI Vision Reasoning */}
        <div className="mt-4 space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</h4>
            <p className="text-sm text-slate-200 mt-1 leading-relaxed">{ticket.description}</p>
          </div>

          {/* AI Vision Analysis Card */}
          {ticket.aiSuggestedCategory && (
            <div className="bg-gradient-to-r from-slate-950 to-cyan-950/40 border border-cyan-500/30 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Claude AI Vision Triage Log</span>
              </div>
              <p className="text-xs text-slate-300 italic">
                "{ticket.aiAnalysisReasoning}"
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span>Category: <strong className="text-cyan-300">{ticket.aiSuggestedCategory}</strong></span>
                <span>•</span>
                <span>Severity: <strong className="text-cyan-300">{ticket.severity}</strong></span>
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Reporter</span>
              <span className="font-semibold text-slate-200">{ticket.userName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Time Open</span>
              <span className="font-semibold text-slate-200">{sla.timeAgoText}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Crowd Upvotes</span>
              <span className="font-semibold text-emerald-400">{ticket.upvotesCount} Confirmations</span>
            </div>
          </div>
        </div>

        {/* ADMIN DISPATCH CONTROLS (Only visible in City Admin Mode) */}
        {role === 'admin' && (
          <div className="mt-5 bg-rose-950/20 border border-rose-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-400" /> City Admin Dispatch Controls
              </span>
              <span className="text-[10px] text-slate-400">Updates trigger +150 bonus pts to reporter on resolution</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={updating}
                onClick={() => handleStatusChange('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  ticket.status === 'pending'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Mark Pending
              </button>

              <button
                disabled={updating}
                onClick={() => handleStatusChange('in_progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  ticket.status === 'in_progress'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Mark In Progress
              </button>

              <button
                disabled={updating}
                onClick={() => handleStatusChange('resolved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  ticket.status === 'resolved'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40'
                }`}
              >
                🎉 Mark Resolved (+150 Pts)
              </button>
            </div>

            <div>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add dispatch notes (e.g. Public Works Crew #4 assigned)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Modal Bottom Action Bar */}
        <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onUpvote(ticket.id)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition-all"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Confirm & Upvote ({ticket.upvotesCount})</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSticker(ticket)}
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-cyan-900/30 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Printable QR Sticker</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
