import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import type {
  College,
  PropertyStay,
  RoommateProfile,
  PropertyAgreement,
  PropertyBooking,
  LeaseClause,
} from "./src/types.js";

dotenv.config();

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// ----------------------------------------------------
// SEED DATA
// ----------------------------------------------------
const COLLEGES: College[] = [
  {
    id: "uc-berkeley",
    name: "University of California, Berkeley",
    shortName: "UC Berkeley",
    city: "Berkeley",
    state: "CA",
    lat: 37.8719,
    lng: -122.2585,
    mascot: "Golden Bears (Oski)",
    campusCenter: "Sproul Plaza & Sather Gate",
  },
  {
    id: "nyu-manhattan",
    name: "New York University",
    shortName: "NYU",
    city: "New York",
    state: "NY",
    lat: 40.7295,
    lng: -73.9965,
    mascot: "Bobcats",
    campusCenter: "Washington Square Park",
  },
  {
    id: "ut-austin",
    name: "University of Texas at Austin",
    shortName: "UT Austin",
    city: "Austin",
    state: "TX",
    lat: 30.2849,
    lng: -97.7341,
    mascot: "Longhorns (Bevo)",
    campusCenter: "UT Tower & Speedway Mall",
  },
  {
    id: "ucla-westwood",
    name: "University of California, Los Angeles",
    shortName: "UCLA",
    city: "Los Angeles",
    state: "CA",
    lat: 34.0689,
    lng: -118.4452,
    mascot: "Bruins (Joe Bruin)",
    campusCenter: "Royce Hall & Bruin Plaza",
  },
  {
    id: "harvard-cambridge",
    name: "Harvard University",
    shortName: "Harvard",
    city: "Cambridge",
    state: "MA",
    lat: 42.377,
    lng: -71.1167,
    mascot: "Crimson",
    campusCenter: "Harvard Yard & Smith Campus Center",
  },
  {
    id: "uw-seattle",
    name: "University of Washington",
    shortName: "UW Seattle",
    city: "Seattle",
    state: "WA",
    lat: 47.6553,
    lng: -122.3035,
    mascot: "Huskies (Harry)",
    campusCenter: "Red Square & The Quad",
  },
];

const PROPERTIES: PropertyStay[] = [
  // UC Berkeley
  {
    id: "stay-ucb-1",
    title: "The Collegiate Hub at Telegraph & Channing",
    type: "dorm",
    collegeId: "uc-berkeley",
    collegeName: "UC Berkeley",
    price: 950,
    pricePeriod: "month",
    distanceToCampusMiles: 0.2,
    walkTimeMinutes: 4,
    transitTimeMinutes: 2,
    shuttleRoute: "Bear Transit Line F (Stop 2)",
    safetyScore: 9.3,
    address: "2412 Telegraph Ave, Berkeley, CA 94704",
    lat: 37.8665,
    lng: -122.2588,
    rating: 4.88,
    reviewCount: 42,
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 2,
    bathrooms: 1,
    roomType: "Shared Double",
    amenities: [
      "1 Gbps Fiber WiFi",
      "Furnished (Desk + Bed)",
      "24/7 Silent Study Hall",
      "In-Unit Laundry",
      "All Utilities Included",
      "Campus Shuttle at Doorstep",
      "Keycard Security",
    ],
    verifiedStudentHost: true,
    depositRequired: 500,
    availableFrom: "Aug 15, 2026",
    leaseTerms: ["Academic Year (9mo)", "Fall Semester", "Spring Semester"],
    description:
      "Modern student co-living residence directly steps from Sather Gate and Telegraph dining. High-speed mesh Wi-Fi, collaborative whiteboard lounges, acoustic quiet study pods, and active student community.",
    hostName: "Marcus Vance (Alum '22)",
    hostRole: "Verified Property Manager",
    hostRating: 4.9,
    rules: [
      "Quiet hours 10 PM - 8 AM weeknights",
      "No smoking or vaping on premises",
      "Guest sign-in after midnight",
    ],
    isPopular: true,
  },
  {
    id: "stay-ucb-2",
    title: "Northside Academic Lofts (Near Engineering Quad)",
    type: "apartment",
    collegeId: "uc-berkeley",
    collegeName: "UC Berkeley",
    price: 1420,
    pricePeriod: "month",
    distanceToCampusMiles: 0.3,
    walkTimeMinutes: 6,
    transitTimeMinutes: 3,
    shuttleRoute: "Bear Transit Line P",
    safetyScore: 9.6,
    address: "1820 Hearst Ave, Berkeley, CA 94703",
    lat: 37.8738,
    lng: -122.2641,
    rating: 4.92,
    reviewCount: 29,
    images: [
      "https://images.unsplash.com/photo-1502005229762-ee1b2da97ba4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    roomType: "Private Room",
    amenities: [
      "Private Balcony",
      "Modern Kitchenette",
      "Bicycle Storage Vault",
      "Dishwasher",
      "Central Heating",
      "High-speed WiFi",
      "Smart Lock Access",
    ],
    verifiedStudentHost: true,
    depositRequired: 700,
    availableFrom: "Aug 20, 2026",
    leaseTerms: ["Full Year (12mo)", "Academic Year (9mo)"],
    description:
      "Tucked in Berkeley's tranquil Northside, beloved by EECS and Graduate students. Features hardwood floors, lots of natural light, and a short, peaceful walk to Soda Hall and Cory Hall.",
    hostName: "Elena Rostova",
    hostRole: "Northside Student Housing LLC",
    hostRating: 4.85,
    rules: [
      "Max 1 pet with deposit",
      "Recycling and compost separation required",
    ],
    isPopular: true,
  },
  {
    id: "stay-ucb-3",
    title: "Hotel Shattuck Plaza & Student Suites (Campus Extended Stay)",
    type: "hotel",
    collegeId: "uc-berkeley",
    collegeName: "UC Berkeley",
    price: 125,
    pricePeriod: "night",
    distanceToCampusMiles: 0.5,
    walkTimeMinutes: 9,
    transitTimeMinutes: 4,
    shuttleRoute: "Downtown Berkeley BART / Line 51B",
    safetyScore: 9.4,
    address: "2086 Allston Way, Berkeley, CA 94704",
    lat: 37.8688,
    lng: -122.2683,
    rating: 4.79,
    reviewCount: 88,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    roomType: "Hotel Suite",
    amenities: [
      "Daily Housekeeping",
      "Hot Breakfast Buffet",
      "24/7 Concierge",
      "Fitness Center",
      "Dedicated Work Desk",
      "High-speed Hotel WiFi",
      "Flexible Move-In Dates",
    ],
    verifiedStudentHost: true,
    depositRequired: 150,
    availableFrom: "Immediate",
    leaseTerms: ["Short-term Hotel (1-30 days)", "Parent Orientation Rate"],
    description:
      "Premier hotel offering student semester transitional suites, visiting parent discounts, and orientation week stays. Located next to Downtown Berkeley BART with rapid access to the West Gate.",
    hostName: "Hospitality Management",
    hostRole: "Boutique Hotel Partner",
    hostRating: 4.9,
    rules: [
      "Standard hotel check-in 3 PM, check-out 11 AM",
      "Quiet hours after 10 PM",
    ],
    isPopular: false,
  },
  {
    id: "stay-ucb-4",
    title: "Panoramic Berkeley Sublet (Southside Studio)",
    type: "sublet",
    collegeId: "uc-berkeley",
    collegeName: "UC Berkeley",
    price: 1100,
    pricePeriod: "month",
    distanceToCampusMiles: 0.4,
    walkTimeMinutes: 7,
    transitTimeMinutes: 3,
    shuttleRoute: "Line 51B / Bear Transit",
    safetyScore: 9.1,
    address: "2539 Telegraph Ave, Berkeley, CA 94704",
    lat: 37.8643,
    lng: -122.2592,
    rating: 4.82,
    reviewCount: 16,
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    roomType: "Studio",
    amenities: [
      "Rooftop Deck overlooking SF Bay",
      "Space-saving Murphy Bed",
      "Full Induction Kitchen",
      "Bike Lockers",
      "Study Nooks",
    ],
    verifiedStudentHost: true,
    depositRequired: 400,
    availableFrom: "Sep 01, 2026",
    leaseTerms: ["Fall Semester Sublease", "Spring Semester Sublease"],
    description:
      "Subletting my cozy, energy-efficient micro-studio for the upcoming semester while I study abroad in Zurich. Fully furnished with monitor, ergonomic chair, and roof deck access.",
    hostName: "Julian Chen (Senior Econ)",
    hostRole: "Student Subletter",
    hostRating: 5.0,
    rules: ["Non-smokers only", "Respect neighbor quiet hours"],
  },

  // NYU Manhattan
  {
    id: "stay-nyu-1",
    title: "Greenwich Village Scholar Residences",
    type: "dorm",
    collegeId: "nyu-manhattan",
    collegeName: "NYU",
    price: 1350,
    pricePeriod: "month",
    distanceToCampusMiles: 0.15,
    walkTimeMinutes: 3,
    transitTimeMinutes: 1,
    shuttleRoute: "NYU Route A/B Bus",
    safetyScore: 9.5,
    address: "70 Washington Square South, New York, NY 10012",
    lat: 40.7299,
    lng: -73.9972,
    rating: 4.89,
    reviewCount: 54,
    images: [
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 2,
    bathrooms: 1,
    roomType: "Shared Double",
    amenities: [
      "Direct View of Washington Sq Park",
      "Package Locker Room",
      "24/7 Doorman",
      "Soundproof Practice Rooms",
      "Subway (A,C,E,B,D,F,M) 1 min away",
    ],
    verifiedStudentHost: true,
    depositRequired: 650,
    availableFrom: "Aug 25, 2026",
    leaseTerms: ["Academic Year (9mo)", "Full Year (12mo)"],
    description:
      "Historic brownstone conversion right on the park. Unbeatable proximity to Bobst Library, Stern School of Business, and Tisch School of the Arts.",
    hostName: "NYU Off-Campus Alliance",
    hostRole: "Campus Verified Partner",
    hostRating: 4.95,
    rules: ["Quiet hours after 11 PM", "Keycards mandatory for entry"],
    isPopular: true,
  },
  {
    id: "stay-nyu-2",
    title: "The Washington Mews Boutique Stay & Hotel",
    type: "hotel",
    collegeId: "nyu-manhattan",
    collegeName: "NYU",
    price: 185,
    pricePeriod: "night",
    distanceToCampusMiles: 0.2,
    walkTimeMinutes: 4,
    transitTimeMinutes: 2,
    shuttleRoute: "W 4th St Transit Hub",
    safetyScore: 9.7,
    address: "1 Fifth Avenue, New York, NY 10003",
    lat: 40.7322,
    lng: -73.9961,
    rating: 4.94,
    reviewCount: 110,
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    roomType: "Hotel Suite",
    amenities: [
      "Art Deco Design",
      "Express Room Service",
      "High-speed WiFi",
      "Student Family Welcome Discount",
      "Rooftop View of Empire State",
    ],
    verifiedStudentHost: true,
    depositRequired: 200,
    availableFrom: "Immediate",
    leaseTerms: ["Short-term Hotel (1-14 days)", "Orientation Week Special"],
    description:
      "Charming Greenwich Village boutique hotel catering to NYU students, visiting parents, and alumni attending university colloquiums.",
    hostName: "Fifth Ave Hospitality Group",
    hostRole: "Verified Hotel Partner",
    hostRating: 4.92,
    rules: ["Standard hotel guest registration"],
  },
  {
    id: "stay-nyu-3",
    title: "East Village Student Co-Living Brownstone",
    type: "apartment",
    collegeId: "nyu-manhattan",
    collegeName: "NYU",
    price: 1550,
    pricePeriod: "month",
    distanceToCampusMiles: 0.6,
    walkTimeMinutes: 11,
    transitTimeMinutes: 6,
    shuttleRoute: "NYU Route C",
    safetyScore: 9.2,
    address: "312 E 10th St, New York, NY 10009",
    lat: 40.7282,
    lng: -73.9825,
    rating: 4.75,
    reviewCount: 31,
    images: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 3,
    bathrooms: 2,
    roomType: "Private Room",
    amenities: [
      "Private Room with Key",
      "Shared Designer Kitchen",
      "Backyard Garden",
      "Weekly Professional Cleaning",
      "All Utilities Included",
    ],
    verifiedStudentHost: true,
    depositRequired: 750,
    availableFrom: "Sep 01, 2026",
    leaseTerms: ["Academic Year (9mo)", "Full Year (12mo)"],
    description:
      "Vibrant East Village life with peaceful study conditions. Surrounded by independent cafes, bakeries, and only 10 minutes walk to Astor Place and Silver Center.",
    hostName: "Liam Gallagher",
    hostRole: "Tisch Alum & Landlord",
    hostRating: 4.88,
    rules: ["No loud parties inside, quiet garden after 9 PM"],
  },

  // UT Austin
  {
    id: "stay-uta-1",
    title: "West Campus Longhorn Quad Living",
    type: "dorm",
    collegeId: "ut-austin",
    collegeName: "UT Austin",
    price: 820,
    pricePeriod: "month",
    distanceToCampusMiles: 0.25,
    walkTimeMinutes: 5,
    transitTimeMinutes: 2,
    shuttleRoute: "UT Shuttle 642 West Campus",
    safetyScore: 9.4,
    address: "2400 Rio Grande St, Austin, TX 78705",
    lat: 30.2882,
    lng: -97.7441,
    rating: 4.85,
    reviewCount: 47,
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 2,
    bathrooms: 2,
    roomType: "Shared Double",
    amenities: [
      "Resort Style Pool & Sundeck",
      "Study Pavilions with Macs & PCs",
      "Coffee Bar (Free Cold Brew)",
      "Garaged Parking Available",
      "High-speed WiFi",
    ],
    verifiedStudentHost: true,
    depositRequired: 300,
    availableFrom: "Aug 15, 2026",
    leaseTerms: ["Academic Year (9mo)", "Full Year (12mo)"],
    description:
      "The quintessential West Campus experience. Walk to Speedway, McCombs Business School, and Gregory Gym in under 6 minutes. Active, friendly student community.",
    hostName: "West Campus Properties",
    hostRole: "Student Housing Management",
    hostRating: 4.8,
    rules: ["Pool closes 10 PM on weekdays", "Designated smoking area only"],
    isPopular: true,
  },
  {
    id: "stay-uta-2",
    title: "AT&T Hotel and Conference Center (Campus Stay)",
    type: "hotel",
    collegeId: "ut-austin",
    collegeName: "UT Austin",
    price: 140,
    pricePeriod: "night",
    distanceToCampusMiles: 0.1,
    walkTimeMinutes: 2,
    transitTimeMinutes: 1,
    shuttleRoute: "Direct On-Campus",
    safetyScore: 9.9,
    address: "1900 University Ave, Austin, TX 78705",
    lat: 30.2815,
    lng: -97.7397,
    rating: 4.95,
    reviewCount: 140,
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    roomType: "Hotel Suite",
    amenities: [
      "Located inside University grounds",
      "Heated Courtyard Pool",
      "On-site Restaurants & Barista",
      "Fast Campus WiFi connection",
      "Early Move-in Luggage Storage",
    ],
    verifiedStudentHost: true,
    depositRequired: 100,
    availableFrom: "Immediate",
    leaseTerms: ["Nightly Hotel", "Weekly Orientation Stay"],
    description:
      "Directly adjacent to the McCombs School of Business. The premier place for visiting parents, admitted students attending orientation, and game weekend stays.",
    hostName: "University Hospitality Services",
    hostRole: "Official Campus Partner",
    hostRating: 4.98,
    rules: ["Standard hotel guest rules"],
    isPopular: true,
  },

  // UCLA Westwood
  {
    id: "stay-ucla-1",
    title: "Westwood Village Collegiate Haven",
    type: "apartment",
    collegeId: "ucla-westwood",
    collegeName: "UCLA",
    price: 1280,
    pricePeriod: "month",
    distanceToCampusMiles: 0.3,
    walkTimeMinutes: 6,
    transitTimeMinutes: 3,
    shuttleRoute: "BruinBus Campus Express",
    safetyScore: 9.6,
    address: "525 Midvale Ave, Los Angeles, CA 90024",
    lat: 34.0645,
    lng: -118.4498,
    rating: 4.91,
    reviewCount: 38,
    images: [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 2,
    bathrooms: 2,
    roomType: "Private Room",
    amenities: [
      "Central AC & Heating",
      "Subterranean Gated Parking",
      "Gym & Yoga Studio",
      "Walk to Target & Trader Joe's",
      "High-speed Internet",
    ],
    verifiedStudentHost: true,
    depositRequired: 600,
    availableFrom: "Sep 15, 2026",
    leaseTerms: ["Academic Year (9mo)", "Full Year (12mo)"],
    description:
      "Sun-drenched Mediterranean style apartments situated on Midvale, the heart of UCLA off-campus student life. Quick walk up the hill to Ackerman Union and Pauley Pavilion.",
    hostName: "Midvale Student Group",
    hostRole: "Verified Housing Partner",
    hostRating: 4.9,
    rules: ["Quiet hours after 10 PM on class nights"],
    isPopular: true,
  },
  {
    id: "stay-ucla-2",
    title: "Luskin Hotel & Conference Center (On-Campus Stay)",
    type: "hotel",
    collegeId: "ucla-westwood",
    collegeName: "UCLA",
    price: 165,
    pricePeriod: "night",
    distanceToCampusMiles: 0.05,
    walkTimeMinutes: 1,
    transitTimeMinutes: 1,
    shuttleRoute: "Heart of UCLA Campus",
    safetyScore: 9.9,
    address: "425 Westwood Plaza, Los Angeles, CA 90095",
    lat: 34.0697,
    lng: -118.4443,
    rating: 4.96,
    reviewCount: 92,
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    roomType: "Hotel Suite",
    amenities: [
      "Zero Commute to Campus Lectures",
      "Plateia Mediterranean Dining",
      "In-room Nespresso & Study Desk",
      "Fitness Center Access",
      "Discounted Rates for Parents & Transfers",
    ],
    verifiedStudentHost: true,
    depositRequired: 150,
    availableFrom: "Immediate",
    leaseTerms: ["Nightly Hotel", "Move-in Transition (1-14 days)"],
    description:
      "Set right in the middle of UCLA campus across from Drake Stadium and Pauley Pavilion. Luxurious, modern comfort for visiting families and students securing off-campus leases.",
    hostName: "Luskin Hospitality",
    hostRole: "Official Campus Hotel",
    hostRating: 4.98,
    rules: ["Smoke-free campus property"],
  },

  // Harvard Cambridge
  {
    id: "stay-harv-1",
    title: "Harvard Square Historic Scholar House",
    type: "sublet",
    collegeId: "harvard-cambridge",
    collegeName: "Harvard",
    price: 1200,
    pricePeriod: "month",
    distanceToCampusMiles: 0.2,
    walkTimeMinutes: 4,
    transitTimeMinutes: 2,
    shuttleRoute: "Harvard Shuttle Red Line",
    safetyScore: 9.8,
    address: "14 Story St, Cambridge, MA 02138",
    lat: 42.3734,
    lng: -71.1219,
    rating: 4.9,
    reviewCount: 22,
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    roomType: "Private Room",
    amenities: [
      "Fireplace & Library Bookshelves",
      "High-speed Fiber WiFi",
      "Radiant Heat",
      "Bicycle Storage",
      "Washer/Dryer in Basement",
    ],
    verifiedStudentHost: true,
    depositRequired: 500,
    availableFrom: "Sep 01, 2026",
    leaseTerms: ["Fall Semester Sublease", "Academic Year (9mo)"],
    description:
      "Atmospheric Victorian student residence right by Harvard Square, GSD, and Law School. Peaceful book-lined rooms with serene garden views.",
    hostName: "Clara Hawthorne (PhD Candidate)",
    hostRole: "Graduate Student Host",
    hostRating: 4.95,
    rules: ["Strict quiet study atmosphere"],
  },

  // UW Seattle
  {
    id: "stay-uw-1",
    title: "The U-District Ave Modern Pods & Lofts",
    type: "dorm",
    collegeId: "uw-seattle",
    collegeName: "UW Seattle",
    price: 890,
    pricePeriod: "month",
    distanceToCampusMiles: 0.35,
    walkTimeMinutes: 6,
    transitTimeMinutes: 2,
    shuttleRoute: "UW NightRide / Link Light Rail",
    safetyScore: 9.1,
    address: "4512 University Way NE, Seattle, WA 98105",
    lat: 47.6618,
    lng: -122.3131,
    rating: 4.87,
    reviewCount: 35,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502005229762-ee1b2da97ba4?auto=format&fit=crop&w=1000&q=80",
    ],
    bedrooms: 2,
    bathrooms: 1,
    roomType: "Shared Double",
    amenities: [
      "Views of Mt. Rainier from Roof",
      "Sound-damped Study Pods",
      "Keyless Mobile Access",
      "Commercial Espresso Machine",
      "Package Delivery Hub",
    ],
    verifiedStudentHost: true,
    depositRequired: 350,
    availableFrom: "Sep 20, 2026",
    leaseTerms: ["Academic Year (9mo)", "Full Year (12mo)"],
    description:
      "Right in the heart of 'The Ave' with boba shops, international street food, and a short walk across 15th Ave into UW Red Square and Suzzallo Library.",
    hostName: "Cascadia Student Residences",
    hostRole: "Verified Property Partner",
    hostRating: 4.89,
    rules: ["Quiet hours 10 PM - 7 AM daily"],
    isPopular: true,
  },
];

const ROOMMATES: RoommateProfile[] = [
  {
    id: "rm-1",
    name: "Aria Thorne",
    age: 20,
    gender: "Female",
    collegeId: "uc-berkeley",
    collegeName: "UC Berkeley",
    major: "Computer Science & Data Science",
    graduationYear: 2027,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    bio: "Junior EECS major. Big fan of hackathons, matcha lattes, and clean living spaces! When I'm not coding in Soda Hall, I'm at RSF or cooking pasta.",
    sleepHabit: "night_owl",
    cleanlinessLevel: 5,
    noiseTolerance: "moderate",
    guestPolicy: "weekend_only",
    budgetMin: 800,
    budgetMax: 1300,
    preferredRoomType: "private",
    lifestyleTags: ["Non-smoker", "Gym enthusiast", "Quiet at night", "Boba lover", "Pre-midterm study focus"],
    verifiedStudent: true,
    targetStayId: "stay-ucb-1",
    contactEmail: "aria.t@berkeley.edu",
    socialHandle: "@aria_codes",
  },
  {
    id: "rm-2",
    name: "Devon Miller",
    age: 21,
    gender: "Male",
    collegeId: "uc-berkeley",
    collegeName: "UC Berkeley",
    major: "Economics & Public Policy",
    graduationYear: 2027,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    bio: "Pre-law junior. I keep common areas tidy and usually study in the library until late afternoon. Enjoy weekend hikes in Tilden and intramural soccer.",
    sleepHabit: "early_bird",
    cleanlinessLevel: 4,
    noiseTolerance: "quiet_library",
    guestPolicy: "no_overnights",
    budgetMin: 900,
    budgetMax: 1500,
    preferredRoomType: "any",
    lifestyleTags: ["Early riser", "Non-smoker", "Soccer", "Studious", "Meal prepper"],
    verifiedStudent: true,
    targetStayId: "stay-ucb-2",
    contactEmail: "devon.m@berkeley.edu",
    socialHandle: "@devon_cal",
  },
  {
    id: "rm-3",
    name: "Maya Lin",
    age: 19,
    gender: "Female",
    collegeId: "nyu-manhattan",
    collegeName: "NYU",
    major: "Interactive Media & Design (Tisch)",
    graduationYear: 2028,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    bio: "Sophomore at Tisch. I love photography, indie films, and discovering jazz cafes around Greenwich Village. Very respectful of boundaries and sleep schedules!",
    sleepHabit: "flexible",
    cleanlinessLevel: 4,
    noiseTolerance: "moderate",
    guestPolicy: "weekend_only",
    budgetMin: 1100,
    budgetMax: 1600,
    preferredRoomType: "shared",
    lifestyleTags: ["Artistic", "Plant parent", "Non-smoker", "Coffee addict", "Weekend explorer"],
    verifiedStudent: true,
    targetStayId: "stay-nyu-1",
    contactEmail: "maya.lin@nyu.edu",
    socialHandle: "@mayalin_art",
  },
  {
    id: "rm-4",
    name: "Jordan Brooks",
    age: 20,
    gender: "Non-binary",
    collegeId: "ut-austin",
    collegeName: "UT Austin",
    major: "Biomedical Engineering",
    graduationYear: 2027,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Pre-med BME sophomore. Spends long hours in research labs, so home is my calm sanctuary for rest and recharging. Friendly, communicative, and very organized.",
    sleepHabit: "night_owl",
    cleanlinessLevel: 5,
    noiseTolerance: "quiet_library",
    guestPolicy: "no_overnights",
    budgetMin: 700,
    budgetMax: 1100,
    preferredRoomType: "any",
    lifestyleTags: ["Pre-med", "Super clean", "Vegetarian", "Quiet hours", "Tea enthusiast"],
    verifiedStudent: true,
    targetStayId: "stay-uta-1",
    contactEmail: "jordan.b@utexas.edu",
    socialHandle: "@jordan_bme",
  },
  {
    id: "rm-5",
    name: "Chloe Dupont",
    age: 21,
    gender: "Female",
    collegeId: "ucla-westwood",
    collegeName: "UCLA",
    major: "Psychobiology",
    graduationYear: 2026,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    bio: "Senior Bruin! Love beach sunsets in Santa Monica, thrift shopping, and pilates. Looking for a dependable, communicative roommate to co-lease near campus.",
    sleepHabit: "early_bird",
    cleanlinessLevel: 4,
    noiseTolerance: "moderate",
    guestPolicy: "open",
    budgetMin: 1000,
    budgetMax: 1450,
    preferredRoomType: "shared",
    lifestyleTags: ["Morning runner", "Non-smoker", "Friendly", "Bakes cookies", "Clean bathroom"],
    verifiedStudent: true,
    targetStayId: "stay-ucla-1",
    contactEmail: "chloe.dupont@ucla.edu",
    socialHandle: "@chloedupont_la",
  },
  {
    id: "rm-6",
    name: "Kenji Sato",
    age: 22,
    gender: "Male",
    collegeId: "uw-seattle",
    collegeName: "UW Seattle",
    major: "Informatics & AI",
    graduationYear: 2026,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    bio: "Senior Informatics major. Big gamer and outdoor enthusiast (skiing in Stevens Pass). Very chill, always wash dishes immediately after eating.",
    sleepHabit: "night_owl",
    cleanlinessLevel: 4,
    noiseTolerance: "moderate",
    guestPolicy: "weekend_only",
    budgetMin: 750,
    budgetMax: 1100,
    preferredRoomType: "private",
    lifestyleTags: ["Gamer (Headphones)", "Skier", "Tech nerd", "Dishes right away", "Non-smoker"],
    verifiedStudent: true,
    targetStayId: "stay-uw-1",
    contactEmail: "ksato@uw.edu",
    socialHandle: "@kenjisato_dev",
  },
];

const STANDARD_CLAUSES: LeaseClause[] = [
  {
    id: "clause-1",
    title: "1. Rent Payment & Proration",
    text: "Tenant agrees to pay rent on or before the 1st day of each calendar month. If the lease term commences mid-month, rent shall be prorated accordingly. No late fees shall accrue until after the 5th day of the grace period.",
    plainEnglishSummary: "Rent is due on the 1st with a 5-day grace period. Moving in mid-month is automatically prorated.",
    category: "rent",
    isImportant: true,
  },
  {
    id: "clause-2",
    title: "2. Security Deposit Protection & Return",
    text: "The security deposit shall be held in an escrow student tenant account. Normal wear and tear shall not be deducted. Landlord must provide an itemized repair statement within 21 days of move-out.",
    plainEnglishSummary: "Your deposit is safeguarded in escrow. Landlord cannot take deductions for normal wear & tear, and must refund within 21 days.",
    category: "deposit",
    isImportant: true,
  },
  {
    id: "clause-3",
    title: "3. Academic Quiet Hours & Study Environment",
    text: "Quiet hours are observed from 10:00 PM to 8:00 AM on Sunday through Thursday, and 12:00 AM to 8:00 AM on Friday and Saturday, ensuring an uninterrupted collegiate academic study and rest atmosphere.",
    plainEnglishSummary: "Quiet hours enforce peace for sleep and exam prep (10 PM weeknights, midnight weekends).",
    category: "quiet_hours",
  },
  {
    id: "clause-4",
    title: "4. Student Sublease & Roommate Replacement Right",
    text: "Tenants maintain the legal right to sublease during summer or study-abroad semesters, or replace a matched roommate, subject to standard verified student background and landlord sign-off which shall not be unreasonably withheld.",
    plainEnglishSummary: "You can sublet your spot during study-abroad or summer without breaking your lease, as long as the replacement is a verified student.",
    category: "subleasing",
    isImportant: true,
  },
  {
    id: "clause-5",
    title: "5. High-Speed Utilities & Maintenance",
    text: "High-speed broadband internet (minimum 500 Mbps), water, trash, and heating are covered by the property. Emergency maintenance response is guaranteed within 24 hours.",
    plainEnglishSummary: "High-speed WiFi, heating, and water are included. Emergency repairs are attended within 24 hours.",
    category: "utilities",
  },
];

// In-memory state for agreements and bookings
const userAgreements: PropertyAgreement[] = [
  {
    id: "agr-demo-1",
    propertyId: "stay-ucb-1",
    propertyTitle: "The Collegiate Hub at Telegraph & Channing",
    propertyAddress: "2412 Telegraph Ave, Berkeley, CA 94704",
    collegeName: "UC Berkeley",
    tenantName: "Alex Rivera",
    tenantEmail: "alex.rivera@berkeley.edu",
    tenantPhone: "+1 (510) 555-0192",
    tenantStudentId: "CAL-3829104",
    rentSharePercentage: 50,
    coTenantName: "Aria Thorne",
    coTenantEmail: "aria.t@berkeley.edu",
    monthlyRent: 950,
    securityDeposit: 500,
    startDate: "2026-08-15",
    endDate: "2027-05-20",
    leaseType: "Student Co-Living",
    termsAccepted: true,
    tenantSignature: "Alex Rivera [E-Signed CAL-3829104]",
    signedAt: "2026-08-01T14:22:00Z",
    landlordSignature: "Marcus Vance, Collegiate Hub LLC",
    status: "signed",
    clauses: STANDARD_CLAUSES,
  },
];

const userBookings: PropertyBooking[] = [
  {
    id: "bk-demo-101",
    propertyId: "stay-ucb-1",
    propertyTitle: "The Collegiate Hub at Telegraph & Channing",
    propertyImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
    propertyAddress: "2412 Telegraph Ave, Berkeley, CA 94704",
    collegeName: "UC Berkeley",
    roomType: "Shared Double (Split 50%)",
    tenantName: "Alex Rivera",
    tenantEmail: "alex.rivera@berkeley.edu",
    tenantPhone: "+1 (510) 555-0192",
    checkInDate: "2026-08-15",
    checkOutDate: "2027-05-20",
    stayDuration: "Fall 2026 - Spring 2027",
    guestsCount: 1,
    splitWithRoommate: {
      roommateId: "rm-1",
      roommateName: "Aria Thorne",
      roommateEmail: "aria.t@berkeley.edu",
      sharePercent: 50,
      amount: 475,
    },
    baseRent: 950,
    serviceFee: 35,
    depositFee: 500,
    totalAmount: 1485,
    status: "confirmed",
    agreementId: "agr-demo-1",
    accessCode: "KEY-7824#",
    wifiCredentials: { ssid: "CollegiateHub-Student-5G", pass: "GoBears2026!" },
    createdAt: "2026-08-01T14:25:00Z",
  },
];

// Helper: automatic compatibility calculation
function calculateMatchScore(
  userHabit: 'early_bird' | 'night_owl' | 'flexible',
  userCleanliness: number,
  userNoise: 'quiet_library' | 'moderate' | 'social_active',
  userBudgetMin: number,
  userBudgetMax: number,
  userTags: string[],
  roommate: RoommateProfile
): { score: number; reasons: string[]; frictionPoints: string[]; icebreaker: string } {
  let score = 70; // baseline
  const reasons: string[] = [];
  const frictionPoints: string[] = [];

  // Sleep schedule
  if (userHabit === roommate.sleepHabit || userHabit === 'flexible' || roommate.sleepHabit === 'flexible') {
    score += 12;
    reasons.push(`Synchronized sleep rhythms (${userHabit.replace('_', ' ')} / ${roommate.sleepHabit.replace('_', ' ')})`);
  } else {
    score -= 10;
    frictionPoints.push(`Different sleep clocks: early bird vs night owl`);
  }

  // Cleanliness
  const cleanDiff = Math.abs(userCleanliness - roommate.cleanlinessLevel);
  if (cleanDiff === 0) {
    score += 10;
    reasons.push(`Identical cleanliness standards (Level ${userCleanliness}/5)`);
  } else if (cleanDiff === 1) {
    score += 5;
    reasons.push(`Very close tidiness expectations`);
  } else {
    score -= 12;
    frictionPoints.push(`Noticeable difference in room tidiness standards`);
  }

  // Noise tolerance
  if (userNoise === roommate.noiseTolerance) {
    score += 8;
    reasons.push(`Matched study noise environment (${userNoise.replace('_', ' ')})`);
  } else if (userNoise === 'social_active' && roommate.noiseTolerance === 'quiet_library') {
    score -= 10;
    frictionPoints.push(`Contrast between quiet library study vs social hosting`);
  }

  // Budget overlap
  const overlapMin = Math.max(userBudgetMin, roommate.budgetMin);
  const overlapMax = Math.min(userBudgetMax, roommate.budgetMax);
  if (overlapMax >= overlapMin) {
    score += 8;
    reasons.push(`Compatible monthly budget overlap ($${overlapMin} - $${overlapMax})`);
  } else {
    score -= 15;
    frictionPoints.push(`Budget ranges don't fully intersect`);
  }

  // Common lifestyle tags
  const sharedTags = userTags.filter((t) => roommate.lifestyleTags.includes(t));
  if (sharedTags.length > 0) {
    score += Math.min(sharedTags.length * 3, 10);
    reasons.push(`Shared lifestyles: ${sharedTags.join(', ')}`);
  }

  // Clamp 45 - 98
  score = Math.max(45, Math.min(98, score));

  const icebreaker = `Hey ${roommate.name.split(' ')[0]}! Saw your profile for ${roommate.collegeName}—looks like we both appreciate ${
    sharedTags[0] || 'a good study rhythm'
  } and are looking around the same budget. Are you looking to co-lease?`;

  return { score, reasons, frictionPoints, icebreaker };
}

// ----------------------------------------------------
// SERVER BOOTSTRAP
// ----------------------------------------------------
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API ROUTES

  // Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Colleges
  app.get("/api/colleges", (req, res) => {
    res.json(COLLEGES);
  });

  // Properties / Stays
  app.get("/api/properties", (req, res) => {
    let list = [...PROPERTIES];
    const { collegeId, type, maxDistance, maxPrice, search } = req.query;

    if (collegeId && typeof collegeId === "string") {
      list = list.filter((p) => p.collegeId === collegeId);
    }
    if (type && typeof type === "string" && type !== "all") {
      list = list.filter((p) => p.type === type);
    }
    if (maxDistance && !isNaN(Number(maxDistance))) {
      list = list.filter((p) => p.distanceToCampusMiles <= Number(maxDistance));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      list = list.filter((p) => p.price <= Number(maxPrice));
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.amenities.some((a) => a.toLowerCase().includes(q))
      );
    }

    res.json(list);
  });

  // Single Property
  app.get("/api/properties/:id", (req, res) => {
    const prop = PROPERTIES.find((p) => p.id === req.params.id);
    if (!prop) {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    res.json(prop);
  });

  // Roommates
  app.get("/api/roommates", (req, res) => {
    let list = [...ROOMMATES];
    const { collegeId } = req.query;
    if (collegeId && typeof collegeId === "string") {
      list = list.filter((r) => r.collegeId === collegeId);
    }
    res.json(list);
  });

  // Automatic Roommate Matching
  app.post("/api/roommates/match", async (req, res) => {
    const {
      sleepHabit = "flexible",
      cleanlinessLevel = 4,
      noiseTolerance = "moderate",
      budgetMin = 800,
      budgetMax = 1500,
      lifestyleTags = [],
      collegeId,
    } = req.body;

    let targetRoommates = [...ROOMMATES];
    if (collegeId) {
      targetRoommates = targetRoommates.filter((r) => r.collegeId === collegeId);
    }

    const matches = targetRoommates.map((rm) => {
      const result = calculateMatchScore(
        sleepHabit,
        Number(cleanlinessLevel),
        noiseTolerance,
        Number(budgetMin),
        Number(budgetMax),
        Array.isArray(lifestyleTags) ? lifestyleTags : [],
        rm
      );
      return {
        roommate: rm,
        compatibilityScore: result.score,
        reasons: result.reasons,
        frictionPoints: result.frictionPoints,
        icebreaker: result.icebreaker,
      };
    });

    // Sort highest score first
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json(matches);
  });

  // AI Deep Dive Roommate Compatibility via Gemini
  app.post("/api/ai/match-deep-dive", async (req, res) => {
    const { userProfile, roommateProfile, compatibilityScore } = req.body;

    const gemini = getGeminiClient();
    if (!gemini) {
      // Fallback if no API key
      res.json({
        aiExplanation: `Based on algorithmic analysis, you and ${roommateProfile?.name || 'this student'} share a solid ${compatibilityScore}% compatibility rating with aligned quiet-hour habits and budget parameters. Communication regarding kitchen upkeep and weekend social time will ensure a smooth, harmonious semester!`,
        icebreakers: [
          `Hey ${roommateProfile?.name?.split(' ')[0]}! Are you looking for a place near campus for the upcoming term?`,
          `Hi! I saw your profile and we have super similar study hours. Have you checked out any campus-adjacent apartments yet?`
        ],
        harmonyTips: [
          "Establish shared refrigerator shelves on Move-in Day 1.",
          "Agree on designated study hours before midterm exam weeks.",
        ]
      });
      return;
    }

    try {
      const prompt = `You are CampusStay's expert collegiate roommate counselor.
Analyze compatibility between these two university students:
Student A (Current User):
- Major: ${userProfile.major || "Undecided"}
- Sleep habit: ${userProfile.sleepHabit}
- Cleanliness (1-5): ${userProfile.cleanlinessLevel}
- Noise tolerance: ${userProfile.noiseTolerance}
- Budget: $${userProfile.budgetMin} - $${userProfile.budgetMax}
- Lifestyles: ${userProfile.lifestyleTags?.join(", ")}

Student B:
- Name: ${roommateProfile.name}
- Major: ${roommateProfile.major}
- Sleep habit: ${roommateProfile.sleepHabit}
- Cleanliness (1-5): ${roommateProfile.cleanlinessLevel}
- Noise tolerance: ${roommateProfile.noiseTolerance}
- Bio: ${roommateProfile.bio}
- Lifestyles: ${roommateProfile.lifestyleTags?.join(", ")}

Compatibility Score: ${compatibilityScore}%

Provide a structured, helpful, student-friendly JSON response with:
{
  "aiExplanation": "A 2-3 sentence engaging analysis of why they make great collegiate co-tenants and where their strengths lie",
  "harmonyTips": ["tip 1 for living peacefully together", "tip 2 for preventing conflict"],
  "icebreakers": ["Fun, natural college DM opener 1", "Direct, friendly apartment inquiry DM opener 2"]
}
Only return valid JSON, no markdown codeblocks or extra commentary.`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      const rawText = response.text || "";
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini match error:", err?.message || err);
      res.json({
        aiExplanation: `You and ${roommateProfile?.name || 'this roommate'} have high lifestyle synergy with matched habits, supporting a low-stress study and living environment.`,
        harmonyTips: [
          "Create a shared cleaning rotation for kitchen & bathroom.",
          "Check in on upcoming exam dates to respect quiet hours.",
        ],
        icebreakers: [
          `Hey ${roommateProfile?.name?.split(' ')[0]}, let's check out student listings together!`
        ]
      });
    }
  });

  // AI Lease Clause Assistant & Student Protection via Gemini
  app.post("/api/ai/analyze-clause", async (req, res) => {
    const { clauseText, clauseTitle, question } = req.body;

    const gemini = getGeminiClient();
    if (!gemini) {
      res.json({
        studentSummary: "This clause outlines your tenant rights and obligations. Standard provisions include timely rent payments, deposit protection in escrow, and reasonable quiet hours.",
        cautions: [
          "Always confirm that security deposit refund terms don't exceed 21-30 days post move-out.",
          "Verify that utility responsibility is clearly divided in writing."
        ],
        fairnessScore: "Fair & Student-Friendly (9/10)",
        answer: question ? `Based on typical student lease practices: ${question} is protected under standard habitability guidelines.` : "Clause adheres to student housing guidelines."
      });
      return;
    }

    try {
      const prompt = `You are CampusStay's Legal & Lease Advisor for college students.
Analyze this property agreement clause:
Title: ${clauseTitle}
Clause Text: "${clauseText}"
${question ? `Student Question: "${question}"` : ""}

Provide a clear, empowering JSON response:
{
  "studentSummary": "Plain English translation with zero legalese (1-2 sentences)",
  "cautions": ["Key thing for a college student to watch out for", "Action item or verification tip"],
  "fairnessScore": "Fair & Standard (9/10) OR Cautionary / Landlord-Biased",
  "answer": "Direct, empathetic answer to the student question if asked, or reassurance on rights"
}
Output strictly valid JSON with no markdown wrapping.`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      const rawText = response.text || "";
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini lease analysis error:", err?.message || err);
      res.json({
        studentSummary: "Clause outlines standard tenant guidelines and responsibilities.",
        cautions: ["Make sure any agreed verbal promises are included in the written terms."],
        fairnessScore: "Standard Student Term",
        answer: "You are covered by standard student tenancy protection laws."
      });
    }
  });

  // Agreements Endpoints
  app.get("/api/agreements", (req, res) => {
    res.json(userAgreements);
  });

  app.get("/api/agreements/:id", (req, res) => {
    const agr = userAgreements.find((a) => a.id === req.params.id);
    if (!agr) {
      res.status(404).json({ error: "Agreement not found" });
      return;
    }
    res.json(agr);
  });

  app.post("/api/agreements", (req, res) => {
    const {
      propertyId,
      propertyTitle,
      propertyAddress,
      collegeName,
      tenantName,
      tenantEmail,
      tenantPhone,
      tenantStudentId,
      coTenantName,
      coTenantEmail,
      rentSharePercentage = 100,
      monthlyRent,
      securityDeposit,
      startDate,
      endDate,
      leaseType = "Student Co-Living",
    } = req.body;

    const newAgreement: PropertyAgreement = {
      id: `agr-${Date.now()}`,
      propertyId,
      propertyTitle: propertyTitle || "Campus Residence",
      propertyAddress: propertyAddress || "Near Campus",
      collegeName: collegeName || "University",
      tenantName: tenantName || "Student Tenant",
      tenantEmail: tenantEmail || "student@university.edu",
      tenantPhone: tenantPhone || "+1 (555) 010-0000",
      tenantStudentId: tenantStudentId || "STU-123456",
      coTenantName,
      coTenantEmail,
      rentSharePercentage: Number(rentSharePercentage),
      monthlyRent: Number(monthlyRent) || 900,
      securityDeposit: Number(securityDeposit) || 450,
      startDate: startDate || "2026-09-01",
      endDate: endDate || "2027-05-31",
      leaseType,
      termsAccepted: false,
      tenantSignature: "",
      signedAt: "",
      landlordSignature: "CampusStay Verified Host Signature",
      status: "draft",
      clauses: STANDARD_CLAUSES,
    };

    userAgreements.unshift(newAgreement);
    res.status(201).json(newAgreement);
  });

  app.put("/api/agreements/:id/sign", (req, res) => {
    const { signature } = req.body;
    const agr = userAgreements.find((a) => a.id === req.params.id);
    if (!agr) {
      res.status(404).json({ error: "Agreement not found" });
      return;
    }

    agr.tenantSignature = signature || `E-Signed by ${agr.tenantName}`;
    agr.signedAt = new Date().toISOString();
    agr.termsAccepted = true;
    agr.status = "signed";

    // If there is an associated booking, mark it confirmed
    const relatedBooking = userBookings.find((b) => b.agreementId === agr.id);
    if (relatedBooking) {
      relatedBooking.status = "confirmed";
    }

    res.json(agr);
  });

  // Bookings Endpoints
  app.get("/api/bookings", (req, res) => {
    res.json(userBookings);
  });

  app.post("/api/bookings", (req, res) => {
    const {
      propertyId,
      tenantName,
      tenantEmail,
      tenantPhone,
      checkInDate,
      checkOutDate,
      stayDuration,
      guestsCount = 1,
      splitRoommateId,
      roomType,
    } = req.body;

    const property = PROPERTIES.find((p) => p.id === propertyId);
    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    let splitInfo = undefined;
    let effectiveRent = property.price;
    if (splitRoommateId) {
      const rm = ROOMMATES.find((r) => r.id === splitRoommateId);
      if (rm) {
        effectiveRent = Math.round(property.price / 2);
        splitInfo = {
          roommateId: rm.id,
          roommateName: rm.name,
          roommateEmail: rm.contactEmail || `${rm.name.toLowerCase().replace(' ', '.')}@edu`,
          sharePercent: 50,
          amount: effectiveRent,
        };
      }
    }

    const serviceFee = 35;
    const depositFee = property.depositRequired || 300;
    const total = effectiveRent + serviceFee + depositFee;

    // Create automatic agreement draft for this booking
    const agreementId = `agr-${Date.now()}`;
    const newAgreement: PropertyAgreement = {
      id: agreementId,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      collegeName: property.collegeName,
      tenantName: tenantName || "Student Tenant",
      tenantEmail: tenantEmail || "student@edu",
      tenantPhone: tenantPhone || "+1 (555) 000-0000",
      tenantStudentId: "STU-" + Math.floor(100000 + Math.random() * 900000),
      coTenantName: splitInfo?.roommateName,
      coTenantEmail: splitInfo?.roommateEmail,
      rentSharePercentage: splitInfo ? 50 : 100,
      monthlyRent: effectiveRent,
      securityDeposit: depositFee,
      startDate: checkInDate || "2026-09-01",
      endDate: checkOutDate || "2027-05-31",
      leaseType: property.type === "hotel" ? "Hotel Extended Stay" : "Student Co-Living",
      termsAccepted: false,
      tenantSignature: "",
      signedAt: "",
      landlordSignature: `${property.hostName} (Verified Landlord)`,
      status: "draft",
      clauses: STANDARD_CLAUSES,
    };
    userAgreements.unshift(newAgreement);

    const newBooking: PropertyBooking = {
      id: `bk-${Date.now().toString().slice(-6)}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.images[0],
      propertyAddress: property.address,
      collegeName: property.collegeName,
      roomType: roomType || property.roomType,
      tenantName: tenantName || "Student Tenant",
      tenantEmail: tenantEmail || "student@edu",
      tenantPhone: tenantPhone || "+1 (555) 000-0000",
      checkInDate: checkInDate || "2026-09-01",
      checkOutDate: checkOutDate || "2027-05-31",
      stayDuration: stayDuration || "Semester Lease",
      guestsCount: Number(guestsCount) || 1,
      splitWithRoommate: splitInfo,
      baseRent: effectiveRent,
      serviceFee,
      depositFee,
      totalAmount: total,
      status: "pending_agreement",
      agreementId: agreementId,
      accessCode: `KEY-${Math.floor(1000 + Math.random() * 9000)}#`,
      wifiCredentials: {
        ssid: `${property.collegeName.split(' ')[0]}-Stay-${property.id.slice(-3)}`,
        pass: "CampusWiFi@2026",
      },
      createdAt: new Date().toISOString(),
    };

    userBookings.unshift(newBooking);
    res.status(201).json({ booking: newBooking, agreement: newAgreement });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusStay Server running on http://localhost:${PORT}`);
  });
}

startServer();
