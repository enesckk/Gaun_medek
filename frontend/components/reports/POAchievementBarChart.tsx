"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type POAchievement } from "@/lib/api/assessmentApi";

interface POAchievementBarChartProps {
  achievements: POAchievement[];
}

export function POAchievementBarChart({ achievements }: POAchievementBarChartProps) {
  if (achievements.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Görüntülenecek veri yok</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = achievements.map((achievement) => ({
    code: achievement.code,
    başarı: Math.round(achievement.achievedPercentage * 100) / 100,
    hedef: 60, // MÜDEK hedef eşiği
  }));

  const getColor = (value: number) => {
    if (value >= 80) return "#22c55e"; // green-500
    if (value >= 60) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  return (
    <Card className="border-2 border-[#0a294e]/20">
      <CardHeader>
        <CardTitle className="text-2xl text-[#0a294e]">Program Çıktıları (PÇ) Başarı Oranları</CardTitle>
        <CardDescription className="text-base">
          Her program çıktısı için ortalama başarı yüzdesi (ÖÇ'lerden türetilmiş)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="code"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{ value: "Başarı Yüzdesi (%)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Başarı"]}
              labelFormatter={(label) => `PÇ: ${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="başarı" name="Başarı Oranı" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.başarı)} />
              ))}
            </Bar>
            <Bar
              dataKey="hedef"
              name="Hedef Eşik (60%)"
              fill="#94a3b8"
              opacity={0.3}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Yüksek (≥80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span>Orta (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Düşük (&lt;60%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

