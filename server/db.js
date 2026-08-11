const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

// Default initial seed data for immediate WOW demo presentation
const INITIAL_SEED_USERS = [
  {
    id: 'usr_1',
    name: 'Elena Rostova',
    email: 'elena@civic.org',
    role: 'citizen',
    points: 380,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    badges: ['First Responder', 'Pothole Patrol', 'Community Hero'],
    reportsFiled: 4,
    upvotesGiven: 12
  },
  {
    id: 'usr_2',
    name: 'Marcus Vance',
    email: 'marcus@civic.org',
    role: 'citizen',
    points: 240,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badges: ['Road Inspector', 'Active Citizen'],
    reportsFiled: 3,
    upvotesGiven: 8
  },
  {
    id: 'usr_3',
    name: 'Aisha Patel',
    email: 'aisha@civic.org',
    role: 'citizen',
    points: 190,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badges: ['Safety Spotter'],
    reportsFiled: 2,
    upvotesGiven: 5
  },
  {
    id: 'usr_admin',
    name: 'Mayor Technical Admin',
    email: 'admin@city.gov',
    role: 'admin',
    points: 1200,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    badges: ['Municipal Dispatcher', 'City Officer'],
    reportsFiled: 0,
    upvotesGiven: 0
  }
];

const getFourDaysAgo = () => new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
const getOneDayAgo = () => new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString();
const getHoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

const INITIAL_SEED_TICKETS = [
  {
    id: 'TCK-8091',
    title: 'Severe Asphalt Cavity & Base Collapse',
    description: 'Deep structural pothole on 4th Avenue near Elm Street intersection. Asphalt base is completely eroded causing severe vehicle impact and rim damage.',
    category: 'Pothole',
    severity: 'High',
    status: 'pending',
    lat: 37.7749,
    lng: -122.4194,
    address: '4th Ave & Elm St, Downtown',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    aiSuggestedCategory: 'Pothole',
    aiSuggestedSeverity: 'High',
    aiAnalysisReasoning: 'Claude AI Vision identified ~8 inch sub-base asphalt depression with exposed gravel layer and high risk to vehicular traffic.',
    aiAccepted: true,
    upvotesCount: 42,
    upvotedBy: ['usr_2', 'usr_3'],
    userId: 'usr_1',
    userName: 'Elena Rostova',
    createdAt: getFourDaysAgo(), // > 3 days -> OVERDUE SLA!
    updatedAt: getFourDaysAgo(),
    resolvedAt: null,
    adminNotes: 'Assigned to Public Works Road Crew #4 for priority patching.'
  },
  {
    id: 'TCK-8092',
    title: 'Exposed Main Water Line Pressure Leak',
    description: 'Pressurized water gushing from damaged curb conduit onto crosswalk. Water accumulation creating hydroplaning hazard.',
    category: 'Water Leak / Pipe',
    severity: 'Critical',
    status: 'in_progress',
    lat: 37.7780,
    lng: -122.4140,
    address: '890 Market Street (Near Metro Stop)',
    photoUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=800&auto=format&fit=crop&q=80',
    aiSuggestedCategory: 'Water Leak / Pipe',
    aiSuggestedSeverity: 'Critical',
    aiAnalysisReasoning: 'Claude AI Vision detected high-velocity surface water runoff originating from sub-grade municipal pipe fracture.',
    aiAccepted: true,
    upvotesCount: 28,
    upvotedBy: ['usr_1'],
    userId: 'usr_2',
    userName: 'Marcus Vance',
    createdAt: getHoursAgo(18),
    updatedAt: getHoursAgo(2),
    resolvedAt: null,
    adminNotes: 'Water Utility team dispatched. Main valve shutoff in progress.'
  },
  {
    id: 'TCK-8093',
    title: 'Pedestrian Pathway Concrete Heave',
    description: 'Tree roots elevated sidewalk slab by 4 inches creating severe trip hazard for elderly pedestrians outside community health center.',
    category: 'Pathway Crack',
    severity: 'Medium',
    status: 'resolved',
    lat: 37.7710,
    lng: -122.4240,
    address: '1420 Valencia Street',
    photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    aiSuggestedCategory: 'Pathway Crack',
    aiSuggestedSeverity: 'Medium',
    aiAnalysisReasoning: 'Claude AI Vision detected uneven concrete slab displacement greater than 3 inches posing tripping hazard.',
    aiAccepted: true,
    upvotesCount: 15,
    upvotedBy: ['usr_1', 'usr_3'],
    userId: 'usr_3',
    userName: 'Aisha Patel',
    createdAt: getFourDaysAgo(),
    updatedAt: getHoursAgo(12),
    resolvedAt: getHoursAgo(12),
    adminNotes: 'Grinding and ramp leveling completed by Sidewalk Safety Division.'
  },
  {
    id: 'TCK-8094',
    title: 'Fallen Oak Branch Blocking Bike Lane',
    description: 'Heavy storm damage snapped 10ft tree limb onto dedicated bike lane. Cyclists forced into active traffic lanes.',
    category: 'Fallen Branch / Vegetation',
    severity: 'Medium',
    status: 'pending',
    lat: 37.7765,
    lng: -122.4210,
    address: '550 Van Ness Ave',
    photoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
    aiSuggestedCategory: 'Fallen Branch / Vegetation',
    aiSuggestedSeverity: 'Medium',
    aiAnalysisReasoning: 'Claude AI Vision identified fallen hardwood debris obstructing urban right-of-way.',
    aiAccepted: true,
    upvotesCount: 9,
    upvotedBy: [],
    userId: 'usr_1',
    userName: 'Elena Rostova',
    createdAt: getOneDayAgo(),
    updatedAt: getOneDayAgo(),
    resolvedAt: null,
    adminNotes: ''
  },
  {
    id: 'TCK-8095',
    title: 'Unlit Pedestrian Crossing Signal',
    description: 'Overhead street lamp fixture completely unlit during nighttime hours at high-volume pedestrian corridor.',
    category: 'Broken Streetlight',
    severity: 'High',
    status: 'pending',
    lat: 37.7730,
    lng: -122.4170,
    address: 'Mission St & 9th St',
    photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    aiSuggestedCategory: 'Broken Streetlight',
    aiSuggestedSeverity: 'High',
    aiAnalysisReasoning: 'Claude AI Vision detected non-functional LED luminaire housing at major road intersection.',
    aiAccepted: true,
    upvotesCount: 19,
    upvotedBy: ['usr_2'],
    userId: 'usr_2',
    userName: 'Marcus Vance',
    createdAt: getHoursAgo(36),
    updatedAt: getHoursAgo(36),
    resolvedAt: null,
    adminNotes: ''
  }
];

class Database {
  constructor() {
    this.data = {
      users: [...INITIAL_SEED_USERS],
      tickets: [...INITIAL_SEED_TICKETS],
      activityLogs: [
        {
          id: 'log_1',
          ticketId: 'TCK-8091',
          userId: 'usr_1',
          userName: 'Elena Rostova',
          action: 'Filed initial report (+50 pts)',
          timestamp: getFourDaysAgo()
        },
        {
          id: 'log_2',
          ticketId: 'TCK-8093',
          userId: 'usr_3',
          userName: 'Aisha Patel',
          action: 'Issue resolved by City Admin! Bonus awarded (+150 pts)',
          timestamp: getHoursAgo(12)
        }
      ]
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.tickets && parsed.tickets.length > 0) {
          this.data = parsed;
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('Using in-memory database fallback:', err.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB to file:', err.message);
    }
  }

  // Calculate 3-day SLA Overdue flag dynamically
  calculateSLA(ticket) {
    const created = new Date(ticket.createdAt).getTime();
    const now = Date.now();
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const diffMs = now - created;
    const hoursOpen = Math.round(diffMs / (1000 * 60 * 60));
    const daysOpen = (diffMs / (1000 * 60 * 60 * 24)).toFixed(1);

    // Tickets open > 3 days and not resolved/rejected flag RED overdue
    const isOverdue = diffMs > THREE_DAYS_MS && ticket.status !== 'resolved' && ticket.status !== 'rejected';

    return {
      ...ticket,
      hoursOpen,
      daysOpen,
      isOverdue
    };
  }

  getTickets() {
    return this.data.tickets.map(t => this.calculateSLA(t));
  }

  getTicketById(id) {
    const t = this.data.tickets.find(x => x.id === id);
    return t ? this.calculateSLA(t) : null;
  }

  createTicket(ticketData) {
    const nextNum = 8090 + this.data.tickets.length + 1;
    const newId = `TCK-${nextNum}`;
    const now = new Date().toISOString();

    const newTicket = {
      id: newId,
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category || 'Pothole',
      severity: ticketData.severity || 'Medium',
      status: 'pending',
      lat: parseFloat(ticketData.lat) || 37.7749,
      lng: parseFloat(ticketData.lng) || -122.4194,
      address: ticketData.address || 'Reported Location',
      photoUrl: ticketData.photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      aiSuggestedCategory: ticketData.aiSuggestedCategory || ticketData.category,
      aiSuggestedSeverity: ticketData.aiSuggestedSeverity || ticketData.severity,
      aiAnalysisReasoning: ticketData.aiAnalysisReasoning || 'Citizen report verified with AI vision triage.',
      aiAccepted: ticketData.aiAccepted !== undefined ? ticketData.aiAccepted : true,
      upvotesCount: 1,
      upvotedBy: [ticketData.userId || 'usr_1'],
      userId: ticketData.userId || 'usr_1',
      userName: ticketData.userName || 'Elena Rostova',
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      adminNotes: ''
    };

    this.data.tickets.unshift(newTicket);

    // Award +50 points to reporter
    this.addPointsToUser(newTicket.userId, 50, 'Filed new infrastructure report');

    this.data.activityLogs.unshift({
      id: `log_${Date.now()}`,
      ticketId: newTicket.id,
      userId: newTicket.userId,
      userName: newTicket.userName,
      action: `Filed new report "${newTicket.title}" (+50 pts)`,
      timestamp: now
    });

    this.save();
    return this.calculateSLA(newTicket);
  }

  upvoteTicket(ticketId, userId) {
    const ticket = this.data.tickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    if (!ticket.upvotedBy.includes(userId)) {
      ticket.upvotedBy.push(userId);
      ticket.upvotesCount += 1;
      ticket.updatedAt = new Date().toISOString();

      // Award +10 points to voter
      const user = this.data.users.find(u => u.id === userId);
      const voterName = user ? user.name : 'Citizen';
      this.addPointsToUser(userId, 10, 'Confirmed / Upvoted existing issue');

      this.data.activityLogs.unshift({
        id: `log_${Date.now()}`,
        ticketId: ticket.id,
        userId: userId,
        userName: voterName,
        action: `Confirmed & upvoted ticket ${ticket.id} (+10 pts)`,
        timestamp: new Date().toISOString()
      });

      this.save();
    }
    return this.calculateSLA(ticket);
  }

  updateTicketStatus(ticketId, newStatus, adminNotes = '') {
    const ticket = this.data.tickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    const previousStatus = ticket.status;
    ticket.status = newStatus;
    ticket.updatedAt = new Date().toISOString();
    if (adminNotes) ticket.adminNotes = adminNotes;

    if (newStatus === 'resolved' && previousStatus !== 'resolved') {
      ticket.resolvedAt = new Date().toISOString();
      // Award +150 bonus points to original reporter!
      this.addPointsToUser(ticket.userId, 150, 'Reported issue was verified & RESOLVED by City Admin');

      this.data.activityLogs.unshift({
        id: `log_${Date.now()}`,
        ticketId: ticket.id,
        userId: ticket.userId,
        userName: ticket.userName,
        action: `🎉 Ticket ${ticket.id} RESOLVED! Reporter awarded +150 bonus pts!`,
        timestamp: new Date().toISOString()
      });
    }

    this.save();
    return this.calculateSLA(ticket);
  }

  addPointsToUser(userId, points, reason) {
    let user = this.data.users.find(u => u.id === userId);
    if (!user) {
      user = {
        id: userId,
        name: 'Active Citizen',
        email: 'citizen@civic.org',
        role: 'citizen',
        points: 0,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        badges: ['Civic Contributor'],
        reportsFiled: 0,
        upvotesGiven: 0
      };
      this.data.users.push(user);
    }
    user.points += points;

    // Check rank & badges
    if (user.points >= 500 && !user.badges.includes('City Hero')) {
      user.badges.push('City Hero');
    } else if (user.points >= 300 && !user.badges.includes('Neighborhood Guardian')) {
      user.badges.push('Neighborhood Guardian');
    } else if (user.points >= 100 && !user.badges.includes('Pothole Patrol')) {
      user.badges.push('Pothole Patrol');
    }

    this.save();
  }

  getUsers() {
    return this.data.users.sort((a, b) => b.points - a.points);
  }

  seedDemoData() {
    this.data.tickets = JSON.parse(JSON.stringify(INITIAL_SEED_TICKETS));
    this.data.users = JSON.parse(JSON.stringify(INITIAL_SEED_USERS));
    this.data.activityLogs = [
      {
        id: 'log_seed_1',
        ticketId: 'TCK-8091',
        userId: 'usr_1',
        userName: 'Elena Rostova',
        action: 'Filed report (SLA Overdue Demo active)',
        timestamp: getFourDaysAgo()
      },
      {
        id: 'log_seed_2',
        ticketId: 'TCK-8093',
        userId: 'usr_3',
        userName: 'Aisha Patel',
        action: 'Issue resolved by City Admin! (+150 bonus pts)',
        timestamp: getHoursAgo(12)
      }
    ];
    this.save();
    return this.getTickets();
  }
}

module.exports = new Database();
