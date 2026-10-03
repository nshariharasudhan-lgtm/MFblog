import React, { useState } from "react";
import { Key, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { changeAdminPassword } from "../../lib/storage";

interface ChangePasswordModalProps {
  onSuccess: () => void;
  onDismiss: () => void;
}

export function ChangePasswordModal({ onSuccess, onDismiss }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await changeAdminPassword(currentPassword, newPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF9F5] border border-[#E0DDD3] rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative space-y-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>First-Time Login Security Setup</span>
          </div>
          <h3 className="font-serif-editorial text-2xl text-stone-900 font-semibold pt-1">
            Update Admin Password
          </h3>
          <p className="text-xs text-stone-600">
            Please replace the dummy temporary password with your permanent password for <strong>ns.hariharasudhan@gmail.com</strong>.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Password updated successfully! Welcome to YieldNest.online.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
              Current Temporary Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-stone-900 font-mono-data"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
              New Permanent Password (min. 8 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full text-xs p-2.5 pr-10 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-stone-900 font-mono-data"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-mono-data">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-stone-900 font-mono-data"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="bg-[#1A1A1A] hover:bg-black text-white text-xs px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Saving Password..." : "Set New Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
