import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Users,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  FileCheck2,
  Sliders,
  DollarSign,
  Heart,
  Send,
  X,
  Bot,
} from "lucide-react";
import type {
  RoommateProfile,
  RoommateMatchResult,
  UserPreferences,
  College,
  PropertyStay,
} from "../types.js";
import { api } from "../services/api.js";

interface RoommateMatcherProps {
  college: College | null;
  properties: PropertyStay[];
  onSelectStayForCoLease: (stay: PropertyStay, roommate: RoommateProfile) => void;
  onRequestBookingWithRoommate: (roommate: RoommateProfile) => void;
}

const AVAILABLE_TAGS = [
  "Non-smoker",
  "Gym enthusiast",
  "Quiet at night",
  "Early riser",
  "Pre-med",
  "Boba lover",
  "Dishes right away",
  "Gamer (Headphones)",
  "Artistic",
  "Super clean",
  "Plant parent",
  "Soccer",
];

export const RoommateMatcher: React.FC<RoommateMatcherProps> = ({
  college,
  properties,
  onRequestBookingWithRoommate,
}) => {
  // Current student preferences state
  const [userPrefs, setUserPrefs] = useState<UserPreferences>({
    name: "Alex Rivera",
    email: "alex.rivera@berkeley.edu",
    studentId: "CAL-3829104",
    collegeId: college?.id || "uc-berkeley",
    major: "Computer Science",
    graduationYear: 2027,
    sleepHabit: "night_owl",
    cleanlinessLevel: 5,
    noiseTolerance: "moderate",
    guestPolicy: "weekend_only",
    budgetMin: 800,
    budgetMax: 1400,
    lifestyleTags: ["Non-smoker", "Quiet at night", "Dishes right away"],
  });

  const [matches, setMatches] = useState<RoommateMatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreferencesEdit, setShowPreferencesEdit] = useState(false);

  // AI Deep Dive Modal
  const [activeDeepDive, setActiveDeepDive] = useState<{
    result: RoommateMatchResult;
    aiExplanation?: string;
    harmonyTips?: string[];
    icebreakers?: string[];
    loading?: boolean;
  } | null>(null);

  // Chat / Message Modal
  const [chatModalRoommate, setChatModalRoommate] = useState<RoommateProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "roommate"; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Sync college
  useEffect(() => {
    if (college) {
      setUserPrefs((prev) => ({ ...prev, collegeId: college.id }));
    }
  }, [college]);

  // Run matching on mount or when preferences change
  const runMatching = async () => {
    setLoading(true);
    try {
      const results = await api.matchRoommates(userPrefs);
      setMatches(results);
    } catch (err) {
      console.error("Match error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runMatching();
  }, [userPrefs.collegeId, userPrefs.sleepHabit, userPrefs.cleanlinessLevel, userPrefs.noiseTolerance]);

  // Handle AI Deep Dive Trigger
  const handleOpenAiDeepDive = async (result: RoommateMatchResult) => {
    setActiveDeepDive({
      result,
      loading: true,
    });

    try {
      const deepDive = await api.getAiMatchDeepDive(
        userPrefs,
        result.roommate,
        result.compatibilityScore
      );
      setActiveDeepDive({
        result,
        aiExplanation: deepDive.aiExplanation,
        harmonyTips: deepDive.harmonyTips,
        icebreakers: deepDive.icebreakers,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      setActiveDeepDive({
        result,
        aiExplanation: "You both share aligned study focus hours and clean common area habits.",
        harmonyTips: ["Draft a chore calendar", "Confirm weekend guest rules"],
        icebreakers: [result.icebreaker],
        loading: false,
      });
    }
  };

  // Handle Chat Opener
  const handleOpenChat = (roommate: RoommateProfile, defaultText?: string) => {
    setChatModalRoommate(roommate);
    setChatMessages([
      {
        sender: "roommate",
        text: `Hey Alex! Great to match with you on CampusStay! Are you looking for accommodation for the upcoming semester?`,
        time: "Just now",
      },
    ]);
    if (defaultText) {
      setChatInput(defaultText);
    } else {
      setChatInput("");
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !chatModalRoommate) return;
    const newMsg = {
      sender: "user" as const,
      text: chatInput,
      time: "Just now",
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    // Simulated reply after short delay
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "roommate",
          text: `That sounds awesome! I checked out the listings near the quad—would definitely be down to co-lease and split rent 50/50. Let's do it!`,
          time: "Just now",
        },
      ]);
    }, 1200);
  };

  const toggleTag = (tag: string) => {
    setUserPrefs((prev) => {
      const exists = prev.lifestyleTags.includes(tag);
      return {
        ...prev,
        lifestyleTags: exists
          ? prev.lifestyleTags.filter((t) => t !== tag)
          : [...prev.lifestyleTags, tag],
      };
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Automated AI Match Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            College Roommate Matching
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
            Algorithms calculate sleep schedules, study noise, cleanliness, and budget overlap to find your ideal campus co-tenant.
          </p>

          {/* Quick Profile Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <div className="w-7 h-7 rounded-full bg-indigo-500 font-bold flex items-center justify-center text-white text-xs">
                AR
              </div>
              <div>
                <span className="font-bold text-white">{userPrefs.name}</span>
                <span className="text-slate-400 text-[11px] ml-1.5">
                  ({userPrefs.sleepHabit.replace("_", " ")}, Level {userPrefs.cleanlinessLevel}/5 Clean)
                </span>
              </div>
            </div>

            <button
              id="edit-matching-quiz-btn"
              onClick={() => setShowPreferencesEdit(!showPreferencesEdit)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white backdrop-blur-sm transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showPreferencesEdit ? "Hide Quiz" : "Edit Habits Quiz"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Habits & Preferences Quiz Drawer / Panel */}
      {showPreferencesEdit && (
        <div className="bg-white rounded-3xl border border-indigo-100 p-5 shadow-sm space-y-5 animate-in fade-in zoom-in-98 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Student Habits & Compatibility Survey
              </h3>
              <p className="text-xs text-slate-500">
                Adjust your living style to refine algorithmic compatibility
              </p>
            </div>
            <button
              onClick={() => setShowPreferencesEdit(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sleep Schedule */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sleep Schedule
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "early_bird", label: "Early Bird", icon: Sun },
                  { id: "night_owl", label: "Night Owl", icon: Moon },
                  { id: "flexible", label: "Flexible", icon: Sparkles },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() =>
                        setUserPrefs((p) => ({ ...p, sleepHabit: s.id as any }))
                      }
                      className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        userPrefs.sleepHabit === s.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cleanliness Level */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-slate-700">Cleanliness Level:</span>
                <span className="text-indigo-600">
                  {userPrefs.cleanlinessLevel === 5
                    ? "5/5 (Spotless & Organized)"
                    : `${userPrefs.cleanlinessLevel}/5`}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={userPrefs.cleanlinessLevel}
                onChange={(e) =>
                  setUserPrefs((p) => ({
                    ...p,
                    cleanlinessLevel: parseInt(e.target.value) as any,
                  }))
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 (Relaxed)</span>
                <span>3 (Moderate)</span>
                <span>5 (Immaculate)</span>
              </div>
            </div>

            {/* Noise & Study Habits */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Room Study Environment
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "quiet_library", label: "Silent Library" },
                  { id: "moderate", label: "Moderate" },
                  { id: "social_active", label: "Social Active" },
                ].map((n) => (
                  <button
                    key={n.id}
                    onClick={() =>
                      setUserPrefs((p) => ({ ...p, noiseTolerance: n.id as any }))
                    }
                    className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold transition-colors ${
                      userPrefs.noiseTolerance === n.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Budget Range */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-slate-700">Monthly Budget Cap:</span>
                <span className="text-indigo-600">${userPrefs.budgetMax}/mo</span>
              </div>
              <input
                type="range"
                min="700"
                max="1800"
                step="50"
                value={userPrefs.budgetMax}
                onChange={(e) =>
                  setUserPrefs((p) => ({
                    ...p,
                    budgetMax: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$700/mo</span>
                <span>$1,800/mo</span>
              </div>
            </div>
          </div>

          {/* Lifestyle Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Your Lifestyle & Study Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const selected = userPrefs.lifestyleTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      selected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {selected ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Matched Roommates Listing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900">
              Verified Student Matches ({matches.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Sorted by compatibility score
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
            <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              Calculating compatibility matrix with {college?.shortName} students...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((item) => {
              const { roommate, compatibilityScore, reasons, frictionPoints, icebreaker } =
                item;

              return (
                <div
                  key={roommate.id}
                  id={`roommate-card-${roommate.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
                >
                  {/* Top Header: Avatar + Score Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={roommate.avatar}
                          alt={roommate.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                        />
                        {roommate.verifiedStudent && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white" title="Verified University Student">
                            <ShieldCheck className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {roommate.name}
                          </h3>
                          <span className="text-xs text-slate-500">
                            ({roommate.age})
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-indigo-600">
                          {roommate.major} • Class of '{roommate.graduationYear.toString().slice(-2)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {roommate.collegeName}
                        </div>
                      </div>
                    </div>

                    {/* Score badge */}
                    <div className="text-right shrink-0">
                      <div
                        className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-xs ${
                          compatibilityScore >= 85
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : compatibilityScore >= 70
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {compatibilityScore}% Match
                      </div>
                      <div className="text-[9px] uppercase font-bold text-slate-400 mt-1">
                        Lifestyle Sync
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    "{roommate.bio}"
                  </p>

                  {/* Habit Metrics Chips */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                    <div className="bg-slate-100/80 p-1.5 rounded-lg text-slate-700">
                      <span className="text-slate-400 block font-normal text-[9px]">Sleep</span>
                      {roommate.sleepHabit.replace("_", " ")}
                    </div>
                    <div className="bg-slate-100/80 p-1.5 rounded-lg text-slate-700">
                      <span className="text-slate-400 block font-normal text-[9px]">Cleanliness</span>
                      Level {roommate.cleanlinessLevel}/5
                    </div>
                    <div className="bg-slate-100/80 p-1.5 rounded-lg text-slate-700">
                      <span className="text-slate-400 block font-normal text-[9px]">Budget</span>
                      ${roommate.budgetMin}-${roommate.budgetMax}
                    </div>
                  </div>

                  {/* Reasons for Match & Friction Highlights */}
                  <div className="space-y-1 text-xs">
                    {reasons.slice(0, 2).map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{r}</span>
                      </div>
                    ))}
                    {frictionPoints.length > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-700 font-medium text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{frictionPoints[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {roommate.lifestyleTags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      id={`ai-deep-dive-btn-${roommate.id}`}
                      onClick={() => handleOpenAiDeepDive(item)}
                      className="px-2.5 py-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>AI Compatibility</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        id={`chat-roommate-btn-${roommate.id}`}
                        onClick={() => handleOpenChat(roommate, icebreaker)}
                        className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs transition-colors flex items-center justify-center"
                        title="Chat & Icebreaker"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`co-lease-request-btn-${roommate.id}`}
                        onClick={() => onRequestBookingWithRoommate(roommate)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <FileCheck2 className="w-3 h-3" />
                        <span>Request Co-Lease</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Compatibility Deep Dive Modal */}
      {activeDeepDive && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    AI Roommate Synergy Analysis
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Alex Rivera & {activeDeepDive.result.roommate.name} ({activeDeepDive.result.compatibilityScore}% Match)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDeepDive(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeDeepDive.loading ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Gemini is analyzing lifestyle habits, study schedules, and conflict mitigation...
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* AI Explanation Card */}
                <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3.5 space-y-1">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Why You Two Will Get Along</span>
                  </div>
                  <p className="text-indigo-900 leading-relaxed">
                    {activeDeepDive.aiExplanation}
                  </p>
                </div>

                {/* Harmony & House Rules Tips */}
                {activeDeepDive.harmonyTips && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">
                      Semester Harmony Guidelines
                    </h4>
                    <div className="space-y-1.5">
                      {activeDeepDive.harmonyTips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Icebreaker DM Openers */}
                {activeDeepDive.icebreakers && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">
                      Suggested Conversation Openers
                    </h4>
                    <div className="space-y-2">
                      {activeDeepDive.icebreakers.map((msg, idx) => (
                        <div
                          key={idx}
                          className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2"
                        >
                          <span className="text-amber-950 italic font-medium">"{msg}"</span>
                          <button
                            onClick={() => {
                              setActiveDeepDive(null);
                              handleOpenChat(activeDeepDive.result.roommate, msg);
                            }}
                            className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold shrink-0 hover:bg-amber-700"
                          >
                            Send
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setActiveDeepDive(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const rm = activeDeepDive.result.roommate;
                      setActiveDeepDive(null);
                      onRequestBookingWithRoommate(rm);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xs"
                  >
                    Co-Lease Together
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat / Direct Message Simulation Modal */}
      {chatModalRoommate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={chatModalRoommate.avatar}
                  alt={chatModalRoommate.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border-2 border-white/40"
                />
                <div>
                  <h3 className="font-bold text-sm leading-tight">
                    {chatModalRoommate.name}
                  </h3>
                  <span className="text-[11px] text-indigo-200">
                    Online • {chatModalRoommate.major}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setChatModalRoommate(null)}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              <div className="text-center">
                <span className="px-2.5 py-1 bg-white text-slate-500 rounded-full text-[10px] font-semibold border border-slate-200">
                  Roommate Match Verified • {chatModalRoommate.collegeName}
                </span>
              </div>

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none shadow-xs"
                        : "bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type message or paste icebreaker..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
