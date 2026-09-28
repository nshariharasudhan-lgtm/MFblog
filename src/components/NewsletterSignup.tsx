import React, { useState } from "react";
import { Mail, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { addSubscriber } from "../lib/storage";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await addSubscriber(email, name);
      if (res.success) {
        setStatus("success");
        setMessage(res.message);
        setEmail("");
        setName("");
      } else {
        setStatus("error");
        setMessage(res.message);
      }
    } catch {
      setStatus("error");
      setMessage("Subscription failed. Please try again.");
    }
  };

  return (
    <div className="bg-[#F4F2EB] rounded-2xl border border-[#E6E3D8] p-6 sm:p-8 relative overflow-hidden">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs text-stone-700 bg-white px-3 py-1 rounded-full border border-stone-200 font-mono-data">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Mutual Fund Research Briefing</span>
        </div>

        <h3 className="font-serif-editorial text-2xl sm:text-3xl text-stone-900 font-semibold leading-tight">
          Receive Mutual Fund Research in Your Inbox
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
          Weekly quantitative roll-forward studies, SPIVA index tracking, and portfolio overlap alerts. Strictly for educational analysis; no sponsored bias or investment advice.
        </p>

        {status === "success" ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-2 space-y-3 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full sm:w-1/3 text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-stone-800"
              />
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:flex-1 text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-stone-800 font-mono-data"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-[#1A1A1A] hover:bg-black text-white text-xs px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
              >
                <span>{status === "loading" ? "Subscribing..." : "Subscribe"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {status === "error" && (
              <p className="text-xs text-rose-600 text-left pl-1">{message}</p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-[10px] text-stone-500 font-mono-data pt-1">
              <span>Educational briefings only</span>
              <span className="hidden sm:inline">•</span>
              <span>Not SEBI/AMFI registered financial advice</span>
              <span className="hidden sm:inline">•</span>
              <span>Unsubscribe anytime</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
