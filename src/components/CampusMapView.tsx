import React, { useState } from "react";
import {
  Navigation,
  Bus,
  Shield,
  Star,
  Building2,
  Bed,
  ArrowRight,
  Sparkles,
  MapPin,
  Layers,
} from "lucide-react";
import type { PropertyStay, College } from "../types.js";

interface CampusMapViewProps {
  properties: PropertyStay[];
  selectedCollege: College | null;
  onSelectProperty: (property: PropertyStay) => void;
  onBookProperty: (property: PropertyStay) => void;
}

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  properties,
  selectedCollege,
  onSelectProperty,
  onBookProperty,
}) => {
  const [selectedPropId, setSelectedPropId] = useState<string | null>(
    properties[0]?.id || null
  );
  const [filterType, setFilterType] = useState<string>("all");

  const selectedProp = properties.find((p) => p.id === selectedPropId);

  const displayProperties = properties.filter((p) => {
    if (filterType !== "all" && p.type !== filterType) return false;
    return true;
  });

  // Calculate relative map positions for properties relative to college center
  const collegeCenter = {
    lat: selectedCollege?.lat || 37.8719,
    lng: selectedCollege?.lng || -122.2585,
  };

  // Map scale calculation
  const getCoordinatesOnMap = (p: PropertyStay) => {
    const latDiff = (p.lat - collegeCenter.lat) * 2200;
    const lngDiff = (p.lng - collegeCenter.lng) * 2200;
    // Map bounds: clamp between 12% and 88%
    const x = Math.max(12, Math.min(88, 50 + lngDiff));
    const y = Math.max(12, Math.min(88, 50 - latDiff));
    return { x, y };
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Map Header & Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-xs sm:text-sm text-slate-900">
              {selectedCollege?.shortName} Campus Proximity Map
            </h2>
            <p className="text-[11px] text-slate-500">
              Center: {selectedCollege?.campusCenter}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          {["all", "dorm", "apartment", "hotel"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                filterType === t
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Campus SVG Radar Map */}
      <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-lg select-none">
        {/* Radar & Grid Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="campusGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#1e1b4b" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#campusGlow)" />

          {/* Concentric distance circles from Campus Quad */}
          <circle
            cx="50%"
            cy="50%"
            r="16%"
            fill="none"
            stroke="#6366f1"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle
            cx="50%"
            cy="50%"
            r="32%"
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle
            cx="50%"
            cy="50%"
            r="46%"
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Campus Crosshairs */}
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#1e293b" strokeWidth="1" />
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#1e293b" strokeWidth="1" />

          {/* Shuttle line mockup */}
          <path
            d="M 20 80 Q 50 50 85 20"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="animate-pulse"
          />
        </svg>

        {/* Distance Range Labels */}
        <div className="absolute top-2 left-3 text-[10px] text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full border border-indigo-400"></span> 0.25 mi (Inner Quad)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full border border-slate-500"></span> 0.5 mi
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-amber-400"></span> Campus Shuttle Route
          </span>
        </div>

        {/* Center Campus Hub Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
          style={{ left: "50%", top: "50%" }}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center text-white ring-4 ring-indigo-500/30">
            <MapPin className="w-4 h-4 fill-white" />
          </div>
          <div className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-black text-slate-900 shadow-md mt-1 border border-indigo-200">
            {selectedCollege?.shortName} Quad
          </div>
        </div>

        {/* Property Markers */}
        {displayProperties.map((prop) => {
          const coords = getCoordinatesOnMap(prop);
          const isSelected = prop.id === selectedPropId;

          return (
            <div
              key={prop.id}
              onClick={() => setSelectedPropId(prop.id)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-all"
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            >
              {/* Marker pin pill */}
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-extrabold shadow-lg transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-400/40 scale-110 z-30"
                    : prop.type === "hotel"
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>${prop.price}</span>
                {prop.type === "hotel" && <span className="text-[9px] opacity-90">/nt</span>}
              </div>

              {/* Hover tooltip for quick distance preview */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-32 bg-slate-900 text-white p-1.5 rounded-lg text-[10px] text-center shadow-xl pointer-events-none z-30">
                <div className="font-bold truncate">{prop.title}</div>
                <div className="text-indigo-300 font-semibold">{prop.walkTimeMinutes}m walk</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Selected Property Card */}
      {selectedProp && (
        <div className="bg-white rounded-2xl border-2 border-indigo-500/80 p-4 shadow-md animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={selectedProp.images[0]}
                alt={selectedProp.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                    {selectedProp.type}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedProp.roomType}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                  {selectedProp.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-0.5 text-indigo-600 font-semibold">
                    <Navigation className="w-3 h-3" /> {selectedProp.walkTimeMinutes} min walk
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                    <Shield className="w-3 h-3" /> {selectedProp.safetyScore}/10 Safe
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-left sm:text-right">
                <div className="text-lg font-black text-slate-900">
                  ${selectedProp.price}
                  <span className="text-xs text-slate-500 font-normal">
                    /{selectedProp.pricePeriod}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {selectedProp.shuttleRoute}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectProperty(selectedProp)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Details
                </button>
                <button
                  onClick={() => onBookProperty(selectedProp)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1"
                >
                  <span>Book</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Summary Grid of Stays on Map */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Stays Plotted Around {selectedCollege?.shortName}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {displayProperties.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPropId(p.id)}
              className={`text-left p-2.5 rounded-xl border transition-all ${
                selectedPropId === p.id
                  ? "bg-indigo-50 border-indigo-500 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="text-[10px] font-semibold text-slate-400 truncate">
                {p.type.toUpperCase()} • {p.walkTimeMinutes}m walk
              </div>
              <div className="font-bold text-xs text-slate-900 truncate mt-0.5">
                {p.title}
              </div>
              <div className="text-xs font-extrabold text-indigo-700 mt-1">
                ${p.price}/{p.pricePeriod}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
