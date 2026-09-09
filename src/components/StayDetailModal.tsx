import React, { useState } from "react";
import {
  X,
  Navigation,
  Bus,
  Shield,
  Star,
  CheckCircle2,
  Users,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { PropertyStay } from "../types.js";

interface StayDetailModalProps {
  property: PropertyStay | null;
  onClose: () => void;
  onBook: (property: PropertyStay, splitWithRoommate?: boolean) => void;
  onFindRoommate: (property: PropertyStay) => void;
}

export const StayDetailModal: React.FC<StayDetailModalProps> = ({
  property,
  onClose,
  onBook,
  onFindRoommate,
}) => {
  if (!property) return null;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              {property.type.toUpperCase()}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {property.collegeName} Area
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          {/* Main Photo Gallery */}
          <div className="space-y-2">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 relative">
              <img
                src={property.images[activePhotoIndex] || property.images[0]}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur-md">
                {activePhotoIndex + 1} / {property.images.length}
              </div>
            </div>
            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activePhotoIndex === idx
                        ? "border-indigo-600 scale-95"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt="thumbnail"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Basic Details */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {property.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{property.address}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-800 shrink-0">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{property.rating}</span>
                <span className="text-slate-400">({property.reviewCount})</span>
              </div>
            </div>

            {/* Campus Proximity Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-2.5 text-center">
                <div className="text-indigo-600 font-black text-sm sm:text-base flex items-center justify-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{property.walkTimeMinutes}m</span>
                </div>
                <div className="text-[10px] text-indigo-900 font-semibold mt-0.5">
                  Walk to Quad ({property.distanceToCampusMiles} mi)
                </div>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-2.5 text-center">
                <div className="text-emerald-700 font-black text-sm sm:text-base flex items-center justify-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{property.safetyScore}/10</span>
                </div>
                <div className="text-[10px] text-emerald-900 font-semibold mt-0.5">
                  Safe Walking Route
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-2.5 text-center">
                <div className="text-amber-700 font-black text-xs sm:text-sm flex items-center justify-center gap-1 truncate">
                  <Bus className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{property.shuttleRoute.split(' ')[0]}</span>
                </div>
                <div className="text-[10px] text-amber-900 font-semibold mt-0.5 truncate">
                  {property.shuttleRoute}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              About this Stay
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Student Amenities Included
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {property.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Host & Verification */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                {property.hostName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {property.hostName}
                  </span>
                  {property.verifiedStudentHost && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                      Verified Host
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">{property.hostRole}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-semibold">Host Rating</div>
              <div className="text-xs font-black text-slate-800 flex items-center justify-end gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>{property.hostRating}</span>
              </div>
            </div>
          </div>

          {/* Lease Terms & Rules */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Available Lease Cycles
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {property.leaseTerms.map((term, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100 flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3 text-indigo-500" /> {term}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                House & Quiet Hours Policy
              </h3>
              <div className="space-y-1">
                {property.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Roommate Co-Leasing Split Banner */}
          {property.type !== "hotel" && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Split Rent with an AI Matched Roommate</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Cut your rent to <strong>${Math.round(property.price / 2)}/{property.pricePeriod}</strong> with verified students who share your study & sleep schedule!
                </p>
              </div>
              <button
                id="find-roommates-for-stay-btn"
                onClick={() => {
                  onClose();
                  onFindRoommate(property);
                }}
                className="shrink-0 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Find Roommates</span>
              </button>
            </div>
          )}
        </div>

        {/* Fixed Modal Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {property.type === "hotel" ? "Nightly Rate" : "Monthly Rent"}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">
                ${property.price}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                /{property.pricePeriod}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {property.type !== "hotel" && (
              <button
                id="split-book-stay-btn"
                onClick={() => onBook(property, true)}
                className="px-3.5 py-2.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Split 50/50</span>
              </button>
            )}

            <button
              id="confirm-book-stay-btn"
              onClick={() => onBook(property, false)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-colors flex items-center gap-1.5"
            >
              <span>Instant Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
