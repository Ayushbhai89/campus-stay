import React from "react";
import {
  CalendarCheck,
  Key,
  Wifi,
  ShieldCheck,
  Clock,
  Navigation,
  FileCheck2,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
} from "lucide-react";
import type { PropertyBooking } from "../types.js";

interface BookingsHubProps {
  bookings: PropertyBooking[];
  onOpenAgreement: (agreementId?: string) => void;
  onExploreStays: () => void;
}

export const BookingsHub: React.FC<BookingsHubProps> = ({
  bookings,
  onOpenAgreement,
  onExploreStays,
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (bookings.length === 0) {
    return (
      <div className="space-y-4 pb-20">
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            No Active Campus Stays Yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Explore verified student dorms, near-campus apartments, and hotels with automated roommate matching.
          </p>
          <button
            onClick={onExploreStays}
            className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Browse College Stays
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
          <Key className="w-3.5 h-3.5" />
          <span>Digital Key & Move-In Center</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
          My Campus Bookings
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Smart door keycodes, check-in schedules, roommate co-lease splits, and verified tenancy contracts.
        </p>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            id={`booking-card-${booking.id}`}
            className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
          >
            {/* Top Row: Property & Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={booking.propertyImage}
                  alt={booking.propertyTitle}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {booking.roomType}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      #{booking.id}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-0.5">
                    {booking.propertyTitle}
                  </h3>
                  <p className="text-xs text-slate-500">{booking.propertyAddress}</p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="shrink-0">
                {booking.status === "confirmed" ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Confirmed & Move-In Ready
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-black flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Pending Agreement Signature
                  </span>
                )}
              </div>
            </div>

            {/* Smart Access & Credentials Card */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-400" /> Smart Door Keycode
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-amber-400">
                    {booking.accessCode}
                  </span>
                  <button
                    onClick={() => handleCopyKey(booking.accessCode)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors text-slate-200"
                    title="Copy Keycode"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedKey === booking.accessCode && (
                    <span className="text-[10px] text-emerald-400 font-bold">
                      Copied!
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  Activates automatically on move-in day: {booking.checkInDate}
                </div>
              </div>

              {/* WiFi credentials */}
              {booking.wifiCredentials && (
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs space-y-0.5 min-w-[200px]">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Residence WiFi</span>
                  </div>
                  <div className="text-slate-200 font-semibold truncate">
                    SSID: <strong className="text-white">{booking.wifiCredentials.ssid}</strong>
                  </div>
                  <div className="text-slate-300 font-mono text-[11px]">
                    Pass: {booking.wifiCredentials.pass}
                  </div>
                </div>
              )}
            </div>

            {/* Stay Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Move-In Date
                </span>
                <span className="font-black text-slate-900">{booking.checkInDate}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Move-Out Date
                </span>
                <span className="font-black text-slate-900">{booking.checkOutDate}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Duration
                </span>
                <span className="font-black text-slate-900 truncate block">
                  {booking.stayDuration}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Total Paid / Hold
                </span>
                <span className="font-black text-indigo-700">
                  ${booking.totalAmount}
                </span>
              </div>
            </div>

            {/* Split Roommate Pill */}
            {booking.splitWithRoommate && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-950">
                      Co-Leased with {booking.splitWithRoommate.roommateName}
                    </span>
                    <div className="text-[11px] text-amber-800">
                      50% Rent Split (${booking.splitWithRoommate.amount}/mo each)
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-lg text-[10px]">
                  Joint Agreement
                </span>
              </div>
            )}

            {/* Agreement Quick Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Standard University Tenancy Agreement Attached</span>
              </div>

              <button
                id={`open-agreement-btn-${booking.id}`}
                onClick={() => onOpenAgreement(booking.agreementId)}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>
                  {booking.status === "confirmed"
                    ? "View Certified Agreement"
                    : "Sign Tenancy Agreement"}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
