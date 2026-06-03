import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const leads = await prisma.lead.findMany({
    where: status ? { status } : undefined,
    orderBy: { totalScore: "desc" },
  });
  return NextResponse.json(leads);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const lead = await prisma.lead.update({
    where: { id },
    data,
  });
  return NextResponse.json(lead);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
