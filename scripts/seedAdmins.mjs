/**
 * Seed admin accounts into MongoDB.
 *
 * Run from the project root (loads env from your local env file):
 *   node --env-file=.env.local scripts/seedAdmins.mjs
 * or, if your secrets live in .env:
 *   node --env-file=.env scripts/seedAdmins.mjs
 *
 * Passwords: set ADMIN_PASSWORD / AGENT_PASSWORD in the env file to choose
 * your own; otherwise a strong random password is generated and printed once.
 * Existing accounts (matched by email) are left untouched.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/seedAdmins.mjs");
  process.exit(1);
}

// Mirrors src/server/models/admin.ts (collection "Admins").
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    fcmToken: { type: [String], default: [] },
    role: { type: String, required: true, enum: ["ADMIN", "USER", "AGENT"] },
    profileImage: { type: String },
  },
  { collection: "Admins", timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

const genPassword = () => randomBytes(9).toString("base64url"); // ~12 chars

const accounts = [
  { name: "Admin", email: "admin@email.com", role: "ADMIN", password: process.env.ADMIN_PASSWORD || genPassword() },
  { name: "Agent", email: "agent@email.com", role: "AGENT", password: process.env.AGENT_PASSWORD || genPassword() },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB\n");

  const created = [];
  for (const acc of accounts) {
    const existing = await Admin.findOne({ email: acc.email });
    if (existing) {
      console.log(`• ${acc.email} already exists (role ${existing.role}) — left untouched.`);
      continue;
    }
    const hashed = await bcrypt.hash(acc.password, 10);
    await Admin.create({ name: acc.name, email: acc.email, role: acc.role, password: hashed });
    created.push(acc);
    console.log(`✓ Created ${acc.role.padEnd(5)}  ${acc.email}`);
  }

  if (created.length) {
    console.log("\n─────────────────────────────────────────────");
    console.log(" SAVE THESE CREDENTIALS NOW (shown once):");
    for (const acc of created) {
      console.log(`   ${acc.email}  →  ${acc.password}`);
    }
    console.log(" Log in, then change the passwords.");
    console.log("─────────────────────────────────────────────");
  }

  await mongoose.disconnect();
  console.log("\n✓ Done.");
}

main().catch(async (err) => {
  console.error("✗ Seeding failed:", err?.message || err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
