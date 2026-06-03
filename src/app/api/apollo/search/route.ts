import { NextRequest, NextResponse } from "next/server";
import { searchApolloLeads, formatContact } from "@/lib/apollo";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { icpId, page = 1 } = body;

  const icp = await prisma.iCP.findUnique({ where: { id: icpId } });
  if (!icp) return NextResponse.json({ error: "ICP not found" }, { status: 404 });

  const params = {
    jobTitles: JSON.parse(icp.jobTitles),
    industries: JSON.parse(icp.industries),
    companySizes: JSON.parse(icp.companySizes),
    geographies: JSON.parse(icp.geographies),
    techStack: JSON.parse(icp.techStack),
    keywords: JSON.parse(icp.keywords),
    page,
    perPage: 25,
  };

  const data = await searchApolloLeads(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contacts = (data.people || []).map((contact: any) => formatContact(contact));

  type ContactData = ReturnType<typeof formatContact>;
  const saved = await Promise.all(
    contacts.map((contact: ContactData) =>
      prisma.lead.upsert({
        where: { apolloId: contact.apolloId ?? undefined },
        update: contact,
        create: contact,
      })
    )
  );

  return NextResponse.json({
    leads: saved,
    total: data.pagination?.total_entries || 0,
    page: data.pagination?.page || 1,
  });
}
