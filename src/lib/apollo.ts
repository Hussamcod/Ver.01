import axios from "axios";

const APOLLO_BASE = "https://api.apollo.io/v1";

export interface ApolloSearchParams {
  jobTitles: string[];
  industries: string[];
  companySizes: string[];
  geographies: string[];
  techStack?: string[];
  keywords?: string[];
  page?: number;
  perPage?: number;
}

export interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_numbers: { raw_number: string }[];
  title: string;
  seniority: string;
  linkedin_url: string;
  organization: {
    name: string;
    industry: string;
    estimated_num_employees: number;
    primary_domain: string;
    technologies: { name: string }[];
  };
  city: string;
  state: string;
  country: string;
  intent_strength: string | null;
}

const NUM_EMPLOYEES_MAP: Record<string, string> = {
  "1,10": "1-10",
  "11,50": "11-50",
  "51,200": "51-200",
  "201,500": "201-500",
  "501,1000": "501-1000",
  "1001,5000": "1001-5000",
  "5001,10000": "5001-10000",
  "10001,": "10001+",
};

function sizeToRange(size: string): string[] {
  // Map human-readable sizes to Apollo's num_employees_ranges
  const map: Record<string, string[]> = {
    "1-10": ["1,10"],
    "11-50": ["11,50"],
    "51-200": ["51,200"],
    "201-500": ["201,500"],
    "501-1000": ["501,1000"],
    "1001-5000": ["1001,5000"],
    "5001-10000": ["5001,10000"],
    "10001+": ["10001,"],
  };
  return map[size] || [];
}

export async function searchApolloLeads(params: ApolloSearchParams) {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) throw new Error("APOLLO_API_KEY not set");

  const numEmployeesRanges = params.companySizes.flatMap(sizeToRange);

  const body: Record<string, unknown> = {
    api_key: apiKey,
    page: params.page || 1,
    per_page: params.perPage || 25,
    person_titles: params.jobTitles,
    organization_industry_tag_ids: [],
    q_organization_domains: [],
    person_locations: params.geographies,
    organization_num_employees_ranges: numEmployeesRanges,
  };

  if (params.industries.length > 0) {
    body.organization_industry_tag_ids = params.industries;
  }

  if (params.techStack && params.techStack.length > 0) {
    body.currently_using_any_of_technology_uids = params.techStack;
  }

  if (params.keywords && params.keywords.length > 0) {
    body.q_keywords = params.keywords.join(" OR ");
  }

  const response = await axios.post(
    `${APOLLO_BASE}/mixed_people/search`,
    body,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;
}

export function formatContact(contact: ApolloContact) {
  const org = contact.organization || {};
  const phone = contact.phone_numbers?.[0]?.raw_number || null;
  const location = [contact.city, contact.state, contact.country]
    .filter(Boolean)
    .join(", ");
  const technologies = (org.technologies || []).map((t: { name: string }) => t.name);

  return {
    apolloId: contact.id,
    firstName: contact.first_name || "",
    lastName: contact.last_name || "",
    email: contact.email || null,
    phone: phone,
    title: contact.title || "",
    seniority: contact.seniority || null,
    company: org.name || "",
    industry: org.industry || null,
    companySize: org.estimated_num_employees
      ? String(org.estimated_num_employees)
      : null,
    geography: location || null,
    linkedinUrl: contact.linkedin_url || null,
    website: org.primary_domain || null,
    technologies: JSON.stringify(technologies),
    intentSignals: JSON.stringify(
      contact.intent_strength ? [contact.intent_strength] : []
    ),
  };
}
