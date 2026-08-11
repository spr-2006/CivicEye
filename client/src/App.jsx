import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LiveMapFeed from './components/LiveMapFeed';
import ReportIssueModal from './components/ReportIssueModal';
import TicketDetailModal from './components/TicketDetailModal';
import PrintableQRSticker from './components/PrintableQRSticker';
import LeaderboardView from './components/LeaderboardView';
import AdminDashboard from './components/AdminDashboard';

function MainAppContent() {
  const { role, showNotification, addPoints } = useAuth();
  
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'leaderboard' | 'admin'
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [stickerTicket, setStickerTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tickets/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
        showNotification('⚡ Demo Seeded! 5 sample tickets loaded (including SLA Overdue alert & 42 upvotes)', true);
      }
    } catch (err) {
      console.error('Error seeding demo data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvoteTicket = async (ticketId) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_1' })
      });
      const data = await res.json();
      if (data.success) {
        fetchTickets();
        addPoints(10, 'Confirmed & upvoted ticket');
      }
    } catch (err) {
      console.error('Error upvoting ticket:', err);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus, adminNotes) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNotes })
      });
      const data = await res.json();
      if (data.success) {
        fetchTickets();
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(data.ticket);
        }
        if (newStatus === 'resolved') {
          showNotification(`🎉 Ticket ${ticketId} RESOLVED! Reporter awarded +150 bonus points!`, true);
        } else {
          showNotification(`Updated ticket ${ticketId} status to ${newStatus}`);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSeedDemo={handleSeedDemo}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-medium">Connecting to CivicEye Municipal Network...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'map' && (
              <LiveMapFeed
                tickets={tickets}
                onSelectTicket={(t) => setSelectedTicket(t)}
                onOpenSticker={(t) => setStickerTicket(t)}
                onUpvoteTicket={handleUpvoteTicket}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardView />
            )}

            {activeTab === 'admin' && role === 'admin' && (
              <AdminDashboard
                tickets={tickets}
                onSelectTicket={(t) => setSelectedTicket(t)}
                onOpenSticker={(t) => setStickerTicket(t)}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </>
        )}
      </main>

      {/* REPORT ISSUE MODAL */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        existingTickets={tickets}
        onSubmitSuccess={fetchTickets}
      />

      {/* TICKET DETAIL MODAL */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpvote={handleUpvoteTicket}
          onOpenSticker={(t) => { setSelectedTicket(null); setStickerTicket(t); }}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* PRINTABLE QR STICKER MODAL */}
      {stickerTicket && (
        <PrintableQRSticker
          ticket={stickerTicket}
          onClose={() => setStickerTicket(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CivicEye Municipal System. Powered by AI Vision Triage & Spatial Proximity.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Real Vision AI Triage</span>
            <span>•</span>
            <span>150m Proximity Shield</span>
            <span>•</span>
            <span>3-Day SLA Enforcement</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
