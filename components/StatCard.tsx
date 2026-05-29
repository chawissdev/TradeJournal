"use client";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

type Props = {
  label: string;
  value: string;
  badge?: string | number;
  data: { v: number }[];
  color?: "blue" | "green" | "red";
};

const colorMap = {
  blue: { stroke: "#2563EB", fill: "#DBEAFE" },
  green: { stroke: "#10B981", fill: "#D1FAE5" },
  red: { stroke: "#EF4444", fill: "#FEE2E2" },
};

export default function StatCard({ label, value, badge, data, color = "blue" }: Props) {
  const c = colorMap[color];
  const gradId = `g-${label.replace(/\s+/g, "")}`;
  return (
    <div className="bg-white rounded-xl border border-ink-300/40 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-ink-500">{label}</div>
          <div className="text-2xl font-semibold mt-1 text-ink-900">{value}</div>
        </div>
        {badge !== undefined && (
          <span className="text-xs text-ink-500 bg-surface-muted rounded-md px-2 py-1">
            {badge}
          </span>
        )}
      </div>
      <div className="h-16 -mx-2 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, left: 0, right: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={c.fill} stopOpacity={0.9} />
                <stop offset="100%" stopColor={c.fill} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={c.stroke}
              strokeWidth={2}
              fill={`url(#${gradId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
