import React, { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, Camera, CheckCircle2, AlertTriangle, Upload, ThumbsUp, HelpCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import VoiceRecorderButton from './VoiceRecorderButton';
import DuplicateDetectorDrawer from './DuplicateDetectorDrawer';
import { SAMPLE_DAMAGE_PHOTOS } from '../data/sampleImages';
import { calculateHaversineDistance } from '../utils/haversine';
import { useAuth } from '../context/AuthContext';

// Custom Leaflet Pin Marker
const pickerIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="map-pin pending" style="background:#0284c7; width:28px; height:28px; font-size:12px;">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

function MapLocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={pickerIcon} /> : null;
}

export default function ReportIssueModal({ isOpen, onClose, existingTickets = [], onSubmitSuccess }) {
  const { currentUser, addPoints, showNotification } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pothole');
  const [severity, setSeverity] = useState('High');
  const [location, setLocation] = useState([37.7749, -122.4194]);
  const [address, setAddress] = useState('4th Ave & Elm St, Downtown');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');

  // AI Triage State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiAccepted, setAiAccepted] = useState(false);

  // Proximity Duplicate Detection State
  const [duplicateCandidate, setDuplicateCandidate] = useState(null);

  // Check 150m Proximity Duplicate when location or category changes
  useEffect(() => {
    if (!existingTickets || existingTickets.length === 0) return;

    let closest = null;
    let minDistance = Infinity;

    existingTickets.forEach(ticket => {
      // Check open tickets in same category
      if (ticket.status !== 'resolved' && ticket.status !== 'rejected') {
        const dist = calculateHaversineDistance(location[0], location[1], ticket.lat, ticket.lng);
        if (dist <= 150 && dist < minDistance) {
          minDistance = dist;
          closest = { ticket, distanceMeters: dist };
        }
      }
    });

    setDuplicateCandidate(closest);
  }, [location, category, existingTickets]);

  const handlePhotoSelect = async (url, presetInfo = null) => {
    setPhotoUrl(url);
    setAiResult(null);
    setAiAccepted(false);

    // Call Backend AI Photo Triage API
    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: url,
          fileName: presetInfo ? presetInfo.name : 'damage_photo.jpg'
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.triage);
      }
    } catch (err) {
      console.warn('AI triage API error:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result;
        setPhotoUrl(b64);
        setPhotoBase64(b64);
        handlePhotoSelect(b64, { name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const acceptAiSuggestion = () => {
    if (aiResult) {
      setCategory(aiResult.category);
      setSeverity(aiResult.severity);
      if (!title) {
        setTitle(`${aiResult.category} Damage Report`);
      }
      if (!description) {
        setDescription(aiResult.description);
      }
      setAiAccepted(true);
      showNotification(`✨ Accepted AI Suggestion: ${aiResult.category} (${aiResult.severity} Severity)`);
    }
  };

  const handleUpvoteExisting = async (ticketId) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (data.success) {
        addPoints(10, 'Confirmed existing duplicate ticket');
        onSubmitSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error upvoting duplicate ticket:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          severity,
          lat: location[0],
          lng: location[1],
          address,
          photoUrl: photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
          aiSuggestedCategory: aiResult ? aiResult.category : category,
          aiSuggestedSeverity: aiResult ? aiResult.severity : severity,
          aiAnalysisReasoning: aiResult ? aiResult.reasoning : 'Citizen reported issue.',
          aiAccepted,
          userId: currentUser.id,
          userName: currentUser.name
        })
      });

      const data = await res.json();
      if (data.success) {
        addPoints(50, 'Filed new infrastructure report');
        onSubmitSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
              <span>Report Infrastructure Damage</span>
              <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30">
                +50 Pts
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Attach photo for instant AI triage, dictate speech complaint, and tag exact coordinates.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* STEP 1: PHOTO ATTACHMENT & AI VISION TRIAGE */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Attach Damage Photo (AI Vision Auto-Triage)
            </label>

            {/* Quick Sample Presets */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] text-slate-400">Quick Test Photos:</span>
              {SAMPLE_DAMAGE_PHOTOS.map(sample => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handlePhotoSelect(sample.url, sample)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Camera className="w-3 h-3" />
                  <span>{sample.name}</span>
                </button>
              ))}
            </div>

            {/* File Upload Zone */}
            <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-4 text-center bg-slate-950/50 transition-all">
              {photoUrl ? (
                <div className="flex items-center gap-4">
                  <img
                    src={photoUrl}
                    alt="Selected damage"
                    className="w-24 h-24 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Photo Attached
                    </p>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs text-rose-400 hover:underline mt-1"
                    >
                      Remove photo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                  <span className="text-xs font-medium text-slate-200">
                    Click to upload photo or drag & drop file
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Supports JPG, PNG, WEBP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* AI Photo Triage Analysis Card */}
            {aiAnalyzing && (
              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-xs font-medium text-cyan-300">
                  Claude AI Vision inspecting image... Auto-detecting damage category & severity...
                </span>
              </div>
            )}

            {aiResult && !aiAnalyzing && (
              <div className="bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-500/40 rounded-xl p-4 shadow-lg animate-fadeIn">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">AI Photo Triage Suggestion:</span>
                        <span className="bg-cyan-500/20 text-cyan-300 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                          {aiResult.category} • {aiResult.severity} Severity
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 italic">
                        "{aiResult.reasoning}"
                      </p>
                    </div>
                  </div>

                  {!aiAccepted ? (
                    <button
                      type="button"
                      onClick={acceptAiSuggestion}
                      className="shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-md transition-all flex items-center gap-1"
                    >
                      <span>1-Tap Accept</span>
                    </button>
                  ) : (
                    <span className="shrink-0 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-lg border border-emerald-500/40 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: DUPLICATE PROXIMITY DETECTION DRAWER (If within 150m) */}
          <DuplicateDetectorDrawer
            duplicateCandidate={duplicateCandidate}
            onUpvoteExisting={handleUpvoteExisting}
            onContinueAnyway={() => setDuplicateCandidate(null)}
          />

          {/* STEP 3: TITLE & DESCRIPTION WITH VOICE DICTATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Pothole">Pothole</option>
                <option value="Water Leak / Pipe">Water Leak / Pipe</option>
                <option value="Pathway Crack">Pathway Crack</option>
                <option value="Broken Streetlight">Broken Streetlight</option>
                <option value="Fallen Branch / Vegetation">Fallen Branch / Vegetation</option>
                <option value="Damaged Signage">Damaged Signage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Low">Low (Cosmetic / Minor)</option>
                <option value="Medium">Medium (Moderate Hazard)</option>
                <option value="High">High (High Vehicle/Safety Risk)</option>
                <option value="Critical">Critical (Emergency / Active Flooding)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Title / Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Asphalt Cavity on 4th Ave"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Detailed Complaint Description
              </label>
              {/* Speech-to-Text Microphone Dictation Button */}
              <VoiceRecorderButton
                onTranscriptChange={(newText) => setDescription(newText)}
                existingText={description}
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the issue size, hazard level, or click the dictation mic above..."
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* STEP 4: INTERACTIVE LOCATION MAP PICKER */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select Location (Click Map to Drop Pin)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                GPS: {location[0].toFixed(4)}, {location[1].toFixed(4)}
              </span>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address or landmark..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 mb-2 focus:outline-none"
            />
            <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-700 relative">
              <MapContainer
                center={location}
                zoom={14}
                scrollWheelZoom={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <MapLocationPicker position={location} setPosition={setLocation} />
              </MapContainer>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-900/40 transition-all flex items-center gap-1.5"
            >
              <span>Submit Report (+50 Pts)</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
