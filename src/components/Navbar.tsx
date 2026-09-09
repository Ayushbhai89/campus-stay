import React from "react";
import {
  GraduationCap,
  Smartphone,
  Maximize2,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { College } from "../types.js";

interface NavbarProps {
  colleges: College[];
  selectedCollege: College | null;
  onSelectCollege: (college: College) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  colleges,
  selectedCollege,
  onSelectCollege,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Utility & Campus Selector Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand & Campus Chooser */}
        <div className="relative">
          <button
            id="college-selector-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 text-left p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                  CampusStay
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> Edu Verified
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-700 font-semibold">
                <span>{selectedCollege?.shortName || "Select Campus"}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* Campus Dropdown */}
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Choose University Campus
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {colleges.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCollege(c);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedCollege?.id === c.id
                        ? "bg-indigo-50 text-indigo-900 font-bold border border-indigo-200"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>{c.city}, {c.state}</span>
                        <span>•</span>
                        <span className="text-indigo-600">{c.mascot}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle & AI Indicator */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50/80 text-indigo-700 text-xs px-2.5 py-1.5 rounded-full border border-indigo-100 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Match Enabled</span>
          </div>

          <button
            id="toggle-device-view-btn"
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? "Switch to Wide Mode" : "Switch to Mobile Phone View"}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-semibold"
          >
            {isMobileFrame ? (
              <>
                <Maximize2 className="w-4 h-4 text-slate-700" />
                <span className="hidden md:inline">Wide View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline">Phone View</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
