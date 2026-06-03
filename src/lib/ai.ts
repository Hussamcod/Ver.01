import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ICP {
  industries: string[];
  companySizes: string[];
  geographies: string[];
  jobTitles: string[];
  techStack: string[];
  keywords: string[];
}

interface Persona {
  id: string;
  name: string;
  titles: string[];
  seniority: string[];
  painPoints: string[];
  goals: string[];
  valueProps: string[];
  toneStyle: string;
}

interface Lead {
  firstName: string;
  lastName: string;
  title: string;
  seniority: string | null;
  company: string;
  industry: string | null;
  companySize: string | null;
  geography: string | null;
  technologies: string[];
  intentSignals: string[];
}

export async function scoreLead(
  lead: Lead,
  icp: ICP,
  personas: Persona[]
): Promise<{ icpScore: number; intentScore: number; personaMatch: string | null; reasoning: string }> {
  const prompt = `You are a B2B sales intelligence AI. Score this lead against the ICP and buyer personas.

ICP:
- Industries: ${icp.industries.join(", ")}
- Company Sizes: ${icp.companySizes.join(", ")}
- Geographies: ${icp.geographies.join(", ")}
- Target Job Titles: ${icp.jobTitles.join(", ")}
- Tech Stack: ${icp.techStack.join(", ")}
- Intent Keywords: ${icp.keywords.join(", ")}

Buyer Personas:
${personas.map((p) => `- ${p.name}: titles=${p.titles.join(", ")}, seniority=${p.seniority.join(", ")}`).join("\n")}

Lead:
- Name: ${lead.firstName} ${lead.lastName}
- Title: ${lead.title}
- Seniority: ${lead.seniority || "unknown"}
- Company: ${lead.company}
- Industry: ${lead.industry || "unknown"}
- Company Size: ${lead.companySize || "unknown"}
- Geography: ${lead.geography || "unknown"}
- Technologies: ${lead.technologies.join(", ") || "none"}
- Intent Signals: ${lead.intentSignals.join(", ") || "none"}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "icpScore": <0-100 integer>,
  "intentScore": <0-100 integer>,
  "personaMatch": "<persona name or null>",
  "reasoning": "<1-2 sentence explanation>"
}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  const result = JSON.parse(text);

  const matchedPersona = personas.find((p) => p.name === result.personaMatch);
  return {
    icpScore: result.icpScore,
    intentScore: result.intentScore,
    personaMatch: matchedPersona?.id || null,
    reasoning: result.reasoning,
  };
}

export async function generateCallScript(
  lead: Lead,
  persona: Persona | null,
  icp: ICP
): Promise<string> {
  const tone = persona?.toneStyle || "professional";
  const painPoints = persona?.painPoints.join(", ") || "business challenges";
  const valueProps = persona?.valueProps.join(", ") || "our solution";

  const prompt = `You are an expert B2B sales coach. Write a personalized cold call script for this lead.

Lead:
- Name: ${lead.firstName} ${lead.lastName}
- Title: ${lead.title}
- Company: ${lead.company}
- Industry: ${lead.industry || "unknown"}
- Technologies they use: ${lead.technologies.join(", ") || "unknown"}
- Intent signals: ${lead.intentSignals.join(", ") || "none"}

Matched Buyer Persona:
- Pain points: ${painPoints}
- Our value propositions: ${valueProps}
- Tone: ${tone}

Write a call script with these sections:
1. **Opening** (15 seconds - who you are, why you're calling)
2. **Hook** (20 seconds - personalized insight or pain point relevant to them)
3. **Value Statement** (20 seconds - what you solve, tied to their situation)
4. **Discovery Question** (open-ended question to get them talking)
5. **Objection Handlers** (2-3 common objections with responses)
6. **Call to Action** (clear next step)

Keep it natural, conversational, and under 200 words for the script itself. Use ${tone} tone.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  return (message.content[0] as { type: string; text: string }).text;
}
