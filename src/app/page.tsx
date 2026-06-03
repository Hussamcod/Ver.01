import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const [icpCount, personaCount, totalLeads, queuedLeads, calledLeads] =
    await Promise.all([
      prisma.iCP.count(),
      prisma.buyerPersona.count(),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "queued" } }),
      prisma.lead.count({ where: { status: "called" } }),
    ]);

  const topLeads = await prisma.lead.findMany({
    orderBy: { totalScore: "desc" },
    take: 5,
    where: { totalScore: { gt: 0 } },
  });

  const stats = [
    { label: "ICPs Defined", value: icpCount, href: "/icp", color: "bg-blue-500" },
    { label: "Buyer Personas", value: personaCount, href: "/personas", color: "bg-purple-500" },
    { label: "Total Leads", value: totalLeads, href: "/leads", color: "bg-green-500" },
    { label: "In Call Queue", value: queuedLeads, href: "/pipeline", color: "bg-orange-500" },
    { label: "Calls Made", value: calledLeads, href: "/pipeline", color: "bg-gray-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">GTM Revenue Engine</h1>
        <p className="text-gray-500 mt-1">
          ICP-driven lead discovery, AI scoring, and personalized call preparation
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className={`w-2 h-2 rounded-full ${s.color} mb-3`} />
              <div className="text-3xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Top Scored Leads</h2>
          {topLeads.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No scored leads yet.{" "}
              <Link href="/leads" className="text-blue-500 underline">
                Discover leads
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {topLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lead.title} · {lead.company}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {lead.totalScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Start Guide</h2>
          <div className="space-y-3">
            {[
              { href: "/icp", label: "Define your ICP", desc: "Set industries, sizes, geographies", step: "1" },
              { href: "/personas", label: "Create buyer personas", desc: "Add pain points and value props", step: "2" },
              { href: "/leads", label: "Pull leads from Apollo", desc: "Search and score leads by ICP fit", step: "3" },
              { href: "/pipeline", label: "Prepare call scripts", desc: "AI-generated personalized scripts", step: "4" },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {a.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
