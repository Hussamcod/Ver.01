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
  companySize: string | null;
  icpScore: number;
  intentScore: number;
  totalScore: number;
  status: string;
  personaMatch: string | null;
  intentSignals: string;
  technologies: string;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
}

export default function LeadsPage() {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIcp, setSelectedIcp] = useState("");
  const [searching, setSearching] = useState(false);
  const [scoring, setScoring] = useState<string | null>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/icp").then((r) => r.json()).then(setIcps);
    fetch("/api/leads").then((r) => r.json()).then(setLeads);
  }, []);

  const search = async () => {
    if (!selectedIcp) return;
    setSearching(true);
    setError("");
    try {
      const res = await fetch("/api/apollo/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icpId: selectedIcp, page }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setLeads((prev) => {
        const ids = new Set(data.leads.map((l: Lead) => l.id));
        return [...data.leads, ...prev.filter((l) => !ids.has(l.id))];
      });
      setTotal(data.total);
    } catch (e) {
      setError("Apollo search failed. Check your API key.");
    } finally {
      setSearching(false);
    }
  };

  const scoreAll = async () => {
    if (!selectedIcp) return;
    const unscoredLeads = leads.filter((l) => l.totalScore === 0);
    for (const lead of unscoredLeads) {
      setScoring(lead.id);
      const res = await fetch("/api/leads/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, icpId: selectedIcp }),
      });
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === lead.id ? data.lead : l)));
      }
    }
    setScoring(null);
  };

  const scoreOne = async (leadId: string) => {
    if (!selectedIcp) { setError("Select an ICP first"); return; }
    setScoring(leadId);
    const res = await fetch("/api/leads/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, icpId: selectedIcp }),
    });
    const data = await res.json();
    if (data.lead) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
    }
    setScoring(null);
  };

  const updateStatus = async (leadId: string, status: string) => {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, status }),
    });
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
  };

  const sortedLeads = [...leads].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lead Discovery</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select ICP</label>
          <select
            value={selectedIcp}
            onChange={(e) => setSelectedIcp(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          >
            <option value="">-- Choose ICP --</option>
            {icps.map((icp) => (
              <option key={icp.id} value={icp.id}>{icp.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={search}
          disabled={!selectedIcp || searching}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {searching ? "Searching Apollo..." : "Search Apollo"}
        </button>
        <button
          onClick={scoreAll}
          disabled={!selectedIcp || !!scoring || leads.length === 0}
          className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {scoring ? "Scoring..." : "Score All Leads (AI)"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {total > 0 && (
          <span className="text-sm text-gray-500">{total.toLocaleString()} total matches in Apollo</span>
        )}
      </div>

      {sortedLeads.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No leads yet.</p>
          <p className="text-sm mt-1">Select an ICP and search Apollo to pull leads.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </span>
                    <span className="text-gray-400 text-sm">·</span>
                    <span className="text-sm text-gray-600">{lead.title}</span>
                    <span className="text-gray-400 text-sm">@</span>
                    <span className="text-sm font-medium text-gray-700">{lead.company}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-500">
                    {lead.industry && <span>{lead.industry}</span>}
                    {lead.geography && <span>· {lead.geography}</span>}
                    {lead.companySize && <span>· {lead.companySize} employees</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {lead.totalScore > 0 ? (
                    <>
                      <ScoreBadge score={lead.icpScore} label="ICP" />
                      <ScoreBadge score={lead.intentScore} label="Intent" />
                      <ScoreBadge score={lead.totalScore} label="Total" />
                    </>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); scoreOne(lead.id); }}
                      disabled={scoring === lead.id}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 disabled:opacity-50"
                    >
                      {scoring === lead.id ? "Scoring..." : "Score"}
                    </button>
                  )}
                  <select
                    value={lead.status}
                    onChange={(e) => { e.stopPropagation(); updateStatus(lead.id, e.target.value); }}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="new">New</option>
                    <option value="queued">Queued</option>
                    <option value="called">Called</option>
                    <option value="converted">Converted</option>
                    <option value="disqualified">Disqualified</option>
                  </select>
                </div>
              </div>

              {expandedLead === lead.id && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {lead.email && (
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-gray-800">{lead.email}</p>
                    </div>
                  )}
                  {lead.phone && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-gray-800">{lead.phone}</p>
                    </div>
                  )}
                  {lead.linkedinUrl && (
                    <div>
                      <p className="text-xs text-gray-500">LinkedIn</p>
                      <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">Profile</a>
                    </div>
                  )}
                  {JSON.parse(lead.intentSignals).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">Intent Signals</p>
                      <p className="text-gray-800">{JSON.parse(lead.intentSignals).join(", ")}</p>
                    </div>
                  )}
                  {JSON.parse(lead.technologies).length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Technologies</p>
                      <p className="text-gray-800">{JSON.parse(lead.technologies).join(", ")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
