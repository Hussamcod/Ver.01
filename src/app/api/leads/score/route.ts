import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreLead } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { leadId, icpId } = body;

  const [lead, icp, personas] = await Promise.all([
    prisma.lead.findUnique({ where: { id: leadId } }),
    prisma.iCP.findUnique({ where: { id: icpId } }),
    prisma.buyerPersona.findMany(),
  ]);

  if (!lead || !icp) {
    return NextResponse.json({ error: "Lead or ICP not found" }, { status: 404 });
  }

  const parsedICP = {
    industries: JSON.parse(icp.industries),
    companySizes: JSON.parse(icp.companySizes),
    geographies: JSON.parse(icp.geographies),
    jobTitles: JSON.parse(icp.jobTitles),
    techStack: JSON.parse(icp.techStack),
    keywords: JSON.parse(icp.keywords),
  };

  const parsedPersonas = personas.map((p) => ({
    id: p.id,
    name: p.name,
    titles: JSON.parse(p.titles),
    seniority: JSON.parse(p.seniority),
    painPoints: JSON.parse(p.painPoints),
    goals: JSON.parse(p.goals),
    valueProps: JSON.parse(p.valueProps),
    toneStyle: p.toneStyle,
  }));

  const parsedLead = {
    firstName: lead.firstName,
    lastName: lead.lastName,
    title: lead.title,
    seniority: lead.seniority,
    company: lead.company,
    industry: lead.industry,
    companySize: lead.companySize,
    geography: lead.geography,
    technologies: JSON.parse(lead.technologies),
    intentSignals: JSON.parse(lead.intentSignals),
  };

  const scores = await scoreLead(parsedLead, parsedICP, parsedPersonas);

  const totalScore = Math.round(
    scores.icpScore * 0.5 + scores.intentScore * 0.3 + (scores.personaMatch ? 20 : 0)
  );

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      icpScore: scores.icpScore,
      intentScore: scores.intentScore,
      personaMatch: scores.personaMatch,
      totalScore,
    },
  });

  return NextResponse.json({ lead: updated, reasoning: scores.reasoning });
}
