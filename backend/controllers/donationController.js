const Donation = require('../models/Donations');
const Donor = require('../models/Donor');
const Disbursement = require('../models/Disbursement');
const ImpactStory = require('../models/ImpactStory');
const WelfareRequest = require('../models/WelfareRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

const categoryToFund = (c) => ({ sadqa: 'sadaqah', sadaqah: 'sadaqah', fitra: 'sadaqah', zakat: 'zakat', general: 'general', campaign: 'campaign' }[c] || 'general');
const receiptNo = () => `UMD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const createDonation = async (req, res) => {
  try {
    const { amount, category, method, reference, notes, isAnonymous, campaign } = req.body;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'Valid donation amount is required' });
    if (!category) return res.status(400).json({ message: 'Donation category is required' });
    if (!method) return res.status(400).json({ message: 'Payment method is required' });

    const anon = isAnonymous === true || isAnonymous === 'true';
    const donorName = anon ? 'Anonymous' : (req.body.donorName || req.user?.name || 'Donor');
    const donorContact = anon ? '' : (req.body.donorContact || req.user?.phone || req.user?.email || '');

    let donor;
    if (req.user?._id) donor = await Donor.findOne({ user: req.user._id });
    if (!donor) {
      donor = await Donor.create({ user: req.user?._id, name: donorName, contact: donorContact || '-', isAnonymous: anon });
    } else if (!anon) {
      donor.name = donorName; donor.contact = donorContact || donor.contact; donor.isAnonymous = false; await donor.save();
    }

    let proofUrl = req.body.proofUrl;
    if (req.file) proofUrl = `/uploads/${req.file.filename}`;

    const donation = await Donation.create({
      user: req.user?._id,
      donor: donor._id,
      donorName,
      donorContact,
      isAnonymous: anon,
      category,
      fundType: categoryToFund(category),
      campaign: campaign || undefined,
      amount: amt,
      method,
      reference,
      proofUrl,
      notes,
      status: 'pending',
      receiptNumber: receiptNo(),
    });

    const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');
    if (admins.length) {
      await Notification.insertMany(admins.map((a) => ({
        user: a._id,
        type: 'donation_submitted',
        message: `Donation submitted: PKR ${amt} (${category})${anon ? ' - anonymous' : ''}`,
        link: `/donations/${donation._id}`,
      })));
    }

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyDonations = async (req, res) => {
  try {
    const list = await Donation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('campaign', 'title')
      .populate('donor', 'name contact email')
      .populate('user', 'name email');
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    const ownerId = donation.user?._id || donation.user;
const isOwner = ownerId && ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'finance_officer';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Access denied' });
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransparency = async (req, res) => {
  try {
    const confirmed = await Donation.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$category', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const pending = await Donation.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const disbursements = await Disbursement.aggregate([{ $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }]);
    const welfareSpent = await WelfareRequest.aggregate([
      { $match: { status: 'disbursed', amountApproved: { $gt: 0 } } },
      { $group: { _id: null, amount: { $sum: '$amountApproved' }, count: { $sum: 1 } } },
    ]);

    const totalReceived = confirmed.reduce((s, r) => s + r.amount, 0);
    const disbursedTotal = disbursements[0]?.amount || 0;
    const welfareTotal = welfareSpent[0]?.amount || 0;
    const totalSpent = disbursedTotal > 0 ? disbursedTotal : welfareTotal;
    const pendingVerification = pending[0]?.amount || 0;

    res.json({
      totalReceived,
      totalSpent,
      remainingBalance: Math.max(0, totalReceived - totalSpent),
      pendingVerification,
      confirmedDonations: confirmed.reduce((s, r) => s + r.count, 0),
      byCategory: confirmed.map((r) => ({ category: r._id, amount: r.amount, count: r.count })),
      note: 'Pending donations are shown separately until manually verified.',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getImpactStories = async (req, res) => {
  try {
    const stories = await ImpactStory.find({ isPublished: true }).sort({ publishedAt: -1, createdAt: -1 }).limit(20);
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate('donor').populate('user', 'name email').sort({ createdAt: -1 });
    res.json(donations);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'rejected', 'received'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const donation = await Donation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!donation) return res.status(404).json({ message: 'Not found' });
    res.json(donation);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { createDonation, getMyDonations, getDonationById, getTransparency, getImpactStories, getAllDonations, updateDonationStatus };