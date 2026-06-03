"use client";
import { useEffect, useState } from "react";
import { ScoreBadge } from "@/components/ScoreBadge";

interface ICP {
  id: string;
  name: string;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  industry: string | null;
  geography: string | null;
  icpScore: number;
  intentScore: number;
  totalScore: number;
  status: string;
  callScript: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

export default function PipelinePage() {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIcp, setSelectedIcp] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [activeScript, setActiveScript] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/icp").then((r) => r.json()).then(setIcps);
    fetch("/api/leads?status=queued").then((r) => r.json()).then(setLeads);
  };

  useEffect(() => { load(); }, []);

  const generateScript = async (leadId: string) => {
    if (!selectedIcp) { setError("Select an ICP first"); return; }
    setGenerating(leadId);
    setError("");
    const res = await fetch("/api/leads/script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, icpId: selectedIcp }),
    });
    const data = await res.json();
    if (data.lead) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
      setActiveScript(data.lead);
    }
    setGenerating(null);
  };

  const updateStatus = async (leadId: string, status: string) => {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, status }),
    });
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (activeScript?.id === leadId) setActiveScript(null);
  };

  const saveNotes = async (leadId: string) => {
    setSavingNotes(true);
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, notes }),
    });
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, notes } : l)));
    setSavingNotes(false);
  };

  const sortedLeads = [...leads].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="flex gap-6 h-full">
      <div className="w-96 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Call Pipeline</h1>

        <div className="mb-4">
          <select
            value={selectedIcp}
            onChange={(e) => setSelectedIcp(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select ICP for scripts --</option>
            {icps.map((icp) => (
              <option key={icp.id} value={icp.id}>{icp.name}</option>
            ))}
          </select>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <p className="text-xs text-gray-500 mb-3">
          {sortedLeads.length} leads in queue · Sorted by score
        </p>

        {sortedLeads.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            <p>No leads in queue.</p>
            <p className="mt-1">Score and queue leads from the Lead Discovery page.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {sortedLeads.map((lead) => (
              <div
                key={lead.id}
                className={`bg-white rounded-lg border p-3 cursor-pointer transition-colors ${
                  activeScript?.id === lead.id
                    ? "border-blue-500 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => {
                  setActiveScript(lead);
                  setNotes(lead.notes || "");
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{lead.title}</p>
                    <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                  </div>
                  <div className="ml-2 flex flex-col items-end gap-1">
                    <ScoreBadge score={lead.totalScore} />
                    {lead.callScript && (
                      <span className="text-xs text-green-600 font-medium">Script ready</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {activeScript ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeScript.firstName} {activeScript.lastName}
                </h2>
                <p className="text-gray-600">{activeScript.title} · {activeScript.company}</p>
                <div className="flex gap-2 mt-2">
                  {activeScript.email && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {activeScript.email}
                    </span>
                  )}
                  {activeScript.phone && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {activeScript.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <ScoreBadge score={activeScript.icpScore} label="ICP" />
                <ScoreBadge score={activeScript.intentScore} label="Intent" />
                <ScoreBadge score={activeScript.totalScore} label="Total" />
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => generateScript(activeScript.id)}
                disabled={generating === activeScript.id || !selectedIcp}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {generating === activeScript.id
                  ? "Generating..."
                  : activeScript.callScript
                  ? "Regenerate Script"
                  : "Generate Call Script"}
              </button>
              <button
                onClick={() => updateStatus(activeScript.id, "called")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Mark as Called
              </button>
              <button
                onClick={() => updateStatus(activeScript.id, "converted")}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                Converted
              </button>
              <button
                onClick={() => updateStatus(activeScript.id, "disqualified")}
                className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Disqualify
              </button>
            </div>

            {activeScript.callScript ? (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Call Script</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-200">
                  {activeScript.callScript}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400 text-sm mb-6 border border-dashed border-gray-200">
                Click &quot;Generate Call Script&quot; to get an AI-written personalized script for this lead.
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Call Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add notes after the call..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => saveNotes(activeScript.id)}
                disabled={savingNotes}
                className="mt-2 text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium">Select a lead to view the call script</p>
              <p className="text-sm mt-1">Queue leads from the Lead Discovery page first</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
