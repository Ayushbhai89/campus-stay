import React from "react";
import {
  Building2,
  MapPin,
  Users,
  FileCheck2,
  CalendarCheck,
} from "lucide-react";

export type TabType = "stays" | "map" | "roommates" | "agreements" | "bookings";

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  bookingsCount: number;
  agreementsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  bookingsCount,
  agreementsCount,
}) => {
  const tabs = [
    {
      id: "stays" as TabType,
      label: "Stays",
      icon: Building2,
      badge: null,
    },
    {
      id: "map" as TabType,
      label: "Campus Map",
      icon: MapPin,
      badge: null,
    },
    {
      id: "roommates" as TabType,
      label: "Roommates",
      icon: Users,
      badge: "AI",
    },
    {
      id: "agreements" as TabType,
      label: "Agreements",
      icon: FileCheck2,
      badge: agreementsCount > 0 ? agreementsCount : null,
    },
    {
      id: "bookings" as TabType,
      label: "Bookings",
      icon: CalendarCheck,
      badge: bookingsCount > 0 ? bookingsCount : null,
    },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg shadow-slate-900/5">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={`tab-btn-${t.id}`}
              onClick={() => onChangeTab(t.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "text-indigo-600 font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                  }`}
                />
                {t.badge && (
                  <span
                    className={`absolute -top-1.5 -right-3 px-1.5 py-0.2 rounded-full text-[9px] font-black leading-tight tracking-tight shadow-sm ${
                      t.badge === "AI"
                        ? "bg-indigo-600 text-white animate-pulse"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{t.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
