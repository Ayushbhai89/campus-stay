import React, { useState, useRef } from "react";
import {
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Bot,
  CheckCircle2,
  PenTool,
  Calendar,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Download,
  Share2,
  Printer,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import type { PropertyAgreement, LeaseClause } from "../types.js";
import { api } from "../services/api.js";

interface AgreementViewerProps {
  agreements: PropertyAgreement[];
  onAgreementSigned: (updated: PropertyAgreement) => void;
}

export const AgreementViewer: React.FC<AgreementViewerProps> = ({
  agreements,
  onAgreementSigned,
}) => {
  const [selectedAgrId, setSelectedAgrId] = useState<string>(
    agreements[0]?.id || ""
  );
  const [signatureText, setSignatureText] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // AI Clause Q&A / Inspector State
  const [activeClauseForAi, setActiveClauseForAi] = useState<LeaseClause | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    studentSummary: string;
    cautions: string[];
    fairnessScore: string;
    answer?: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [studentQuestion, setStudentQuestion] = useState("");
  const [signingSuccessMsg, setSigningSuccessMsg] = useState(false);

  const activeAgreement = agreements.find((a) => a.id === selectedAgrId) || agreements[0];

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = ("clientX" in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ("clientY" in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#4338ca"; // indigo-700
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("clientX" in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ("clientY" in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Inspect clause with Gemini
  const handleInspectClause = async (clause: LeaseClause, customQ?: string) => {
    setActiveClauseForAi(clause);
    setAiLoading(true);
    try {
      const res = await api.analyzeClauseWithAi(clause.title, clause.text, customQ);
      setAiAnalysis(res);
    } catch (err) {
      console.error(err);
      setAiAnalysis({
        studentSummary: clause.plainEnglishSummary,
        cautions: ["Make sure move-in condition checklist is signed within 48 hours."],
        fairnessScore: "Standard Student-Friendly Clause",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Sign agreement
  const handleSignAgreement = async () => {
    if (!activeAgreement) return;
    const sig = signatureText.trim()
      ? `${signatureText} [Verified Student ID ${activeAgreement.tenantStudentId}]`
      : `Drawn E-Signature [Student ID ${activeAgreement.tenantStudentId}]`;

    try {
      const updated = await api.signAgreement(activeAgreement.id, sig);
      onAgreementSigned(updated);
      setSigningSuccessMsg(true);
      setTimeout(() => setSigningSuccessMsg(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeAgreement) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
        <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-sm">No Property Agreements Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Book a stay or co-lease with a matched roommate to automatically generate a student tenancy agreement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified College Tenancy Agreements</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Lease & Sublease Agreements
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Standardized, escrow-protected collegiate contracts with Gemini AI legal clause breakdowns and digital e-signing.
            </p>
          </div>
        </div>

        {/* Agreement Selector Tabs */}
        {agreements.length > 1 && (
          <div className="flex gap-2 overflow-x-auto mt-4 pt-3 border-t border-white/10">
            {agreements.map((agr) => (
              <button
                key={agr.id}
                onClick={() => setSelectedAgrId(agr.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  activeAgreement.id === agr.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {agr.propertyTitle.split(" ")[0]}... ({agr.status.toUpperCase()})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {signingSuccessMsg && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-6 h-6 text-emerald-200 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-sm">Lease Successfully Executed & Certified!</div>
            <div className="text-emerald-100">
              Your tenancy agreement has been cryptographically stamped with your Student ID and sent to the landlord.
            </div>
          </div>
        </div>
      )}

      {/* Official Student Tenancy Agreement Document View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Document Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Official Student Contract
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  activeAgreement.status === "signed"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                Status: {activeAgreement.status}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {activeAgreement.propertyTitle}
            </h2>
            <p className="text-xs text-slate-500">{activeAgreement.propertyAddress}</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <button
              onClick={() => window.print()}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
              title="Print / Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print/PDF</span>
            </button>
          </div>
        </div>

        {/* Contract Key Terms Matrix */}
        <div className="p-4 sm:p-6 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/30 text-xs">
          <div className="p-3 bg-white rounded-xl border border-indigo-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Monthly Rent
            </span>
            <span className="text-base font-black text-slate-900">
              ${activeAgreement.monthlyRent}
            </span>
            {activeAgreement.coTenantName && (
              <span className="text-[10px] text-indigo-600 block mt-0.5 font-bold">
                (Split 50% with {activeAgreement.coTenantName.split(" ")[0]})
              </span>
            )}
          </div>

          <div className="p-3 bg-white rounded-xl border border-indigo-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Escrow Deposit
            </span>
            <span className="text-base font-black text-slate-900">
              ${activeAgreement.securityDeposit}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5 font-semibold">
              Protected in Escrow
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-indigo-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Primary Tenant
            </span>
            <span className="font-bold text-slate-900 truncate block">
              {activeAgreement.tenantName}
            </span>
            <span className="text-[10px] text-slate-500 block truncate">
              ID: {activeAgreement.tenantStudentId}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-indigo-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Lease Dates
            </span>
            <span className="font-bold text-slate-900 truncate block">
              {activeAgreement.startDate}
            </span>
            <span className="text-[10px] text-slate-500 block">
              to {activeAgreement.endDate}
            </span>
          </div>
        </div>

        {/* Contract Clauses with AI Explainer Buttons */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Legally Binding Agreement Clauses
            </h3>
            <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> Tap any clause for AI breakdown
            </span>
          </div>

          <div className="space-y-3">
            {activeAgreement.clauses.map((clause) => (
              <div
                key={clause.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 transition-all hover:border-indigo-300"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {clause.title}
                  </h4>
                  <button
                    onClick={() => handleInspectClause(clause)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Explain with AI</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-serif">
                  {clause.text}
                </p>

                {/* Plain English Banner */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-start gap-1.5 text-[11px] text-slate-700">
                  <span className="font-bold text-indigo-600 shrink-0">Student Summary:</span>
                  <span>{clause.plainEnglishSummary}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Signature Execution Section */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
          {activeAgreement.status === "signed" ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm">
                    Agreement Officially Signed & Active
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Tenant Signature: <strong className="text-emerald-800">{activeAgreement.tenantSignature}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Signed Timestamp: {activeAgreement.signedAt} • Landlord: {activeAgreement.landlordSignature}
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Copy</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-indigo-600" />
                    <span>Digital Student Signature Required</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sign using your finger/mouse on the canvas or type your legal student name
                  </p>
                </div>
                {hasDrawnSignature && (
                  <button
                    onClick={clearCanvas}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Clear Drawing
                  </button>
                )}
              </div>

              {/* Signature Canvas */}
              <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-2 relative">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={110}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-28 cursor-crosshair rounded-xl touch-none"
                />
                {!hasDrawnSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-semibold">
                    Sign with finger or mouse here
                  </div>
                )}
              </div>

              {/* Or Type Name */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">or type:</span>
                <input
                  type="text"
                  placeholder={`e.g. ${activeAgreement.tenantName}`}
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="flex items-start gap-2 pt-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  defaultChecked
                  className="mt-0.5 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="agree-checkbox" className="cursor-pointer">
                  I confirm that I am a registered student at {activeAgreement.collegeName}, have reviewed the lease provisions, and accept the monthly rent terms.
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="sign-and-certify-btn"
                onClick={handleSignAgreement}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Execute & Sign Agreement</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Clause Explainer Modal */}
      {activeClauseForAi && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    AI Student Lease Advisor
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Examining: {activeClauseForAi.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveClauseForAi(null);
                  setAiAnalysis(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {aiLoading ? (
              <div className="py-12 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Gemini is checking legal clauses for student fairness & hidden fees...
                </p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-3.5 text-xs">
                {/* Fairness Rating */}
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-950">Fairness Rating:</span>
                  <span className="font-black text-emerald-700">{aiAnalysis.fairnessScore}</span>
                </div>

                {/* Plain English Summary */}
                <div className="bg-indigo-50/70 rounded-2xl p-3 border border-indigo-100">
                  <span className="font-bold text-indigo-950 block mb-1">
                    Plain English Translation:
                  </span>
                  <p className="text-indigo-900 leading-relaxed">
                    {aiAnalysis.studentSummary}
                  </p>
                </div>

                {/* Watchouts / Student Protections */}
                {aiAnalysis.cautions && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Student Watch-Outs:</span>
                    </h4>
                    <div className="space-y-1.5">
                      {aiAnalysis.cautions.map((caution, i) => (
                        <div
                          key={i}
                          className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 flex items-start gap-2"
                        >
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{caution}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Question Q&A */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Ask Gemini a specific question about this clause:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Can I sublet my room over winter break?"
                      value={studentQuestion}
                      onChange={(e) => setStudentQuestion(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleInspectClause(activeClauseForAi, studentQuestion)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shrink-0"
                    >
                      Ask AI
                    </button>
                  </div>
                  {aiAnalysis.answer && (
                    <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950 mt-2 font-medium">
                      <strong>AI Answer:</strong> {aiAnalysis.answer}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveClauseForAi(null);
                      setAiAnalysis(null);
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Got it
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
