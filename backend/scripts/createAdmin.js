/**
 * Create the first Umeed admin account.
 *
 * Usage (env vars, recommended):
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=StrongPass123 ADMIN_NAME="Umeed Admin" [ADMIN_PHONE=03000000000] node backend/scripts/createAdmin.js
 *
 * Usage (CLI args):
 *   node backend/scripts/createAdmin.js --email admin@example.com --password StrongPass123 --name "Umeed Admin" [--phone 03000000000]
 *
 * Requires MONGO_URI (and uses dotenv from backend/.env if present).
 * Never hardcode a password.
 */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || getArg('email') || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || getArg('password') || '';
  const name = (process.env.ADMIN_NAME || getArg('name') || 'Umeed Admin').trim();
  const phone = (process.env.ADMIN_PHONE || getArg('phone') || '0000000000').trim();

  if (!email || !password) {
    console.error('Error: admin email and password are required.');
    console.error('Provide ADMIN_EMAIL and ADMIN_PASSWORD env vars or --email and --password args.');
    process.exit(1);
  }
  if (String(password).length < 6) {
    console.error('Error: password must be at least 6 characters.');
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI is not set. Set it in backend/.env or the environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    let user = await User.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    if (user) {
      user.password = hashed;
      user.role = 'admin';
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.status = 'active';
      await user.save();
      console.log(`Updated existing user as admin: ${email}`);
    } else {
      user = await User.create({
        name,
        email,
        password: hashed,
        phone,
        role: 'admin',
        status: 'active',
      });
      console.log(`Created admin user: ${email}`);
    }

    console.log(`Admin ready. id=${user._id} role=${user.role}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
}

main();
