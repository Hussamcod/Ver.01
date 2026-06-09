"use client";
import { useEffect, useMemo, useState } from "react";

interface Lead {
  id: string;
  status: string;
  totalScore: number;
}

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "queued", label: "Queued" },
  { value: "called", label: "Called" },
  { value: "converted", label: "Converted" },
  { value: "disqualified", label: "Disqualified" },
];

const TARGETS = [
  {
    id: "odoo",
    name: "Odoo CRM",
    blurb: "Mapped to the Leads (crm.lead) import. Upload via CRM → Leads → Favorites → Import records.",
    accent: "bg-purple-600 hover:bg-purple-700",
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    blurb: "Mapped to the Leads module. Upload via Leads → Import → Import Leads.",
    accent: "bg-orange-600 hover:bg-orange-700",
  },
];

export default function ExportPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState("");
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then(setLeads)
      .catch(() => setLeads([]));
  }, []);

  const matching = useMemo(
    () =>
      leads.filter(
        (l) =>
          (!status || l.status === status) &&
          (minScore <= 0 || l.totalScore >= minScore)
      ).length,
    [leads, status, minScore]
  );

  const exportUrl = (target: string) => {
    const params = new URLSearchParams({ target });
    if (status) params.set("status", status);
    if (minScore > 0) params.set("minScore", String(minScore));
    return `/api/leads/export?${params.toString()}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Export to CRM</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Download your gathered leads as import-ready CSVs for Odoo and Zoho.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 flex flex-wrap items-end gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min. total score: <span className="font-semibold">{minScore}</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-48 align-middle"
          />
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{matching}</span> lead
          {matching === 1 ? "" : "s"} match
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TARGETS.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col"
          >
            <h2 className="text-lg font-semibold text-gray-900">{t.name}</h2>
            <p className="text-sm text-gray-500 mt-1 mb-4 flex-1">{t.blurb}</p>
            <a
              href={exportUrl(t.id)}
              className={`inline-block text-center text-white px-5 py-2 rounded-lg text-sm font-medium ${
                matching === 0 ? "pointer-events-none opacity-50 bg-gray-400" : t.accent
              }`}
            >
              Download {t.name} CSV
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
