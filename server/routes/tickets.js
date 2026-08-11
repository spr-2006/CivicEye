const express = require('express');
const router = express.Router();
const db = require('../db');
const { analyzeInfrastructurePhoto } = require('../services/aiVisionService');

// Get all tickets
router.get('/tickets', (req, res) => {
  try {
    const tickets = db.getTickets();
    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single ticket
router.get('/tickets/:id', (req, res) => {
  try {
    const ticket = db.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create ticket
router.post('/tickets', (req, res) => {
  try {
    const { title, description, category, severity, lat, lng, address, photoUrl, aiSuggestedCategory, aiSuggestedSeverity, aiAnalysisReasoning, aiAccepted, userId, userName } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    const newTicket = db.createTicket({
      title,
      description,
      category,
      severity,
      lat,
      lng,
      address,
      photoUrl,
      aiSuggestedCategory,
      aiSuggestedSeverity,
      aiAnalysisReasoning,
      aiAccepted,
      userId,
      userName
    });

    res.status(201).json({ success: true, message: 'Report created successfully (+50 points awarded!)', ticket: newTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upvote / Crowd-Confirm duplicate ticket
router.post('/tickets/:id/upvote', (req, res) => {
  try {
    const { userId } = req.body;
    const updatedTicket = db.upvoteTicket(req.params.id, userId || 'usr_1');
    if (!updatedTicket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.json({ success: true, message: 'Ticket confirmed & upvoted (+10 points awarded!)', ticket: updatedTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update status (Admin)
router.patch('/tickets/:id/status', (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const updatedTicket = db.updateTicketStatus(req.params.id, status, adminNotes);
    if (!updatedTicket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.json({ success: true, message: `Ticket status updated to ${status}`, ticket: updatedTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1-Click Demo Seed
router.post('/tickets/seed', (req, res) => {
  try {
    const tickets = db.seedDemoData();
    res.json({ success: true, message: 'Demo data seeded with 5 realistic tickets including SLA Overdue alert!', tickets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Photo Triage Endpoint
router.post('/ai/triage', async (req, res) => {
  try {
    const { imageBase64, fileName } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Image base64 data required' });
    }

    const triageResult = await analyzeInfrastructurePhoto(imageBase64, fileName || 'upload.jpg');
    res.json({ success: true, triage: triageResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Users & Leaderboard
router.get('/users', (req, res) => {
  try {
    const users = db.getUsers();
    res.json({ success: true, users, activityLogs: db.data.activityLogs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
