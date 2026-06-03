import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCallScript } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { leadId, icpId } = body;

  const [lead, icp] = await Promise.all([
    prisma.lead.findUnique({ where: { id: leadId } }),
    prisma.iCP.findUnique({ where: { id: icpId } }),
  ]);

  if (!lead || !icp) {
    return NextResponse.json({ error: "Lead or ICP not found" }, { status: 404 });
  }

  let persona = null;
  if (lead.personaMatch) {
    const p = await prisma.buyerPersona.findUnique({
      where: { id: lead.personaMatch },
    });
    if (p) {
      persona = {
        id: p.id,
        name: p.name,
        titles: JSON.parse(p.titles),
        seniority: JSON.parse(p.seniority),
        painPoints: JSON.parse(p.painPoints),
        goals: JSON.parse(p.goals),
        valueProps: JSON.parse(p.valueProps),
        toneStyle: p.toneStyle,
      };
    }
  }

  const parsedICP = {
    industries: JSON.parse(icp.industries),
    companySizes: JSON.parse(icp.companySizes),
    geographies: JSON.parse(icp.geographies),
    jobTitles: JSON.parse(icp.jobTitles),
    techStack: JSON.parse(icp.techStack),
    keywords: JSON.parse(icp.keywords),
  };

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

  const script = await generateCallScript(parsedLead, persona, parsedICP);

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { callScript: script, status: "queued" },
  });

  return NextResponse.json({ lead: updated, script });
}
