interface ScoreBadgeProps {
  score: number;
  label?: string;
}

export function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const color =
    score >= 75
      ? "bg-green-100 text-green-800"
      : score >= 50
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {label && <span className="text-gray-500">{label}:</span>}
      {score}
    </span>
  );
}
