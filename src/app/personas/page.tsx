"use client";
import { useEffect, useState } from "react";
import { TagInput } from "@/components/TagInput";

interface Persona {
  id: string;
  name: string;
  titles: string;
  seniority: string;
  painPoints: string;
  goals: string;
  valueProps: string;
  toneStyle: string;
}

const emptyForm = {
  name: "",
  titles: [] as string[],
  seniority: [] as string[],
  painPoints: [] as string[],
  goals: [] as string[],
  valueProps: [] as string[],
  toneStyle: "professional",
};

const SENIORITY = ["Individual Contributor", "Manager", "Director", "VP", "C-Level", "Founder"];
const TONES = ["professional", "casual", "direct", "consultative"];

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () =>
    fetch("/api/personas")
      .then((r) => r.json())
      .then(setPersonas);

  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    await fetch("/api/personas", {
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
    await fetch(`/api/personas?id=${id}`, { method: "DELETE" });
    await load();
  };

  const edit = (p: Persona) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      titles: JSON.parse(p.titles),
      seniority: JSON.parse(p.seniority),
      painPoints: JSON.parse(p.painPoints),
      goals: JSON.parse(p.goals),
      valueProps: JSON.parse(p.valueProps),
      toneStyle: p.toneStyle,
    });
  };

  const toggleSeniority = (s: string) => {
    const cur = form.seniority;
    setForm({ ...form, seniority: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s] });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buyer Personas</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">
          {editId ? "Edit Persona" : "Create Buyer Persona"}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Persona Name</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. The Revenue-Obsessed VP of Sales"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TagInput label="Job Titles" values={form.titles} onChange={(v) => setForm({ ...form, titles: v })} placeholder="e.g. VP of Sales, Sales Director" />
          <TagInput label="Pain Points" values={form.painPoints} onChange={(v) => setForm({ ...form, painPoints: v })} placeholder="e.g. Low pipeline coverage" />
          <TagInput label="Goals" values={form.goals} onChange={(v) => setForm({ ...form, goals: v })} placeholder="e.g. Hit quota, grow team" />
          <TagInput label="Your Value Propositions" values={form.valueProps} onChange={(v) => setForm({ ...form, valueProps: v })} placeholder="e.g. 3x pipeline in 90 days" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Seniority Levels</label>
          <div className="flex flex-wrap gap-2">
            {SENIORITY.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSeniority(s)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  form.seniority.includes(s)
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Call Tone Style</label>
          <div className="flex gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, toneStyle: t })}
                className={`px-3 py-1 rounded-full text-sm border capitalize transition-colors ${
                  form.toneStyle === t
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={loading || !form.name}
            className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : editId ? "Update Persona" : "Create Persona"}
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
        {personas.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded capitalize">{p.toneStyle}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Titles: {JSON.parse(p.titles).join(", ") || "—"}
                </p>
                <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                  <div>
                    <span className="font-medium text-gray-700">Pain Points</span>
                    <ul className="mt-1 list-disc list-inside space-y-0.5">
                      {JSON.parse(p.painPoints).map((pp: string) => <li key={pp}>{pp}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Goals</span>
                    <ul className="mt-1 list-disc list-inside space-y-0.5">
                      {JSON.parse(p.goals).map((g: string) => <li key={g}>{g}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Value Props</span>
                    <ul className="mt-1 list-disc list-inside space-y-0.5">
                      {JSON.parse(p.valueProps).map((v: string) => <li key={v}>{v}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => edit(p)} className="text-sm text-purple-600 hover:underline">Edit</button>
                <button onClick={() => del(p.id)} className="text-sm text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
