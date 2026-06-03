import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const icps = await prisma.iCP.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(icps);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const icp = await prisma.iCP.create({
    data: {
      name: body.name,
      industries: JSON.stringify(body.industries || []),
      companySizes: JSON.stringify(body.companySizes || []),
      geographies: JSON.stringify(body.geographies || []),
      jobTitles: JSON.stringify(body.jobTitles || []),
      techStack: JSON.stringify(body.techStack || []),
      keywords: JSON.stringify(body.keywords || []),
      revenueMin: body.revenueMin || null,
      revenueMax: body.revenueMax || null,
    },
  });
  return NextResponse.json(icp);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const icp = await prisma.iCP.update({
    where: { id },
    data: {
      name: data.name,
      industries: JSON.stringify(data.industries || []),
      companySizes: JSON.stringify(data.companySizes || []),
      geographies: JSON.stringify(data.geographies || []),
      jobTitles: JSON.stringify(data.jobTitles || []),
      techStack: JSON.stringify(data.techStack || []),
      keywords: JSON.stringify(data.keywords || []),
      revenueMin: data.revenueMin || null,
      revenueMax: data.revenueMax || null,
    },
  });
  return NextResponse.json(icp);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.iCP.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
