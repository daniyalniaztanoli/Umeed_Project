/**
 * Seed script: creates user Huzaifa (huzaifa@gmail.com / 123456)
 * and inserts 5 test records into each section.
 * Run: node seed-test-data.js  (from backend folder)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Complaint = require("./models/Complaint");
const WelfareRequest = require("./models/WelfareRequest");
const Donation = require("./models/Donation");
const Event = require("./models/Event");
const Volunteer = require("./models/Volunteer");

const MONGO_URI = process.env.MONGO_URI;
const EMAIL = "huzaifa@gmail.com";
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // ─ 1. Create/refresh user ──────────────
  const hashed = await bcrypt.hash("123456", 10);
  let user = await User.findOne({ email: EMAIL });
  if (user) {
    user.password = hashed;
    user.phone = user.phone || "03001234567";
    user.city = user.city || "Lahore";
    user.name = user.name || "Huzaifa";
    await user.save();
    console.log("♻️  Existing user updated:", user._id);
  } else {
    user = await User.create({
      name: "Huzaifa",
      email: EMAIL,
      password: hashed,
      phone: "03001234567",
      city: "Lahore",
      role: "user",
    });
    console.log("✅ User created:", user._id);
  }
  const uid = user._id;

  // ─ 2. Complaints (5) ───────────
  const complaintCount = await Complaint.countDocuments({ user: uid });
  if (complaintCount === 0) {
    await Complaint.insertMany([
      {
        user: uid,
        title: "Broken fan in classroom",
        description: "Ceiling fan in CS Lab 2 is not working.",
        category: "Electricity",
        location: { building: "CS Block", room: "Lab 2" },
        priority: "Medium",
        status: "Pending",
        createdAt: daysAgo(1),
      },
      {
        user: uid,
        title: "Water cooler leaking",
        description: "Water cooler near canteen leaks continuously.",
        category: "Plumbing",
        location: { building: "Main Block", room: "Canteen" },
        priority: "High",
        status: "In Progress",
        createdAt: daysAgo(3),
      },
      {
        user: uid,
        title: "Broken window",
        description: "Window glass cracked in lecture hall 4.",
        category: "Carpentry",
        location: { building: "Arts Block", room: "LH-4" },
        priority: "Low",
        status: "Under Review",
        createdAt: daysAgo(5),
      },
      {
        user: uid,
        title: "Flickering lights",
        description: "Corridor lights flicker in the evening.",
        category: "Electricity",
        location: { building: "Science Block", room: "Corridor" },
        priority: "Medium",
        status: "Resolved",
        createdAt: daysAgo(8),
      },
      {
        user: uid,
        title: "Dirty washrooms",
        description: "Washrooms not cleaned for two days.",
        category: "Cleanliness",
        location: { building: "CS Block", room: "Ground floor" },
        priority: "High",
        status: "Pending",
        createdAt: daysAgo(10),
      },
    ]);
    console.log("✅ 5 complaints inserted");
  } else {
    console.log(`⏭️  Complaints already exist (${complaintCount}), skipped`);
  }

  // ─ 3. Welfare requests (5) ─────────────
  const welfareCount = await WelfareRequest.countDocuments({ user: uid });
  if (welfareCount === 0) {
    await WelfareRequest.insertMany([
      {
        user: uid,
        type: "fee",
        status: "Pending",
        reason: "Semester fee support",
        amountRequested: 45000,
        fundType: "Education Fund",
        feeInfo: {
          fullName: "Huzaifa",
          phone: "03001234567",
          institution: "Punjab University",
          studentId: "BSCS-2021-045",
          program: "BSCS",
          semester: "5th",
          feeType: "Semester",
          dueDate: daysAgo(-30),
          situation: "Family unable to pay this semester.",
        },
        createdAt: daysAgo(2),
      },
      {
        user: uid,
        type: "medical",
        status: "Under Review",
        reason: "Father medical treatment",
        amountRequested: 120000,
        fundType: "Medical Fund",
        medicalInfo: {
          patientName: "Muhammad Ahmed",
          relation: "Father",
          phone: "03001234567",
          condition: "Cardiac",
          hospital: "Jinnah Hospital",
          doctor: "Dr. Saleem",
          treatmentDate: daysAgo(-10),
          estimateBreakdown: "Surgery + medicines",
          situation: "Open heart surgery needed.",
        },
        createdAt: daysAgo(4),
      },
      {
        user: uid,
        type: "books",
        status: "Approved",
        reason: "Books for semester",
        amountRequested: 8000,
        fundType: "Education Fund",
        booksInfo: {
          fullName: "Huzaifa",
          phone: "03001234567",
          institution: "Punjab University",
          program: "BSCS",
          semester: "5th",
          booksNeeded: "DSA, DB, OS books",
          situation: "Cannot afford course books.",
        },
        createdAt: daysAgo(6),
      },
      {
        user: uid,
        type: "ration",
        status: "In Progress",
        reason: "Monthly ration support",
        amountRequested: 12000,
        fundType: "Ration Fund",
        rationInfo: {
          fullName: "Huzaifa",
          phone: "03001234567",
          cnic: "35202-1234567-1",
          city: "Lahore",
          address: "Model Town",
          familyMembers: 5,
          monthlyIncome: 25000,
          rationItems: "Flour, rice, oil, dal",
          situation: "Low income family.",
        },
        createdAt: daysAgo(7),
      },
      {
        user: uid,
        type: "other",
        status: "Rejected",
        reason: "Transport help",
        amountRequested: 5000,
        fundType: "General Fund",
        otherInfo: {
          fullName: "Huzaifa",
          phone: "03001234567",
          helpCategory: "Transport",
          situation: "Daily commute cost.",
        },
        createdAt: daysAgo(12),
      },
    ]);
    console.log("✅ 5 welfare requests inserted");
  } else {
    console.log(
      `⏭️  Welfare requests already exist (${welfareCount}), skipped`,
    );
  }

  // ─ 4. Donations (5) ────────────
  const DonationModel = Donation || null;
  if (DonationModel) {
    const donationCount = await DonationModel.countDocuments({ user: uid });
    if (donationCount === 0) {
      await DonationModel.insertMany([
        {
          user: uid,
          donorName: "Huzaifa",
          amount: 5000,
          method: "easypaisa",
          status: "Approved",
          createdAt: daysAgo(2),
        },
        {
          user: uid,
          donorName: "Huzaifa",
          amount: 10000,
          method: "jazzcash",
          status: "Pending",
          createdAt: daysAgo(4),
        },
        {
          user: uid,
          donorName: "Huzaifa",
          amount: 2500,
          method: "bank",
          status: "Approved",
          createdAt: daysAgo(6),
        },
        {
          user: uid,
          donorName: "Huzaifa",
          amount: 1500,
          method: "easypaisa",
          status: "Rejected",
          createdAt: daysAgo(9),
        },
        {
          user: uid,
          donorName: "Huzaifa",
          amount: 7000,
          method: "cash",
          status: "Approved",
          createdAt: daysAgo(14),
        },
      ]);
      console.log("✅ 5 donations inserted");
    } else {
      console.log(`⏭️  Donations already exist (${donationCount}), skipped`);
    }
  }

  // ─ 5. Events (5) ───────────────
  const eventCount = await Event.countDocuments({});
  if (eventCount === 0) {
    await Event.insertMany([
      {
        title: "Free Medical Camp",
        description: "Free checkup camp for students.",
        date: daysAgo(-7),
        location: "Campus Ground",
        status: "Upcoming",
        createdAt: daysAgo(1),
      },
      {
        title: "Book Drive",
        description: "Collect and distribute used books.",
        date: daysAgo(-14),
        location: "Library",
        status: "Upcoming",
        createdAt: daysAgo(2),
      },
      {
        title: "Blood Donation Drive",
        description: "In partnership with Red Crescent.",
        date: daysAgo(-20),
        location: "Main Auditorium",
        status: "Upcoming",
        createdAt: daysAgo(3),
      },
      {
        title: "Ramzan Ration Distribution",
        description: "Ration bags for needy families.",
        date: daysAgo(30),
        location: "City Center",
        status: "Completed",
        createdAt: daysAgo(40),
      },
      {
        title: "Winter Clothes Drive",
        description: "Warm clothes collection and distribution.",
        date: daysAgo(60),
        location: "Various areas",
        status: "Completed",
        createdAt: daysAgo(70),
      },
    ]);
    console.log("✅ 5 events inserted");
  } else {
    console.log(`⏭️  Events already exist (${eventCount}), skipped`);
  }

  // ─ 6. Volunteers (5) ───────────
  const volunteerCount = await Volunteer.countDocuments({});
  if (volunteerCount === 0) {
    await Volunteer.insertMany([
      {
        user: uid,
        name: "Huzaifa",
        email: EMAIL,
        phone: "03001234567",
        city: "Lahore",
        interests: ["Teaching", "Medical camps"],
        availability: "Weekends",
        skills: "First aid",
        message: "Happy to help!",
        status: "Pending",
        createdAt: daysAgo(1),
      },
      {
        name: "Ali Raza",
        phone: "03011111",
        city: "Lahore",
        interests: ["Blood donation"],
        availability: "Evenings",
        status: "Approved",
        createdAt: daysAgo(3),
      },
      {
        name: "Sana Khan",
        phone: "03022222",
        city: "Karachi",
        interests: ["Fundraising"],
        availability: "Weekends",
        status: "Pending",
        createdAt: daysAgo(5),
      },
      {
        name: "Bilal Ahmed",
        phone: "03033333",
        city: "Islamabad",
        interests: ["Teaching"],
        availability: "Anytime",
        status: "Approved",
        createdAt: daysAgo(7),
      },
      {
        name: "Ayesha Malik",
        phone: "03044444444",
        city: "Lahore",
        interests: ["Medical camps", "Fundraising"],
        availability: "Weekends",
        status: "Pending",
        createdAt: daysAgo(9),
      },
    ]);
    console.log("✅ 5 volunteers inserted");
  } else {
    console.log(`⏭️  Volunteers already exist (${volunteerCount}), skipped`);
  }

  console.log("\n🎉 Seeding done. Login with huzaifa@gmail.com / 123456");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
});
