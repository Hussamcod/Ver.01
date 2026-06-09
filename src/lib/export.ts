// CRM export helpers: turn gathered leads into import-ready CSVs for
// Odoo CRM (crm.lead) and Zoho CRM (Leads module).
//
// Column headers are chosen to match each CRM's import wizard so the
// fields auto-map without manual remapping. Enrichment data that has no
// native lead field (scores, technologies, intent signals, LinkedIn) is
// folded into the Notes/Description column so nothing is lost on upload.

export interface ExportLead {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string;
  seniority: string | null;
  company: string;
  industry: string | null;
  companySize: string | null;
  geography: string | null;
  linkedinUrl: string | null;
  website: string | null;
  technologies: string; // JSON string[]
  intentSignals: string; // JSON string[]
  icpScore: number;
  intentScore: number;
  totalScore: number;
  personaMatch: string | null;
  status: string;
}

export type ExportTarget = "odoo" | "zoho";

const LEAD_SOURCE = "GTM Engine";

// --- CSV serialization ---------------------------------------------------

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: Record<string, unknown>[]): string {
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvCell(row[h])).join(","));
  }
  // Prepend a UTF-8 BOM so Excel/CRM importers read non-ASCII names correctly.
  return "﻿" + lines.join("\r\n");
}

// --- shared field helpers ------------------------------------------------

function parseList(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter(Boolean).map(String) : [];
  } catch {
    return [];
  }
}

function websiteUrl(domain: string | null): string {
  if (!domain) return "";
  return /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
}

// Best-effort split of the combined "City, State, Country" location string.
function splitLocation(geography: string | null): {
  city: string;
  state: string;
  country: string;
} {
  const parts = (geography || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return { city: parts[0], state: parts[1], country: parts[parts.length - 1] };
  }
  if (parts.length === 2) {
    return { city: parts[0], state: "", country: parts[1] };
  }
  return { city: parts[0] || "", state: "", country: "" };
}

// Fold non-standard enrichment fields into a single notes block.
function enrichmentNotes(lead: ExportLead): string {
  const tech = parseList(lead.technologies);
  const intent = parseList(lead.intentSignals);
  const lines: string[] = [];

  if (lead.totalScore > 0) {
    lines.push(
      `Lead score — Total: ${lead.totalScore} | ICP: ${lead.icpScore} | Intent: ${lead.intentScore}`
    );
  }
  if (lead.personaMatch) lines.push(`Persona match: ${lead.personaMatch}`);
  if (lead.seniority) lines.push(`Seniority: ${lead.seniority}`);
  if (intent.length) lines.push(`Intent signals: ${intent.join(", ")}`);
  if (tech.length) lines.push(`Technologies: ${tech.join(", ")}`);
  if (lead.linkedinUrl) lines.push(`LinkedIn: ${lead.linkedinUrl}`);
  lines.push(`Source: ${LEAD_SOURCE} (Apollo) | Pipeline status: ${lead.status}`);

  return lines.join("\n");
}

// --- Odoo CRM (crm.lead) -------------------------------------------------

const ODOO_HEADERS = [
  "Opportunity",
  "Contact Name",
  "Company Name",
  "Email",
  "Phone",
  "Job Position",
  "Website",
  "City",
  "Tags",
  "Source",
  "Notes",
];

function odooRow(lead: ExportLead): Record<string, unknown> {
  const fullName = `${lead.firstName} ${lead.lastName}`.trim();
  return {
    Opportunity: [fullName, lead.company].filter(Boolean).join(" — "),
    "Contact Name": fullName,
    "Company Name": lead.company,
    Email: lead.email || "",
    Phone: lead.phone || "",
    "Job Position": lead.title,
    Website: websiteUrl(lead.website),
    City: lead.geography || "",
    Tags: lead.industry || "",
    Source: LEAD_SOURCE,
    Notes: enrichmentNotes(lead),
  };
}

// --- Zoho CRM (Leads module) ---------------------------------------------

const ZOHO_HEADERS = [
  "First Name",
  "Last Name",
  "Company",
  "Title",
  "Email",
  "Phone",
  "Website",
  "City",
  "State",
  "Country",
  "Industry",
  "No of Employees",
  "Lead Source",
  "Lead Status",
  "Description",
];

// Map the app's pipeline status onto Zoho's default Lead Status picklist.
const ZOHO_STATUS: Record<string, string> = {
  new: "Not Contacted",
  queued: "Not Contacted",
  called: "Contacted",
  converted: "Pre-Qualified",
  disqualified: "Not Qualified",
};

function zohoRow(lead: ExportLead): Record<string, unknown> {
  const loc = splitLocation(lead.geography);
  const employees = lead.companySize && /^\d+$/.test(lead.companySize)
    ? lead.companySize
    : "";
  return {
    "First Name": lead.firstName,
    "Last Name": lead.lastName || lead.company, // Zoho requires Last Name
    Company: lead.company,
    Title: lead.title,
    Email: lead.email || "",
    Phone: lead.phone || "",
    Website: websiteUrl(lead.website),
    City: loc.city,
    State: loc.state,
    Country: loc.country,
    Industry: lead.industry || "",
    "No of Employees": employees,
    "Lead Source": LEAD_SOURCE,
    "Lead Status": ZOHO_STATUS[lead.status] || "Not Contacted",
    Description: enrichmentNotes(lead),
  };
}

// --- public API ----------------------------------------------------------

export function buildLeadCSV(target: ExportTarget, leads: ExportLead[]): string {
  if (target === "zoho") {
    return toCSV(ZOHO_HEADERS, leads.map(zohoRow));
  }
  return toCSV(ODOO_HEADERS, leads.map(odooRow));
}

export function exportFilename(target: ExportTarget): string {
  const date = new Date().toISOString().slice(0, 10);
  return `leads-${target}-${date}.csv`;
}
