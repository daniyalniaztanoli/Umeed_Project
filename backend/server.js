const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Umeed Foundation API is running',
    version: '1.0.0',
  });
});

// Vercel health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Upload route (image upload for complaints)
const upload = require('./middleware/upload');
app.post('/api/upload', require('./middleware/authMiddleware').protect, upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const urls = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);
  res.json({ urls });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/welfare', require('./routes/welfareRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/suggestions', require('./routes/suggestionRoutes'));
app.use('/api/blood-donors', require('./routes/bloodDonorRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/impact-stories', require('./routes/impactStoryRoutes'));

// Pending counts for admin sidebar badges
app.get('/admin/pending-counts', async (req, res) => {
  try {
    const Complaint = require('./models/Complaint');
    const WelfareRequest = require('./models/WelfareRequest');
    const Donation = require('./models/Donations');
    const [complaints, welfare, donations] = await Promise.all([
      Complaint.countDocuments({ status: 'Pending' }),
      WelfareRequest.countDocuments({ status: 'submitted' }),
      Donation.countDocuments({}),
    ]);
    res.json({ complaints, welfare, donations });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

// Export the Express app for Vercel serverless
module.exports = app;

// Only listen when run directly (local development), not on Vercel
if (require.main === module) {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}