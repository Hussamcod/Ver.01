import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildLeadCSV,
  exportFilename,
  type ExportTarget,
} from "@/lib/export";

// GET /api/leads/export?target=odoo|zoho&status=<status>&minScore=<n>
// Returns a CRM-ready CSV download of the gathered leads.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const target = searchParams.get("target") === "zoho" ? "zoho" : "odoo";
  const status = searchParams.get("status");
  const minScore = Number(searchParams.get("minScore")) || 0;

  const leads = await prisma.lead.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(minScore > 0 ? { totalScore: { gte: minScore } } : {}),
    },
    orderBy: { totalScore: "desc" },
  });

  const csv = buildLeadCSV(target as ExportTarget, leads);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFilename(
        target as ExportTarget
      )}"`,
      "Cache-Control": "no-store",
    },
  });
}
