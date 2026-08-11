import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Flame, Shield, CheckCircle2, Activity, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardView() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setActivityLogs(data.activityLogs || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Trophy className="w-6 h-6" />
              </span>
              <h2 className="text-2xl font-bold font-display text-white">
                Civic Engagement Leaderboard
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Earn points for filing validated infrastructure reports (+50 pts), crowd-confirming duplicates (+10 pts), and bonus rewards when reported issues are fixed (+150 pts)!
            </p>
          </div>

          {/* Current User Rank Card */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-xl">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shrink-0"
            />
            <div>
              <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">Your Civic Rank</span>
              <h4 className="font-bold text-sm text-white">{currentUser.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-amber-400 font-extrabold text-sm">⭐ {currentUser.points} Pts</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {currentUser.points >= 500 ? 'City Hero' : currentUser.points >= 300 ? 'Neighborhood Guardian' : 'Pothole Patrol'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEADERBOARD TABLE */}
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Top Civic Champions</span>
            </h3>
            <span className="text-xs text-slate-400">Ranked by Community Impact</span>
          </div>

          <div className="space-y-2">
            {users.map((user, index) => {
              const rank = index + 1;
              let rankBadge = `${rank}`;
              let rankBg = 'bg-slate-800 text-slate-400';
              if (rank === 1) { rankBadge = '🥇'; rankBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/40'; }
              else if (rank === 2) { rankBadge = '🥈'; rankBg = 'bg-slate-300/20 text-slate-200 border border-slate-400/40'; }
              else if (rank === 3) { rankBadge = '🥉'; rankBg = 'bg-amber-800/30 text-amber-400 border border-amber-700/40'; }

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    user.id === currentUser.id
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${rankBg}`}>
                      {rankBadge}
                    </span>

                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                    />

                    <div>
                      <h4 className="font-bold text-xs text-white flex items-center gap-2">
                        <span>{user.name}</span>
                        {user.id === currentUser.id && (
                          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.2 rounded-full font-normal">
                            You
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {user.badges?.map(badge => (
                          <span key={badge} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-amber-400 font-extrabold text-sm">⭐ {user.points}</span>
                    <span className="block text-[10px] text-slate-400">{user.reportsFiled} reports filed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY LOG FEED */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Civic Activity Feed</span>
          </h3>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recent activity logged.</p>
            ) : (
              activityLogs.map(log => (
                <div key={log.id} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span className="font-semibold text-cyan-300">{log.userName}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{log.action}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
