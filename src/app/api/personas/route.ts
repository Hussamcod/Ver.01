import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const personas = await prisma.buyerPersona.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(personas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const persona = await prisma.buyerPersona.create({
    data: {
      name: body.name,
      titles: JSON.stringify(body.titles || []),
      seniority: JSON.stringify(body.seniority || []),
      painPoints: JSON.stringify(body.painPoints || []),
      goals: JSON.stringify(body.goals || []),
      valueProps: JSON.stringify(body.valueProps || []),
      toneStyle: body.toneStyle || "professional",
    },
  });
  return NextResponse.json(persona);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const persona = await prisma.buyerPersona.update({
    where: { id },
    data: {
      name: data.name,
      titles: JSON.stringify(data.titles || []),
      seniority: JSON.stringify(data.seniority || []),
      painPoints: JSON.stringify(data.painPoints || []),
      goals: JSON.stringify(data.goals || []),
      valueProps: JSON.stringify(data.valueProps || []),
      toneStyle: data.toneStyle || "professional",
    },
  });
  return NextResponse.json(persona);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.buyerPersona.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
