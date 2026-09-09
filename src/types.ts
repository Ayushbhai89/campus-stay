export type PropertyType = 'dorm' | 'apartment' | 'sublet' | 'hotel';
export type PricePeriod = 'month' | 'semester' | 'night';

export interface College {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  mascot: string;
  campusCenter: string;
}

export interface PropertyStay {
  id: string;
  title: string;
  type: PropertyType;
  collegeId: string;
  collegeName: string;
  price: number;
  pricePeriod: PricePeriod;
  distanceToCampusMiles: number;
  walkTimeMinutes: number;
  transitTimeMinutes: number;
  shuttleRoute: string;
  safetyScore: number; // e.g. 9.4
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  roomType: 'Private Room' | 'Shared Double' | 'Studio' | 'Full Apartment' | 'Hotel Suite';
  amenities: string[];
  verifiedStudentHost: boolean;
  depositRequired: number;
  availableFrom: string;
  leaseTerms: string[];
  description: string;
  hostName: string;
  hostRole: string;
  hostRating: number;
  rules: string[];
  isPopular?: boolean;
  genderPreference?: 'all' | 'co-ed' | 'female_only' | 'male_only';
}

export interface RoommateProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Non-binary';
  collegeId: string;
  collegeName: string;
  major: string;
  graduationYear: number;
  avatar: string;
  bio: string;
  sleepHabit: 'early_bird' | 'night_owl' | 'flexible';
  cleanlinessLevel: 1 | 2 | 3 | 4 | 5; // 1 relaxed, 5 immaculate
  noiseTolerance: 'quiet_library' | 'moderate' | 'social_active';
  guestPolicy: 'no_overnights' | 'weekend_only' | 'open';
  budgetMin: number;
  budgetMax: number;
  preferredRoomType: 'private' | 'shared' | 'any';
  lifestyleTags: string[];
  verifiedStudent: boolean;
  targetStayId?: string;
  contactEmail?: string;
  socialHandle?: string;
}

export interface RoommateMatchResult {
  roommate: RoommateProfile;
  compatibilityScore: number; // 0 - 100
  reasons: string[];
  frictionPoints: string[];
  icebreaker: string;
  aiExplanation?: string;
}

export interface LeaseClause {
  id: string;
  title: string;
  text: string;
  plainEnglishSummary: string;
  category: 'rent' | 'deposit' | 'quiet_hours' | 'subleasing' | 'utilities' | 'guests';
  isImportant?: boolean;
}

export interface PropertyAgreement {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  collegeName: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantStudentId: string;
  coTenantName?: string;
  coTenantEmail?: string;
  rentSharePercentage: number;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  leaseType: 'Semester Sublease' | 'Academic Year Lease' | 'Hotel Extended Stay' | 'Student Co-Living';
  termsAccepted: boolean;
  tenantSignature: string; // Base64 signature data URL or typed mark
  signedAt: string;
  landlordSignature: string;
  status: 'draft' | 'signed' | 'active';
  clauses: LeaseClause[];
}

export interface PropertyBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyAddress: string;
  collegeName: string;
  roomType: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  checkInDate: string;
  checkOutDate: string;
  stayDuration: string; // e.g. "Fall Semester 2026", "4 Nights"
  guestsCount: number;
  splitWithRoommate?: {
    roommateId: string;
    roommateName: string;
    roommateEmail: string;
    sharePercent: number;
    amount: number;
  };
  baseRent: number;
  serviceFee: number;
  depositFee: number;
  totalAmount: number;
  status: 'confirmed' | 'pending_agreement' | 'checked_in' | 'completed';
  agreementId?: string;
  accessCode: string;
  wifiCredentials?: { ssid: string; pass: string };
  createdAt: string;
}

export interface UserPreferences {
  name: string;
  email: string;
  studentId: string;
  collegeId: string;
  major: string;
  graduationYear: number;
  sleepHabit: 'early_bird' | 'night_owl' | 'flexible';
  cleanlinessLevel: 1 | 2 | 3 | 4 | 5;
  noiseTolerance: 'quiet_library' | 'moderate' | 'social_active';
  guestPolicy: 'no_overnights' | 'weekend_only' | 'open';
  budgetMin: number;
  budgetMax: number;
  lifestyleTags: string[];
}
