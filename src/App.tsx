import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar.js";
import { BottomNav, type TabType } from "./components/BottomNav.js";
import { StayList } from "./components/StayList.js";
import { CampusMapView } from "./components/CampusMapView.js";
import { RoommateMatcher } from "./components/RoommateMatcher.js";
import { AgreementViewer } from "./components/AgreementViewer.js";
import { BookingsHub } from "./components/BookingsHub.js";
import { StayDetailModal } from "./components/StayDetailModal.js";
import { BookingModal } from "./components/BookingModal.js";
import { api } from "./services/api.js";
import type {
  College,
  PropertyStay,
  RoommateProfile,
  PropertyAgreement,
  PropertyBooking,
} from "./types.js";
import { Sparkles, CheckCircle2, ShieldCheck, Smartphone } from "lucide-react";

export default function App() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [properties, setProperties] = useState<PropertyStay[]>([]);
  const [roommates, setRoommates] = useState<RoommateProfile[]>([]);
  const [agreements, setAgreements] = useState<PropertyAgreement[]>([]);
  const [bookings, setBookings] = useState<PropertyBooking[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<TabType>("stays");

  // Mobile smartphone frame simulation mode
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Modals
  const [detailProperty, setDetailProperty] = useState<PropertyStay | null>(null);
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    property: PropertyStay | null;
    splitWithRoommate?: boolean;
    preselectedRoommate?: RoommateProfile | null;
  }>({
    isOpen: false,
    property: null,
    splitWithRoommate: false,
    preselectedRoommate: null,
  });

  // Global toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    async function initData() {
      try {
        const [collegesData, agreementsData, bookingsData] = await Promise.all([
          api.getColleges(),
          api.getAgreements(),
          api.getBookings(),
        ]);
        setColleges(collegesData);
        setAgreements(agreementsData);
        setBookings(bookingsData);

        if (collegesData.length > 0) {
          setSelectedCollege(collegesData[0]);
        }
      } catch (err) {
        console.error("Initial load error:", err);
      }
    }
    initData();
  }, []);

  // Fetch properties and roommates when selected college changes
  useEffect(() => {
    if (!selectedCollege) return;

    async function loadCampusData() {
      try {
        const [props, rms] = await Promise.all([
          api.getProperties({ collegeId: selectedCollege?.id }),
          api.getRoommates(selectedCollege?.id),
        ]);
        setProperties(props);
        setRoommates(rms);
      } catch (err) {
        console.error("Campus data load error:", err);
      }
    }
    loadCampusData();
  }, [selectedCollege?.id]);

  // Handlers
  const handleSelectPropertyForBooking = (
    property: PropertyStay,
    splitWithRoommate?: boolean
  ) => {
    setDetailProperty(null);
    setBookingModal({
      isOpen: true,
      property,
      splitWithRoommate: !!splitWithRoommate,
      preselectedRoommate: null,
    });
  };

  const handleRequestBookingWithRoommate = (roommate: RoommateProfile) => {
    // Find target property or first available shared property
    const prop =
      properties.find((p) => p.id === roommate.targetStayId) ||
      properties.find((p) => p.roomType === "Shared Double" || p.roomType === "Full Apartment") ||
      properties[0];

    if (prop) {
      setBookingModal({
        isOpen: true,
        property: prop,
        splitWithRoommate: true,
        preselectedRoommate: roommate,
      });
    } else {
      setActiveTab("stays");
    }
  };

  const handleBookingSuccess = (
    newBooking: PropertyBooking,
    newAgreement: PropertyAgreement
  ) => {
    setBookings((prev) => [newBooking, ...prev]);
    setAgreements((prev) => [newAgreement, ...prev]);
    showToast(`Stay Reserved! Keycode: ${newBooking.accessCode}`);
    setActiveTab("bookings");
  };

  const handleAgreementSigned = (updated: PropertyAgreement) => {
    setAgreements((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    setBookings((prev) =>
      prev.map((b) =>
        b.agreementId === updated.id ? { ...b, status: "confirmed" } : b
      )
    );
    showToast("Lease agreement officially certified & active!");
  };

  const handleJumpToAgreement = (agreementId?: string) => {
    setActiveTab("agreements");
  };

  return (
    <div
      className={`min-h-screen bg-slate-100 flex flex-col items-center transition-all ${
        isMobileFrame ? "py-4 sm:py-8 px-2 sm:px-4" : ""
      }`}
    >
      {/* App Container (Either Smartphone frame or full width container) */}
      <div
        className={`w-full bg-white transition-all flex flex-col relative ${
          isMobileFrame
            ? "max-w-[420px] min-h-[844px] rounded-[44px] shadow-2xl border-[10px] border-slate-900 overflow-hidden ring-1 ring-slate-800"
            : "max-w-4xl min-h-screen shadow-xs"
        }`}
      >
        {/* Simulated Smartphone Dynamic Island & Status Bar (Only in Mobile Frame) */}
        {isMobileFrame && (
          <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex items-center justify-between text-xs select-none sticky top-0 z-40">
            <span className="font-bold text-[11px] tracking-tight">9:41</span>
            {/* Dynamic Island pill */}
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-1.5 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[9px] font-bold text-slate-300 truncate">
                {selectedCollege?.shortName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span>5G</span>
              <div className="w-4 h-2 border border-white/60 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-white rounded-2xs"></div>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Navigation Header */}
        <Navbar
          colleges={colleges}
          selectedCollege={selectedCollege}
          onSelectCollege={(c) => setSelectedCollege(c)}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          activeTab={activeTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-5 overflow-y-auto">
          {activeTab === "stays" && (
            <StayList
              properties={properties}
              selectedCollege={selectedCollege}
              onSelectProperty={(p) => setDetailProperty(p)}
              onBookProperty={(p) => handleSelectPropertyForBooking(p, false)}
            />
          )}

          {activeTab === "map" && (
            <CampusMapView
              properties={properties}
              selectedCollege={selectedCollege}
              onSelectProperty={(p) => setDetailProperty(p)}
              onBookProperty={(p) => handleSelectPropertyForBooking(p, false)}
            />
          )}

          {activeTab === "roommates" && (
            <RoommateMatcher
              college={selectedCollege}
              properties={properties}
              onSelectStayForCoLease={(stay, rm) => {
                setBookingModal({
                  isOpen: true,
                  property: stay,
                  splitWithRoommate: true,
                  preselectedRoommate: rm,
                });
              }}
              onRequestBookingWithRoommate={handleRequestBookingWithRoommate}
            />
          )}

          {activeTab === "agreements" && (
            <AgreementViewer
              agreements={agreements}
              onAgreementSigned={handleAgreementSigned}
            />
          )}

          {activeTab === "bookings" && (
            <BookingsHub
              bookings={bookings}
              onOpenAgreement={handleJumpToAgreement}
              onExploreStays={() => setActiveTab("stays")}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          bookingsCount={bookings.length}
          agreementsCount={agreements.filter((a) => a.status === "draft").length}
        />

        {/* Mobile Home Bar indicator in phone view */}
        {isMobileFrame && (
          <div className="h-4 bg-white flex items-center justify-center pb-1">
            <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      {detailProperty && (
        <StayDetailModal
          property={detailProperty}
          onClose={() => setDetailProperty(null)}
          onBook={(prop, split) => handleSelectPropertyForBooking(prop, split)}
          onFindRoommate={(prop) => {
            setActiveTab("roommates");
          }}
        />
      )}

      {/* Checkout / Booking Modal */}
      {bookingModal.isOpen && (
        <BookingModal
          property={bookingModal.property}
          roommates={roommates}
          preselectedRoommate={bookingModal.preselectedRoommate}
          defaultSplit={bookingModal.splitWithRoommate}
          onClose={() =>
            setBookingModal({
              isOpen: false,
              property: null,
              splitWithRoommate: false,
              preselectedRoommate: null,
            })
          }
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
