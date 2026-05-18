/**
 * Pet Connect — Seed Script
 * Run: node server/seed.js
 *
 * Creates demo users, pets, vets, caretakers, and stray reports.
 * Safe to re-run: skips already-existing records (checks by email/name).
 */

require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

/* ── Import models ─────────────────────────────── */
const User           = require("./models/User");
const Pet            = require("./models/Pet");
const VetProfile     = require("./models/VetProfile");
const Caretaker      = require("./models/Caretaker");
const StrayReport    = require("./models/StrayReport");

/* ── Helpers ───────────────────────────────────── */
const hash = (pw) => bcrypt.hash(pw, 10);
const log  = (msg) => console.log(`  ✔  ${msg}`);

/* ================================================================
   DATA
   ================================================================ */

const DEMO_USERS = [
  { name: "Aarav Sharma",    email: "aarav@petconnect.dev",    role: "owner",  pw: "Demo1234!" },
  { name: "Priya Mehta",     email: "priya@petconnect.dev",    role: "owner",  pw: "Demo1234!" },
  { name: "Dr. Rohan Verma", email: "rohan@petconnect.dev",    role: "vet",    pw: "Demo1234!" },
  { name: "Dr. Anjali Singh",email: "anjali@petconnect.dev",   role: "vet",    pw: "Demo1234!" },
  { name: "Dr. Kabir Das",   email: "kabir@petconnect.dev",    role: "vet",    pw: "Demo1234!" },
  { name: "Sneha Joshi",     email: "sneha@petconnect.dev",    role: "lover",  pw: "Demo1234!" },
  { name: "Arjun Nair",      email: "arjun@petconnect.dev",    role: "lover",  pw: "Demo1234!" },
  { name: "Kavya Reddy",     email: "kavya@petconnect.dev",    role: "owner",  pw: "Demo1234!" },
  { name: "Ishaan Patel",    email: "ishaan@petconnect.dev",   role: "lover",  pw: "Demo1234!" },
  { name: "Meera Krishnan",  email: "meera@petconnect.dev",    role: "owner",  pw: "Demo1234!" },
];

const PETS_DATA = [
  // Dogs for adoption/buy
  {
    name: "Bruno", species: "dog", breed: "Labrador Retriever", age: "2 years",
    status: "buy", price: 12000,
    description: "Bruno is a friendly, energetic Labrador who loves playing fetch and cuddles. Vaccinated and house-trained.",
    imageURL: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600",
  },
  {
    name: "Luna",  species: "dog", breed: "Golden Retriever", age: "1 year",
    status: "buy", price: 15000,
    description: "Luna is a gentle, intelligent Golden Retriever pup. Great with kids and other pets.",
    imageURL: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600",
  },
  {
    name: "Max",   species: "dog", breed: "German Shepherd", age: "3 years",
    status: "buy", price: 0,
    description: "Max was rescued from the streets. He is now healthy, neutered, and ready for a loving forever home.",
    imageURL: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600",
  },
  {
    name: "Coco",  species: "dog", breed: "Beagle", age: "8 months",
    status: "buy", price: 9000,
    description: "Coco is a curious little Beagle with an incredible nose. Loves going on walks and sniffing adventures.",
    imageURL: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600",
  },
  // Cats
  {
    name: "Whiskers", species: "cat", breed: "Persian", age: "4 years",
    status: "buy", price: 8000,
    description: "Whiskers is a calm, regal Persian cat with a beautiful silky coat. Prefers a quiet home.",
    imageURL: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600",
  },
  {
    name: "Mittens",  species: "cat", breed: "Domestic Shorthair", age: "2 years",
    status: "buy", price: 0,
    description: "Mittens is a sweet tabby cat rescued from a colony. Spayed, vaccinated, and very affectionate.",
    imageURL: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600",
  },
  {
    name: "Oreo",     species: "cat", breed: "Tuxedo", age: "6 months",
    status: "buy", price: 4000,
    description: "Oreo is a playful black-and-white kitten who loves laser pointers and feather toys.",
    imageURL: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600",
  },
  // Rabbits
  {
    name: "Snowball", species: "rabbit", breed: "New Zealand White", age: "1 year",
    status: "buy", price: 3000,
    description: "Snowball is a fluffy white rabbit who loves leafy greens and hopping around the living room.",
    imageURL: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600",
  },
  {
    name: "Hopscotch",species: "rabbit", breed: "Holland Lop", age: "5 months",
    status: "buy", price: 0,
    description: "Hopscotch is a lop-eared rescue with floppy ears and a big personality.",
    imageURL: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
  },
  // Birds
  {
    name: "Mango",    species: "bird", breed: "Indian Ringneck Parakeet", age: "1.5 years",
    status: "buy", price: 5500,
    description: "Mango can say over 30 words and whistle tunes. A bright green, hand-tamed parakeet.",
    imageURL: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600",
  },
  {
    name: "Pearl",    species: "bird", breed: "Cockatiel", age: "2 years",
    status: "buy", price: 3500,
    description: "Pearl is a gentle cockatiel who loves head scratches and mimicking household sounds.",
    imageURL: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600",
  },
];

const VETS_DATA = [
  {
    userEmail: "rohan@petconnect.dev",
    clinicName: "Happy Paws Clinic",
    specialty: "Small Animals",
    location: "Bandra, Mumbai",
    experienceYears: 8,
    consultationFee: 600,
    phone: "+91-9876540001",
    languages: ["Hindi", "English", "Marathi"],
    bio: "Dr. Rohan Verma is a passionate veterinarian specializing in small animals — dogs, cats, and rabbits. With 8 years of clinical experience at Happy Paws Clinic in Bandra, he provides comprehensive preventive and curative care. He has a special interest in feline medicine and animal nutrition.",
    available: true,
    ratingAverage: 4.8,
    ratingCount: 142,
  },
  {
    userEmail: "anjali@petconnect.dev",
    clinicName: "CityVet Hospital",
    specialty: "Surgery",
    location: "Koramangala, Bengaluru",
    experienceYears: 12,
    consultationFee: 900,
    phone: "+91-9876540002",
    languages: ["Kannada", "English", "Hindi"],
    bio: "Dr. Anjali Singh is a highly experienced veterinary surgeon with over 12 years in soft-tissue and orthopaedic surgeries. She has performed over 2,000 successful procedures and also offers post-operative care and rehabilitation guidance.",
    available: true,
    ratingAverage: 4.9,
    ratingCount: 218,
  },
  {
    userEmail: "kabir@petconnect.dev",
    clinicName: "Paws & Claws Clinic",
    specialty: "Dermatology",
    location: "Hauz Khas, Delhi",
    experienceYears: 6,
    consultationFee: 700,
    phone: "+91-9876540003",
    languages: ["Hindi", "English", "Punjabi"],
    bio: "Dr. Kabir Das specialises in veterinary dermatology — skin allergies, coat problems, and ear disorders in dogs and cats. He uses evidence-based diagnostics and is known for his patient-friendly approach.",
    available: true,
    ratingAverage: 4.6,
    ratingCount: 87,
  },
];

const CARETAKERS_DATA = [
  {
    userEmail: "sneha@petconnect.dev",
    bio: "Hi! I'm Sneha, a lifelong animal lover with a spacious home and a fenced garden. I have cared for over 50 dogs and cats over the past 5 years. Your pet will be treated like my own — daily walks, home-cooked meals, and tons of cuddles!",
    location: "Andheri West, Mumbai",
    phone: "+91-9876541001",
    pricePerDay: 400,
    petsAccepted: ["dog", "cat", "rabbit"],
    experienceYears: 5,
    available: true,
    ratingAverage: 4.7,
    ratingCount: 63,
  },
  {
    userEmail: "arjun@petconnect.dev",
    bio: "Experienced pet sitter and dog walker. I offer a home-away-from-home experience for your furry friends. I send photo updates every few hours so you're always in the loop. Certified in pet first aid.",
    location: "Indiranagar, Bengaluru",
    phone: "+91-9876541002",
    pricePerDay: 500,
    petsAccepted: ["dog", "cat", "bird"],
    experienceYears: 3,
    available: true,
    ratingAverage: 4.5,
    ratingCount: 38,
  },
  {
    userEmail: "ishaan@petconnect.dev",
    bio: "I'm a remote-working software engineer who works from home full time — meaning your pet is never alone! I have two dogs of my own and love welcoming new furry guests. Spacious 3BHK in Lajpat Nagar.",
    location: "Lajpat Nagar, Delhi",
    phone: "+91-9876541003",
    pricePerDay: 350,
    petsAccepted: ["dog", "rabbit"],
    experienceYears: 2,
    available: true,
    ratingAverage: 4.4,
    ratingCount: 21,
  },
];

const STRAY_REPORTS = [
  {
    type: "urgent",
    title: "Injured dog near bus stop",
    location: "Linking Road, Bandra West, Mumbai",
    description: "A small brown dog with a limping right hind leg has been spotted near the bus stop. Seems friendly and hungry. Needs immediate vet attention.",
    resolved: false,
    helpersCount: 2,
  },
  {
    type: "urgent",
    title: "Two abandoned kittens in a box",
    location: "MG Road, Koramangala, Bengaluru",
    description: "Two kittens, approximately 6 weeks old, found in a cardboard box behind the Café Coffee Day. Need immediate care and a foster home.",
    resolved: false,
    helpersCount: 5,
  },
  {
    type: "good",
    title: "Lost golden retriever found near metro",
    location: "Connaught Place, Central Delhi",
    description: "Golden retriever mix, no collar, spotted outside the metro station. Appears well-fed but lost — may be someone's pet. Friendly and calm.",
    resolved: true,
    helpersCount: 8,
  },
  {
    type: "urgent",
    title: "Wounded stray cat needs vet",
    location: "Anna Nagar, Chennai",
    description: "A white cat with a wounded ear near the vegetable market. Locals are feeding her regularly but she urgently needs a vet visit and wound care.",
    resolved: false,
    helpersCount: 3,
  },
  {
    type: "good",
    title: "Community feed for 3 strays under flyover",
    location: "Salt Lake Sector V, Kolkata",
    description: "Group of 3 stray dogs sleeping under the flyover. All appear healthy but very hungry. Looking for volunteers to organize a community feeding drive.",
    resolved: false,
    helpersCount: 12,
  },
  {
    type: "good",
    title: "Escaped pet parrot found",
    location: "Koregaon Park, Pune",
    description: "A parrot (green, ringneck) found perched on a balcony railing — possibly escaped from home. Very tame and hand-friendly. Taken to safe shelter.",
    resolved: true,
    helpersCount: 1,
  },
];

/* ================================================================
   MAIN SEED FUNCTION
   ================================================================ */
async function seed() {
  try {
    console.log("\n🌱  Connecting to MongoDB…");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected!\n");

    /* ── Users ───────────────────────────────────── */
    console.log("👤  Seeding users…");
    const userMap = {};
    for (const u of DEMO_USERS) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        const password = await hash(u.pw);
        user = await User.create({ name: u.name, email: u.email, password, role: u.role });
        log(`Created user: ${u.name} <${u.email}>`);
      } else {
        log(`Skipped (exists): ${u.email}`);
      }
      userMap[u.email] = user;
    }

    /* ── Pets ────────────────────────────────────── */
    console.log("\n🐾  Seeding pets…");
    const ownerUser = userMap["aarav@petconnect.dev"];
    const owner2    = userMap["priya@petconnect.dev"];
    const owner3    = userMap["kavya@petconnect.dev"];
    const owner4    = userMap["meera@petconnect.dev"];
    const petOwners = [ownerUser, owner2, owner3, owner4];
    for (let i = 0; i < PETS_DATA.length; i++) {
      const p = PETS_DATA[i];
      const exists = await Pet.findOne({ name: p.name, species: p.species });
      if (!exists) {
        await Pet.create({ ...p, owner: petOwners[i % petOwners.length]._id });
        log(`Created pet: ${p.name} (${p.species})`);
      } else {
        log(`Skipped (exists): ${p.name}`);
      }
    }

    /* ── Vet Profiles ────────────────────────────── */
    console.log("\n🩺  Seeding vet profiles…");
    for (const v of VETS_DATA) {
      const user = userMap[v.userEmail];
      if (!user) { console.warn(`  ⚠  No user for ${v.userEmail}`); continue; }
      const exists = await VetProfile.findOne({ user: user._id });
      if (!exists) {
        const { userEmail, ...rest } = v;
        await VetProfile.create({ user: user._id, ...rest });
        log(`Created vet profile: ${user.name}`);
      } else {
        log(`Skipped (exists): ${user.name} vet profile`);
      }
    }

    /* ── Caretakers ──────────────────────────────── */
    console.log("\n🏡  Seeding caretakers…");
    for (const c of CARETAKERS_DATA) {
      const user = userMap[c.userEmail];
      if (!user) { console.warn(`  ⚠  No user for ${c.userEmail}`); continue; }
      const exists = await Caretaker.findOne({ user: user._id });
      if (!exists) {
        const { userEmail, ...rest } = c;
        await Caretaker.create({ user: user._id, ...rest });
        log(`Created caretaker: ${user.name}`);
      } else {
        log(`Skipped (exists): ${user.name} caretaker profile`);
      }
    }

    /* ── Stray Reports ───────────────────────────── */
    console.log("\n🐕  Seeding stray reports…");
    const reporters = Object.values(userMap);
    for (let i = 0; i < STRAY_REPORTS.length; i++) {
      const r = STRAY_REPORTS[i];
      const exists = await StrayReport.findOne({ location: r.location });
      if (!exists) {
        await StrayReport.create({
          ...r,
          reportedBy: reporters[i % reporters.length]._id,
        });
        log(`Created stray report: ${r.location.split(",")[0]}`);
      } else {
        log(`Skipped (exists): ${r.location.split(",")[0]}`);
      }
    }

    console.log("\n✅  Seed complete!\n");
    console.log("─────────────────────────────────────────");
    console.log("  Demo Login (any of the below):");
    console.log("  Email: aarav@petconnect.dev | Password: Demo1234!");
    console.log("  Email: rohan@petconnect.dev | Password: Demo1234! (Vet)");
    console.log("  Email: sneha@petconnect.dev | Password: Demo1234! (Caretaker)");
    console.log("─────────────────────────────────────────\n");

  } catch (err) {
    console.error("❌  Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌  Disconnected from MongoDB.");
  }
}

seed();
