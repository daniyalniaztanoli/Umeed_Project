const WelfareRequest = require('../models/WelfareRequest');
const Disbursement = require('../models/Disbursement');
const FundLedger = require('../models/FundLedger');
const Notification = require('../models/Notification');

// ==========================================
// @desc    Submit welfare request
// @route   POST /api/welfare
// @access  Private (User)
// ==========================================
const asObject = (v) => {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v;
  if (typeof v === 'string') { try { const p = JSON.parse(v); return p && typeof p === 'object' ? p : {}; } catch { return {}; } }
  return {};
};
const str = (v) => (v == null ? '' : String(v)).trim();
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

const buildReason = (type, details, fallback) => {
  const d = details || {};
  const parts = {
    fee: [`Fee aid`, d.semester && `Semester: ${d.semester}`, d.institution && `Institution: ${d.institution}`, d.feeType && `Fee: ${d.feeType}`],
    medical: [`Medical aid`, d.patientName && `Patient: ${d.patientName}`, d.condition && `Condition: ${d.condition}`, d.hospital && `Hospital: ${d.hospital}`],
    books: [`Books aid`, d.course && `Course: ${d.course}`, d.booksNeeded && `Books: ${d.booksNeeded}`],
    ration: [`Ration aid`, d.familyMembers && `Family: ${d.familyMembers}`, d.city && `City: ${d.city}`, d.monthlyIncome && `Income: ${d.monthlyIncome}`],
    other: [`Other aid`, d.helpCategory && `Category: ${d.helpCategory}`],
  }[type] || [type];
  const summary = parts.filter(Boolean).join(' | ');
  return summary || fallback || 'Welfare request';
};

const createWelfareRequest = async (req, res) => {
  let { type, reason, amountRequested, fundType, bloodInfo, details } = req.body;

  try {
    if (!type) {
      return res.status(400).json({ message: 'Request type is required' });
    }

    // bloodInfo/details may arrive as JSON string in multipart/form-data
    bloodInfo = asObject(bloodInfo);
    details = asObject(details);

    if (type === 'blood') {
      const required = [
        'requestType', 'bloodGroup', 'fullName', 'phone', 'cnic', 'age',
        'gender', 'city', 'hospital', 'urgency', 'units', 'neededBy', 'contactConsent',
      ];
      const missing = required.filter((k) => bloodInfo == null || bloodInfo[k] === '' || bloodInfo[k] === undefined);
      if (missing.length) {
        return res.status(400).json({ message: `Missing blood request fields: ${missing.join(', ')}` });
      }
      bloodInfo.age = Number(bloodInfo.age);
      bloodInfo.units = Number(bloodInfo.units);
      bloodInfo.contactConsent = bloodInfo.contactConsent === true || bloodInfo.contactConsent === 'true';
      reason = reason || `Blood ${bloodInfo.requestType}: ${bloodInfo.bloodGroup}, ${bloodInfo.units} unit(s), ${bloodInfo.hospital}, ${bloodInfo.city}`;
      amountRequested = 0;
      details = undefined;
    } else {
      const requirements = {
        fee: ['fullName', 'phone', 'cnic', 'institution', 'studentId', 'program', 'semester', 'feeType', 'dueDate', 'situation'],
        medical: ['patientName', 'relation', 'phone', 'condition', 'hospital', 'doctor', 'treatmentDate', 'estimateBreakdown', 'situation'],
        books: ['fullName', 'phone', 'institution', 'program', 'semester', 'booksNeeded', 'situation'],
        ration: ['fullName', 'phone', 'cnic', 'city', 'address', 'familyMembers', 'monthlyIncome', 'rationItems', 'situation'],
        other: ['fullName', 'phone', 'helpCategory', 'situation'],
      }[type] || ['situation'];

      const missing = requirements.filter((k) => !str(details[k]));
      if (missing.length) {
        return res.status(400).json({ message: `Missing required details: ${missing.join(', ')}` });
      }

      amountRequested = num(amountRequested);
      if (!Number.isFinite(amountRequested) || amountRequested <= 0) {
        return res.status(400).json({ message: 'Please enter a valid amount in PKR' });
      }

      const situation = str(details.situation) || str(reason);
      reason = str(reason) || buildReason(type, details, situation);
      details.situation = situation;
      bloodInfo = undefined;
    }

    // Multiple documents upload
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const documents = req.files
      ? req.files.map((file) => file.path || file.secure_url || file.url || `${baseUrl}/uploads/${file.filename}`)
      : [];

    const welfareRequest = await WelfareRequest.create({
      user: req.user._id,
      type,
      reason,
      amountRequested,
      documents,
      bloodInfo,
      details,
      fundType: type === 'blood' ? 'general' : (fundType || 'general'),
      status: 'submitted',
    });

    // Notify all admins
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'welfare_new',
        message: type === 'blood'
          ? `New blood ${bloodInfo.requestType} request (${bloodInfo.bloodGroup}) from ${req.user.name}`
          : `New welfare request from ${req.user.name}`,
        link: `/welfare/${welfareRequest._id}`,
      });
    }

    res.status(201).json(welfareRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Get current user's welfare requests
// @route   GET /api/welfare/mine
// @access  Private (User)
// ==========================================
const getMyWelfareRequests = async (req, res) => {
  try {
    const requests = await WelfareRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    // Attach disbursement info so user can see how much was actually paid
    const withDisbursement = await Promise.all(
      requests.map(async (r) => {
        const d = await Disbursement.findOne({ welfareRequest: r._id })
          .select('amount method createdAt proofUrl');
        const obj = r.toObject();
        obj.disbursement = d || null;
        return obj;
      })
    );

    res.json(withDisbursement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Get welfare requests
// @route   GET /api/welfare
// @access  Private
// ==========================================
const getWelfareRequests = async (req, res) => {
  try {
    let filter = {};

    // User sirf apni requests dekhe
    if (req.user.role === 'user') {
      filter.user = req.user._id;
    }

    // Query filters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.fundType) filter.fundType = req.query.fundType;

    const requests = await WelfareRequest.find(filter)
      .populate('user', 'name email phone')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Get single welfare request
// @route   GET /api/welfare/:id
// @access  Private
// ==========================================
const getWelfareRequestById = async (req, res) => {
  try {
    const request = await WelfareRequest.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('reviewedBy', 'name role');

    if (!request) {
      return res.status(404).json({ message: 'Welfare request not found' });
    }

    // Access check
    if (
      req.user.role === 'user' &&
      request.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Disbursement info
    const disbursement = await Disbursement.findOne({
      welfareRequest: request._id,
    }).populate('approvedBy', 'name');

    res.json({ request, disbursement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Review welfare request (mark under review)
// @route   PUT /api/welfare/:id/review
// @access  Admin/Finance Officer
// ==========================================
const reviewWelfareRequest = async (req, res) => {
  try {
    const request = await WelfareRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Welfare request not found' });
    }

    request.status = 'under_review';
    request.reviewedBy = req.user._id;
    request.remarks = req.body.remarks || 'Under review';
    await request.save();

    // Notify user
    await Notification.create({
      user: request.user,
      type: 'welfare_review',
      message: 'Your welfare request is under review',
      link: `/welfare/${request._id}`,
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Approve welfare request
// @route   PUT /api/welfare/:id/approve
// @access  Admin/Finance Officer
// ==========================================
const approveWelfareRequest = async (req, res) => {
  const { remarks, fundType } = req.body;

  try {
    const request = await WelfareRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Welfare request not found' });
    }

    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.remarks = remarks || 'Approved';
    if (fundType) request.fundType = fundType;
    await request.save();

    // Notify user
    await Notification.create({
      user: request.user,
      type: 'welfare_approved',
      message: `Your welfare request has been approved`,
      link: `/welfare/${request._id}`,
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Reject welfare request
// @route   PUT /api/welfare/:id/reject
// @access  Admin/Finance Officer
// ==========================================
const rejectWelfareRequest = async (req, res) => {
  const { remarks } = req.body;

  try {
    if (!remarks) {
      return res
        .status(400)
        .json({ message: 'Rejection reason (remarks) is required' });
    }

    const request = await WelfareRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Welfare request not found' });
    }

    request.status = 'rejected';
    request.reviewedBy = req.user._id;
    request.remarks = remarks;
    await request.save();

    // Notify user
    await Notification.create({
      user: request.user,
      type: 'welfare_rejected',
      message: `Your welfare request was rejected: ${remarks}`,
      link: `/welfare/${request._id}`,
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Disburse funds (mark as paid)
// @route   PUT /api/welfare/:id/disburse
// @access  Admin/Finance Officer
// ==========================================
const disburseWelfareRequest = async (req, res) => {
  const { amount, method, fundType } = req.body;

  try {
    const request = await WelfareRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Welfare request not found' });
    }

    if (request.status !== 'approved') {
      return res
        .status(400)
        .json({ message: 'Only approved requests can be disbursed' });
    }

    if (!amount || !method) {
      return res
        .status(400)
        .json({ message: 'Amount and method are required' });
    }

    // Proof photo
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const proofUrl = req.file ? (req.file.path || req.file.secure_url || req.file.url || `${baseUrl}/uploads/${req.file.filename}`) : null;

    // Create disbursement record
    const disbursement = await Disbursement.create({
      welfareRequest: request._id,
      fundType: fundType || request.fundType,
      amount,
      method,
      proofUrl,
      approvedBy: req.user._id,
    });

    // Update request status
    request.status = 'disbursed';
    await request.save();

    // Add to fund ledger (debit entry)
    await FundLedger.create({
      fundType: fundType || request.fundType,
      entryType: 'debit',
      amount,
      linkedDisbursement: disbursement._id,
      description: `Welfare disbursement for request ${request._id}`,
      approvedBy: req.user._id,
    });

    // Notify user
    await Notification.create({
      user: request.user,
      type: 'welfare_disbursed',
      message: `Your welfare amount PKR ${amount} has been disbursed`,
      link: `/welfare/${request._id}`,
    });

    res.status(201).json({ disbursement, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// @desc    Get welfare stats (admin dashboard)
// @route   GET /api/welfare/stats
// @access  Admin
// ==========================================
const getWelfareStats = async (req, res) => {
  try {
    const total = await WelfareRequest.countDocuments();
    const submitted = await WelfareRequest.countDocuments({
      status: 'submitted',
    });
    const underReview = await WelfareRequest.countDocuments({
      status: 'under_review',
    });
    const approved = await WelfareRequest.countDocuments({
      status: 'approved',
    });
    const rejected = await WelfareRequest.countDocuments({
      status: 'rejected',
    });
    const disbursed = await WelfareRequest.countDocuments({
      status: 'disbursed',
    });

    // Total disbursed amount
    const disbursements = await Disbursement.find();
    const totalDisbursed = disbursements.reduce((sum, d) => sum + d.amount, 0);

    // By type
    const byType = await WelfareRequest.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      submitted,
      underReview,
      approved,
      rejected,
      disbursed,
      totalDisbursed,
      byType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWelfareRequest,
  getMyWelfareRequests,
  getWelfareRequests,
  getWelfareRequestById,
  reviewWelfareRequest,
  approveWelfareRequest,
  rejectWelfareRequest,
  disburseWelfareRequest,
  getWelfareStats,
};