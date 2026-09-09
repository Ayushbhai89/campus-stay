import React, { useState } from "react";
import {
  X,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Clock,
  Sparkles,
  Key,
} from "lucide-react";
import type { PropertyStay, RoommateProfile, PropertyBooking, PropertyAgreement } from "../types.js";
import { api } from "../services/api.js";

interface BookingModalProps {
  property: PropertyStay | null;
  roommates: RoommateProfile[];
  preselectedRoommate?: RoommateProfile | null;
  defaultSplit?: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: PropertyBooking, agreement: PropertyAgreement) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  property,
  roommates,
  preselectedRoommate,
  defaultSplit = false,
  onClose,
  onBookingSuccess,
}) => {
  if (!property) return null;

  const [leaseCycle, setLeaseCycle] = useState<string>(
    property.type === "hotel" ? "Nightly Stay (4 Nights)" : "Fall Semester 2026"
  );
  const [tenantName, setTenantName] = useState("Alex Rivera");
  const [tenantEmail, setTenantEmail] = useState("alex.rivera@berkeley.edu");
  const [tenantPhone, setTenantPhone] = useState("+1 (510) 555-0192");
  const [checkInDate, setCheckInDate] = useState("2026-08-15");
  const [checkOutDate, setCheckOutDate] = useState("2026-12-20");

  const [isSplitting, setIsSplitting] = useState<boolean>(defaultSplit || !!preselectedRoommate);
  const [selectedRoommateId, setSelectedRoommateId] = useState<string>(
    preselectedRoommate?.id || (roommates[0]?.id || "")
  );

  const [loading, setLoading] = useState(false);

  // Pricing math
  const effectiveBaseRent = isSplitting
    ? Math.round(property.price / 2)
    : property.price;
  const deposit = isSplitting
    ? Math.round((property.depositRequired || 300) / 2)
    : property.depositRequired || 300;
  const serviceFee = 35;
  const total = effectiveBaseRent + deposit + serviceFee;

  const selectedRoommate = roommates.find((r) => r.id === selectedRoommateId);

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const res = await api.createBooking({
        propertyId: property.id,
        tenantName,
        tenantEmail,
        tenantPhone,
        checkInDate,
        checkOutDate,
        stayDuration: leaseCycle,
        guestsCount: isSplitting ? 2 : 1,
        splitRoommateId: isSplitting ? selectedRoommateId : undefined,
        roomType: property.roomType,
      });

      onBookingSuccess(res.booking, res.agreement);
      onClose();
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
              Campus Accommodation Checkout
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate max-w-xs">
              {property.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1 text-xs">
          {/* Property Summary Pill */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img
              src={property.images[0]}
              alt={property.title}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 truncate">{property.title}</div>
              <div className="text-slate-500 text-[11px] truncate">{property.address}</div>
              <div className="text-indigo-600 font-bold mt-0.5">
                {property.roomType} • {property.walkTimeMinutes}m walk to campus
              </div>
            </div>
          </div>

          {/* Lease Cycle / Stay Duration */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Select Term / Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Fall Semester 2026",
                "Full Academic Year (9mo)",
                "Full Year (12mo)",
                "Nightly / Transition (Hotel)",
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLeaseCycle(term)}
                  className={`p-2.5 rounded-xl border text-left transition-all font-semibold ${
                    leaseCycle === term
                      ? "bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-[11px]">{term}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Move-In Date
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Move-Out Date
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Split with Matched Roommate Toggle */}
          {property.type !== "hotel" && (
            <div className="p-3.5 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 rounded-2xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Split 50% Rent with Roommate</span>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    Halves your monthly rent and generates a joint co-lease agreement!
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isSplitting}
                  onChange={(e) => setIsSplitting(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer rounded"
                />
              </div>

              {isSplitting && (
                <div className="pt-2 border-t border-indigo-100 space-y-2">
                  <label className="block font-bold text-indigo-950">
                    Choose Matched Co-Tenant:
                  </label>
                  <select
                    value={selectedRoommateId}
                    onChange={(e) => setSelectedRoommateId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {roommates.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        {rm.name} ({rm.major} • Class of '{rm.graduationYear.toString().slice(-2)})
                      </option>
                    ))}
                  </select>

                  {selectedRoommate && (
                    <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-indigo-100 text-[11px]">
                      <img
                        src={selectedRoommate.avatar}
                        alt={selectedRoommate.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-900">
                          {selectedRoommate.name}
                        </span>
                        <span className="text-slate-500 ml-1">
                          will cover 50% (${effectiveBaseRent}/{property.pricePeriod})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Student Info Inputs */}
          <div className="space-y-2.5 pt-1">
            <h3 className="font-bold text-slate-800">Student Tenant Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">
                  University (.edu) Email
                </label>
                <input
                  type="email"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Price Breakdown Matrix */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800 mb-1">Due at Move-in:</div>
            <div className="flex justify-between text-slate-600">
              <span>
                {isSplitting ? "Your 50% Rent Share" : "First Month Rent"}
              </span>
              <span className="font-bold text-slate-900">${effectiveBaseRent}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Escrow Security Deposit (Refundable)</span>
              <span className="font-bold text-slate-900">${deposit}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Campus Accommodation Setup Fee</span>
              <span className="font-bold text-slate-900">${serviceFee}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
              <span>Total Move-in Hold:</span>
              <span className="text-indigo-600">${total}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            id="submit-booking-flow-btn"
            disabled={loading}
            onClick={handleConfirmBooking}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Generating Student Lease & Door Keycode...</span>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Confirm & Generate Digital Lease Agreement</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
