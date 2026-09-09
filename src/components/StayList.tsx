import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Navigation,
  Bus,
  Shield,
  Star,
  Sparkles,
  Bed,
  Bath,
  ArrowRight,
  Filter,
} from "lucide-react";
import type { PropertyStay, College } from "../types.js";

interface StayListProps {
  properties: PropertyStay[];
  selectedCollege: College | null;
  onSelectProperty: (property: PropertyStay) => void;
  onBookProperty: (property: PropertyStay) => void;
  onMatchRoommateForProperty?: (property: PropertyStay) => void;
}

export const StayList: React.FC<StayListProps> = ({
  properties,
  selectedCollege,
  onSelectProperty,
  onBookProperty,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(2.0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating">("distance");

  const propertyTypes = [
    { id: "all", label: "All Stays" },
    { id: "dorm", label: "Student Dorms" },
    { id: "apartment", label: "Apartments" },
    { id: "sublet", label: "Semester Sublets" },
    { id: "hotel", label: "Campus Hotels" },
  ];

  // Filtering
  const filtered = properties
    .filter((p) => {
      if (selectedType !== "all" && p.type !== selectedType) return false;
      if (p.distanceToCampusMiles > maxDistance) return false;
      if (p.price > maxPrice) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchAddress = p.address.toLowerCase().includes(q);
        const matchAmenities = p.amenities.some((a) => a.toLowerCase().includes(q));
        const matchShuttle = p.shuttleRoute.toLowerCase().includes(q);
        if (!matchTitle && !matchAddress && !matchAmenities && !matchShuttle) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "distance") return a.distanceToCampusMiles - b.distanceToCampusMiles;
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="space-y-4 pb-20">
      {/* College Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm mb-2">
            <Navigation className="w-3.5 h-3.5 text-indigo-300" />
            <span>Near {selectedCollege?.campusCenter || "Campus Quad"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            Student Housing & Hotel Stays
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
            Verified student dorms, apartments, sublets, and campus transition hotels with shuttle routes & roommate matching.
          </p>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-white/10 text-xs text-slate-200">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {filtered.length} Stays Available
            </span>
            <span>•</span>
            <span className="text-slate-300">
              Avg Walk:{" "}
              <strong className="text-white">
                {filtered.length > 0
                  ? Math.round(
                      filtered.reduce((acc, p) => acc + p.walkTimeMinutes, 0) /
                        filtered.length
                    )
                  : 5}{" "}
                mins
              </strong>
            </span>
            <span>•</span>
            <span className="text-indigo-200">Shuttle routes mapped</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="stay-search-input"
            type="text"
            placeholder="Search by street, amenity, or shuttle line..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ✕
            </button>
          )}
        </div>
        <button
          id="toggle-filter-btn"
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-2xl border transition-colors flex items-center justify-center ${
            showFilters
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
          title="Filter Stays"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filter Options
            </span>
            <button
              onClick={() => {
                setMaxDistance(2.0);
                setMaxPrice(2000);
                setSelectedType("all");
                setSortBy("distance");
              }}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Distance Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Distance to Quad:</span>
                <span className="font-bold text-indigo-600">≤ {maxDistance} mi</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0.1 mi (On-campus)</span>
                <span>2.0 mi</span>
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Max Price:</span>
                <span className="font-bold text-indigo-600">${maxPrice} / period</span>
              </div>
              <input
                type="range"
                min="500"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>$500/mo</span>
                <span>$2,000/mo</span>
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sort Listings By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="distance">Closest to Campus Quad</option>
                <option value="price">Price: Lowest First</option>
                <option value="rating">Top Student Rating</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Property Type Horizontal Scrolling Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {propertyTypes.map((t) => (
          <button
            key={t.id}
            id={`filter-type-${t.id}`}
            onClick={() => setSelectedType(t.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === t.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Property List Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
          <Navigation className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No stays matching filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Try adjusting your maximum distance slider or clearing search terms to see more options around campus.
          </p>
          <button
            onClick={() => {
              setMaxDistance(2.0);
              setMaxPrice(2000);
              setSelectedType("all");
              setSearchQuery("");
            }}
            className="mt-3 px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((property) => (
            <div
              key={property.id}
              id={`stay-card-${property.id}`}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col"
            >
              {/* Image & Quick Badges */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Overlay Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    {property.type === "hotel" ? "Campus Hotel" : property.type}
                  </span>
                  {property.isPopular && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> Popular
                    </span>
                  )}
                </div>

                {/* Safety Score Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-extrabold shadow-sm flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-600" />
                    {property.safetyScore}/10 Safe
                  </span>
                </div>

                {/* Walk Time & Shuttle Banner */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-2.5 pt-6 text-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Navigation className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>
                      {property.walkTimeMinutes} min walk ({property.distanceToCampusMiles} mi to quad)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-200">
                    <Bus className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[130px]">{property.shuttleRoute}</span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight group-hover:text-indigo-600 transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{property.address}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 font-bold text-xs shrink-0 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{property.rating}</span>
                      <span className="text-[10px] text-slate-400">({property.reviewCount})</span>
                    </div>
                  </div>

                  {/* Room specs */}
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 font-medium">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-700">
                      {property.roomType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-slate-400" /> {property.bedrooms} Bed
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-slate-400" /> {property.bathrooms} Bath
                    </span>
                  </div>

                  {/* Amenities Snippet */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {property.amenities.slice(0, 3).map((a, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md"
                      >
                        {a}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 text-slate-400">
                        +{property.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Pricing & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {property.type === "hotel" ? "Nightly Rate" : "Student Rent"}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-900">
                        ${property.price}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        /{property.pricePeriod}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`view-details-btn-${property.id}`}
                      onClick={() => onSelectProperty(property)}
                      className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Details
                    </button>
                    <button
                      id={`book-now-btn-${property.id}`}
                      onClick={() => onBookProperty(property)}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
