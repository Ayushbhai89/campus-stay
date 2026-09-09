import type {
  College,
  PropertyStay,
  RoommateProfile,
  RoommateMatchResult,
  PropertyAgreement,
  PropertyBooking,
  UserPreferences,
} from "../types.js";

export const api = {
  async getColleges(): Promise<College[]> {
    const res = await fetch("/api/colleges");
    if (!res.ok) throw new Error("Failed to fetch colleges");
    return res.json();
  },

  async getProperties(params?: {
    collegeId?: string;
    type?: string;
    maxDistance?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<PropertyStay[]> {
    const query = new URLSearchParams();
    if (params?.collegeId) query.set("collegeId", params.collegeId);
    if (params?.type) query.set("type", params.type);
    if (params?.maxDistance) query.set("maxDistance", String(params.maxDistance));
    if (params?.maxPrice) query.set("maxPrice", String(params.maxPrice));
    if (params?.search) query.set("search", params.search);

    const res = await fetch(`/api/properties?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch properties");
    return res.json();
  },

  async getProperty(id: string): Promise<PropertyStay> {
    const res = await fetch(`/api/properties/${id}`);
    if (!res.ok) throw new Error("Failed to fetch property");
    return res.json();
  },

  async getRoommates(collegeId?: string): Promise<RoommateProfile[]> {
    const query = collegeId ? `?collegeId=${collegeId}` : "";
    const res = await fetch(`/api/roommates${query}`);
    if (!res.ok) throw new Error("Failed to fetch roommates");
    return res.json();
  },

  async matchRoommates(
    prefs: UserPreferences
  ): Promise<RoommateMatchResult[]> {
    const res = await fetch("/api/roommates/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    if (!res.ok) throw new Error("Failed to run roommate match");
    return res.json();
  },

  async getAiMatchDeepDive(
    userProfile: UserPreferences,
    roommateProfile: RoommateProfile,
    compatibilityScore: number
  ): Promise<{
    aiExplanation: string;
    harmonyTips: string[];
    icebreakers: string[];
  }> {
    const res = await fetch("/api/ai/match-deep-dive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userProfile, roommateProfile, compatibilityScore }),
    });
    if (!res.ok) throw new Error("Failed to get AI deep dive");
    return res.json();
  },

  async analyzeClauseWithAi(
    clauseTitle: string,
    clauseText: string,
    question?: string
  ): Promise<{
    studentSummary: string;
    cautions: string[];
    fairnessScore: string;
    answer?: string;
  }> {
    const res = await fetch("/api/ai/analyze-clause", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clauseTitle, clauseText, question }),
    });
    if (!res.ok) throw new Error("Failed to analyze clause");
    return res.json();
  },

  async getAgreements(): Promise<PropertyAgreement[]> {
    const res = await fetch("/api/agreements");
    if (!res.ok) throw new Error("Failed to fetch agreements");
    return res.json();
  },

  async signAgreement(id: string, signature: string): Promise<PropertyAgreement> {
    const res = await fetch(`/api/agreements/${id}/sign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature }),
    });
    if (!res.ok) throw new Error("Failed to sign agreement");
    return res.json();
  },

  async getBookings(): Promise<PropertyBooking[]> {
    const res = await fetch("/api/bookings");
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return res.json();
  },

  async createBooking(data: {
    propertyId: string;
    tenantName: string;
    tenantEmail: string;
    tenantPhone: string;
    checkInDate: string;
    checkOutDate: string;
    stayDuration: string;
    guestsCount: number;
    splitRoommateId?: string;
    roomType?: string;
  }): Promise<{ booking: PropertyBooking; agreement: PropertyAgreement }> {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create booking");
    return res.json();
  },
};
