"use client";
import { useEffect, useState } from "react";
import { TagInput } from "@/components/TagInput";

interface ICP {
  id: string;
  name: string;
  industries: string;
  companySizes: string;
  geographies: string;
  jobTitles: string;
  techStack: string;
  keywords: string;
  revenueMin: number | null;
  revenueMax: number | null;
}

const emptyForm = {
  name: "",
  industries: [] as string[],
  companySizes: [] as string[],
  geographies: [] as string[],
  jobTitles: [] as string[],
  techStack: [] as string[],
  keywords: [] as string[],
  revenueMin: "",
  revenueMax: "",
};

export default function ICPPage() {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () =>
    fetch("/api/icp")
      .then((r) => r.json())
      .then(setIcps);

  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    await fetch("/api/icp", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setForm(emptyForm);
    setEditId(null);
    await load();
    setLoading(false);
  };

  const del = async (id: string) => {
    await fetch(`/api/icp?id=${id}`, { method: "DELETE" });
    await load();
  };

  const edit = (icp: ICP) => {
    setEditId(icp.id);
    setForm({
      name: icp.name,
      industries: JSON.parse(icp.industries),
      companySizes: JSON.parse(icp.companySizes),
      geographies: JSON.parse(icp.geographies),
      jobTitles: JSON.parse(icp.jobTitles),
      techStack: JSON.parse(icp.techStack),
      keywords: JSON.parse(icp.keywords),
      revenueMin: icp.revenueMin?.toString() || "",
      revenueMax: icp.revenueMax?.toString() || "",
    });
  };

  const SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10001+"];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ideal Customer Profile (ICP)</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">
          {editId ? "Edit ICP" : "Create New ICP"}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">ICP Name</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Mid-Market SaaS Companies"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TagInput label="Industries" values={form.industries} onChange={(v) => setForm({ ...form, industries: v })} placeholder="e.g. SaaS, Fintech" />
          <TagInput label="Target Job Titles" values={form.jobTitles} onChange={(v) => setForm({ ...form, jobTitles: v })} placeholder="e.g. VP of Sales, CRO" />
          <TagInput label="Geographies" values={form.geographies} onChange={(v) => setForm({ ...form, geographies: v })} placeholder="e.g. United States, UK" />
          <TagInput label="Tech Stack (they use)" values={form.techStack} onChange={(v) => setForm({ ...form, techStack: v })} placeholder="e.g. Salesforce, HubSpot" />
          <TagInput label="Intent Keywords" values={form.keywords} onChange={(v) => setForm({ ...form, keywords: v })} placeholder="e.g. revenue growth, pipeline" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Sizes</label>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  const cur = form.companySizes;
                  setForm({
                    ...form,
                    companySizes: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
                  });
                }}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  form.companySizes.includes(s)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={loading || !form.name}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : editId ? "Update ICP" : "Create ICP"}
          </button>
          {editId && (
            <button
              onClick={() => { setEditId(null); setForm(emptyForm); }}
              className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {icps.map((icp) => (
          <div key={icp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{icp.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {JSON.parse(icp.industries).slice(0, 3).map((i: string) => (
                    <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{i}</span>
                  ))}
                  {JSON.parse(icp.companySizes).slice(0, 3).map((s: string) => (
                    <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{s}</span>
                  ))}
                  {JSON.parse(icp.geographies).slice(0, 2).map((g: string) => (
                    <span key={g} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded">{g}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Titles: {JSON.parse(icp.jobTitles).join(", ") || "—"}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(icp)} className="text-sm text-blue-600 hover:underline">Edit</button>
                <button onClick={() => del(icp.id)} className="text-sm text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
