import React from 'react';
import { Shield, Map, PlusCircle, Trophy, RefreshCw, UserCheck, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onSeedDemo, onOpenReportModal }) {
  const { role, toggleRole, currentUser, toastMessage } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & System Status */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-black text-xl shadow-lg shadow-cyan-900/30">
              <EyeIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  CivicEye
                </span>
                <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30 uppercase tracking-wider">
                  AI Municipal Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Infrastructure Photo Triage & SLA Tracking
              </p>
            </div>
          </div>

          {/* Center Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Live Map & Feed</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-900/30 transition-all transform hover:scale-[1.02]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            {role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Dispatch</span>
              </button>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* 1-Click Demo Seed Button */}
            <button
              onClick={onSeedDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold shadow-md transition-all"
              title="One-click demo seed loads 5 realistic sample tickets (overdue, upvotes, resolved) for judges"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="hidden sm:inline">⚡ Seed Demo Data</span>
              <span className="sm:hidden">Seed</span>
            </button>

            {/* User Points Chip */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-amber-400 font-bold">⭐ {currentUser.points}</span>
              <span className="text-slate-400 font-medium">pts</span>
            </div>

            {/* Dual Authentication Switcher Toggle */}
            <button
              onClick={toggleRole}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                role === 'admin'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 hover:bg-rose-900/80'
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900/80'
              }`}
              title="Click to toggle between Citizen Portal and City Admin Mode"
            >
              {role === 'admin' ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden lg:inline">Role: City Admin</span>
                  <span className="lg:hidden">Admin</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline">Role: Citizen</span>
                  <span className="lg:hidden">Citizen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-medium py-1.5 px-4 text-center shadow-lg animate-fadeIn flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
}

function EyeIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
