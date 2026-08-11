import React from 'react';
import { AlertTriangle, ThumbsUp, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export default function DuplicateDetectorDrawer({ duplicateCandidate, onUpvoteExisting, onContinueAnyway }) {
  if (!duplicateCandidate) return null;

  const { ticket, distanceMeters } = duplicateCandidate;

  return (
    <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 my-4 animate-fadeIn backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-amber-200 text-sm flex items-center gap-1.5">
              <span>Potential Duplicate Detected</span>
              <span className="bg-amber-500/30 text-amber-300 text-xs px-2 py-0.5 rounded-full font-mono">
                {distanceMeters}m away
              </span>
            </h4>
          </div>
          <p className="text-xs text-amber-200/80 mt-1">
            An open ticket in category <strong className="text-amber-300">"{ticket.category}"</strong> already exists at this location. Confirming this ticket prioritizes city repair teams!
          </p>

          {/* Ticket preview card */}
          <div className="mt-3 bg-slate-900/80 border border-amber-500/30 rounded-lg p-3 flex items-center gap-3">
            <img
              src={ticket.photoUrl}
              alt={ticket.title}
              className="w-12 h-12 rounded-md object-cover border border-slate-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-xs text-slate-100 truncate">{ticket.title}</h5>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  {ticket.address}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">👍 {ticket.upvotesCount} Confirmations</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onUpvoteExisting(ticket.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs py-2 px-3 rounded-lg shadow-lg shadow-emerald-900/30 transition-all"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Confirm & Upvote This Ticket (+10 Pts)</span>
            </button>
            
            <button
              type="button"
              onClick={onContinueAnyway}
              className="text-xs text-slate-400 hover:text-slate-200 underline px-2 py-1"
            >
              File Separate New Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
