import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, MapPin, ShieldCheck, AlertCircle, X } from 'lucide-react';

export default function PrintableQRSticker({ ticket, onClose }) {
  if (!ticket) return null;

  const ticketUrl = `${window.location.origin}/ticket/${ticket.id}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Printer className="w-4 h-4" />
            <span>Printable Physical QR Sticker</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE STICKER CONTENT CONTAINER */}
        <div
          id="printable-sticker-root"
          className="bg-white text-slate-900 rounded-xl p-6 border-4 border-slate-900 shadow-xl font-sans"
        >
          {/* Municipal Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 text-white p-2 rounded-lg font-bold text-xs tracking-wider">
                CIVIC EYE
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-tight text-slate-900">
                  MUNICIPAL REPAIR TRACKER
                </h3>
                <p className="text-[10px] text-slate-600 font-medium">Public Infrastructure Safety Notice</p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-slate-900 text-white text-[11px] font-mono px-2 py-1 rounded font-bold">
                {ticket.id}
              </span>
            </div>
          </div>

          {/* QR Code + Category Section */}
          <div className="flex items-center gap-4 my-4">
            <div className="p-2 bg-slate-50 border-2 border-slate-900 rounded-lg shrink-0">
              <QRCodeSVG
                value={ticketUrl}
                size={120}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="inline-block bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold px-2 py-0.5 rounded uppercase">
                {ticket.category}
              </div>
              <h4 className="font-bold text-sm text-slate-900 leading-tight">
                {ticket.title}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                <MapPin className="w-3 h-3 text-slate-900" />
                <span className="truncate">{ticket.address}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                GPS: {ticket.lat?.toFixed(4)}, {ticket.lng?.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center my-3">
            <p className="text-xs font-bold text-slate-900">
              📱 SCAN WITH SMARTPHONE CAMERA
            </p>
            <p className="text-[11px] text-slate-700 mt-0.5">
              Scan QR code to check live repair status, view SLA progress, or upvote report priority.
            </p>
          </div>

          {/* Sticker Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-300 text-[10px] text-slate-500">
            <span>Official Civic Transparency Sticker</span>
            <span>Reported: {new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Bottom Actions (Hidden during print) */}
        <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-cyan-900/40 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ Print Physical Sticker</span>
          </button>
        </div>
      </div>
    </div>
  );
}
