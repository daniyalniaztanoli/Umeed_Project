const WelfareRequest = require('../models/WelfareRequest');

const BLOOD_GROUPS = new Set(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

// Public/user directory from CONSENTED blood-donate welfare requests.
// Consent is respected: only bloodInfo.contactConsent === true and requestType === 'donate'.
const getBloodDonors = async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;
    const filter = {
      type: 'blood',
      'bloodInfo.requestType': 'donate',
      'bloodInfo.contactConsent': true,
      status: { $nin: ['Rejected'] },
    };
    if (bloodGroup && BLOOD_GROUPS.has(String(bloodGroup).trim())) filter['bloodInfo.bloodGroup'] = String(bloodGroup).trim();
    if (city && String(city).trim()) filter['bloodInfo.city'] = new RegExp(String(city).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const rows = await WelfareRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .select('bloodInfo createdAt status')
      .lean();

    const donors = rows.map((r) => {
      const b = r.bloodInfo || {};
      return {
        id: r._id,
        name: b.fullName || 'Donor',
        bloodGroup: b.bloodGroup || '',
        city: b.city || '',
        availability: b.availability || '',
        phone: b.phone || '',
        lastDonationDate: b.lastDonationDate || null,
        units: b.units,
        requestStatus: r.status,
        createdAt: r.createdAt,
      };
    }).filter((d) => d.bloodGroup && d.phone);

    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBloodDonors };