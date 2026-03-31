require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const VetProfile = require("../models/VetProfile");
const Pet = require("../models/Pet");

const DEMO_USERS = {
  owner: {
    name: "Aarav Owner",
    email: "owner@petconnect.demo",
    password: "Owner123!",
    role: "owner",
  },
  lover: {
    name: "Leya Lover",
    email: "lover@petconnect.demo",
    password: "Lover123!",
    role: "lover",
  },
  vet1: {
    name: "Dr. Priya Sharma",
    email: "vet1@petconnect.demo",
    password: "Vet12345!",
    role: "vet",
  },
  vet2: {
    name: "Dr. Arjun Rao",
    email: "vet2@petconnect.demo",
    password: "Vet12345!",
    role: "vet",
  },
};

const ensureUser = async ({ name, email, password, role }) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ name, email, password, role });
    return user;
  }

  let changed = false;
  if (user.name !== name) {
    user.name = name;
    changed = true;
  }
  if (user.role !== role) {
    user.role = role;
    changed = true;
  }

  if (changed) {
    await user.save();
  }

  return user;
};

const upsertVetProfile = async (user, profile) =>
  VetProfile.findOneAndUpdate(
    { user: user._id },
    {
      user: user._id,
      ...profile,
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

const upsertPet = async (owner, pet) =>
  Pet.findOneAndUpdate(
    { name: pet.name, owner: owner._id },
    {
      ...pet,
      owner: owner._id,
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

const seed = async () => {
  try {
    await connectDB();

    const owner = await ensureUser(DEMO_USERS.owner);
    const lover = await ensureUser(DEMO_USERS.lover);
    const vet1 = await ensureUser(DEMO_USERS.vet1);
    const vet2 = await ensureUser(DEMO_USERS.vet2);

    await upsertVetProfile(vet1, {
      clinicName: "Paws Care Clinic",
      specialty: "Small Animals",
      location: "Delhi",
      consultationFee: 600,
      experienceYears: 12,
      bio: "Experienced in diagnostics, wellness plans, and preventive care for companion animals.",
      phone: "+91-9000000001",
      languages: ["English", "Hindi"],
      available: true,
      ratingAverage: 4.9,
      ratingCount: 120,
    });

    await upsertVetProfile(vet2, {
      clinicName: "Companion Pet Center",
      specialty: "Exotic Pets",
      location: "Bangalore",
      consultationFee: 750,
      experienceYears: 8,
      bio: "Specialized in birds, rabbits, and exotic pet behavioral and nutritional care.",
      phone: "+91-9000000002",
      languages: ["English", "Kannada", "Hindi"],
      available: true,
      ratingAverage: 4.8,
      ratingCount: 95,
    });

    const demoPets = [
      {
        name: "Buddy",
        species: "dog",
        breed: "Golden Retriever",
        age: "2 years",
        status: "buy",
        price: 18000,
        description:
          "Friendly, vaccinated, and fully home-trained. Great with children and first-time pet parents.",
        imageURL: "https://images.unsplash.com/photo-1552053831-71594a27632d",
      },
      {
        name: "Whiskers",
        species: "cat",
        breed: "Persian",
        age: "1 year",
        status: "rent",
        price: 450,
        description:
          "Calm indoor companion available for short stays. Litter-trained and low maintenance.",
        imageURL:
          "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
      },
      {
        name: "Coco",
        species: "rabbit",
        breed: "Holland Lop",
        age: "10 months",
        status: "buy",
        price: 6500,
        description:
          "Healthy rabbit with soft temperament. Comes with starter diet chart.",
        imageURL:
          "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308",
      },
      {
        name: "Kiwi",
        species: "bird",
        breed: "Sun Conure",
        age: "3 years",
        status: "rent",
        price: 300,
        description:
          "Playful bird companion for a cheerful day. Includes feeding guide and basic care tips.",
        imageURL:
          "https://images.unsplash.com/photo-1444464666168-49d633b86797",
      },
      {
        name: "Max",
        species: "dog",
        breed: "Labrador",
        age: "4 years",
        status: "buy",
        price: 15000,
        description:
          "Well-socialized Labrador, excellent health record, and active routine.",
        imageURL:
          "https://images.unsplash.com/photo-1517849845537-4d257902454a",
      },
      {
        name: "Snowball",
        species: "rabbit",
        breed: "Mini Rex",
        age: "7 months",
        status: "rent",
        price: 250,
        description:
          "Gentle and adorable rabbit ideal for short-term companionship and therapy visits.",
        imageURL:
          "https://images.unsplash.com/photo-1592194996308-7b43878e84a6",
      },
    ];

    await Promise.all(demoPets.map((pet) => upsertPet(owner, pet)));

    console.log("✓ Demo data is ready");
    console.log("Demo accounts:");
    console.log("  Owner: owner@petconnect.demo / Owner123!");
    console.log("  Lover: lover@petconnect.demo / Lover123!");
    console.log("  Vet 1: vet1@petconnect.demo / Vet12345!");
    console.log("  Vet 2: vet2@petconnect.demo / Vet12345!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("✗ Seeding failed:", err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
