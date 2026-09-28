import React, { useState, useEffect } from "react";
import { Users, Mail, Trash2, Download, Search, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import { Subscriber } from "../../types";
import { getAllSubscribers, deleteSubscriber } from "../../lib/storage";

export function SubscribersManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    const data = await getAllSubscribers();
    setSubscribers(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this subscriber from the mailing list?")) {
      await deleteSubscriber(id);
      loadSubscribers();
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ["Email", "Name", "Categories", "Status", "Subscribed At"];
    const rows = subscribers.map((s) => [
      s.email,
      s.name || "",
      (s.categoryPreferences || []).join("; "),
      s.status,
      s.subscribedAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `yieldnest-subscribers-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif-editorial text-stone-900 font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-stone-700" />
            <span>Newsletter & Research Subscribers</span>
          </h2>
          <p className="text-xs text-stone-500 font-mono-data">
            Investors receiving automated AMFI weekly research notes and mutual fund comparison reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSubscribers}
            disabled={loading}
            className="p-2 border border-stone-200 bg-white hover:bg-stone-50 rounded-xl text-stone-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
            className="bg-[#1A1A1A] hover:bg-black text-white text-xs px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({subscribers.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#EAE8E0]">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search subscriber email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-800 bg-[#FAF9F5]"
          />
        </div>
        <div className="text-xs font-mono-data text-stone-500">
          Total: <strong className="text-stone-900">{subscribers.length}</strong> active readers
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl border border-[#EAE8E0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#EAE8E0] text-stone-600 font-mono-data">
              <tr>
                <th className="py-3 px-4 font-medium">Subscriber Email</th>
                <th className="py-3 px-3 font-medium">Investor Name</th>
                <th className="py-3 px-3 font-medium">Preferred Research</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium">Joined Date</th>
                <th className="py-3 px-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500 italic">
                    {search ? "No matching subscribers found." : "No subscribers enrolled yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono-data font-semibold text-stone-900">
                      {sub.email}
                    </td>
                    <td className="py-3.5 px-3 text-stone-700">
                      {sub.name || <span className="text-stone-400 italic">Unspecified</span>}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {(sub.categoryPreferences || ["Fund Comparison"]).map((cat, i) => (
                          <span
                            key={i}
                            className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-mono-data"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-stone-500 font-mono-data text-[11px]">
                      {new Date(sub.subscribedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete subscriber"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
