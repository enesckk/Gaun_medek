"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { type LOAchievement, type POAchievement } from "@/lib/api/assessmentApi";

interface CourseSummaryCardProps {
  loAchievements: LOAchievement[];
  poAchievements: POAchievement[];
}

export function CourseSummaryCard({
  loAchievements,
  poAchievements,
}: CourseSummaryCardProps) {
  const calculateAverage = (achievements: Array<{ achievedPercentage: number }>) => {
    if (achievements.length === 0) return 0;
    const sum = achievements.reduce(
      (acc, a) => acc + a.achievedPercentage,
      0
    );
    return sum / achievements.length;
  };

  const avgLO = calculateAverage(loAchievements);
  const avgPO = calculateAverage(poAchievements);

  const loAboveThreshold = loAchievements.filter(
    (a) => a.achievedPercentage >= 60
  ).length;
  const poAboveThreshold = poAchievements.filter(
    (a) => a.achievedPercentage >= 60
  ).length;

  const loSuccessRate = loAchievements.length > 0
    ? (loAboveThreshold / loAchievements.length) * 100
    : 0;
  const poSuccessRate = poAchievements.length > 0
    ? (poAboveThreshold / poAchievements.length) * 100
    : 0;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 80) return "Mükemmel";
    if (percentage >= 60) return "Yeterli";
    return "Yetersiz";
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (percentage >= 60) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className="border-2 border-[#0a294e]/20">
      <CardHeader>
        <CardTitle className="text-2xl text-[#0a294e]">Ders Genel Başarı Özeti</CardTitle>
        <CardDescription className="text-base">
          Öğrenme Çıktıları ve Program Çıktıları için genel performans göstergeleri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ÖÇ Özeti */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Öğrenme Çıktıları (ÖÇ)</h3>
              <Badge variant="outline" className="text-sm">
                {loAchievements.length} ÖÇ
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Ortalama Başarı</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(avgLO)}
                  <span className="text-lg font-bold">{avgLO.toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getStatusColor(avgLO)}`}
                  style={{ width: `${Math.min(avgLO, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Durum:</span>
                <Badge
                  className={
                    avgLO >= 80
                      ? "bg-green-500"
                      : avgLO >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }
                >
                  {getStatusText(avgLO)}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>{loAboveThreshold}</strong> / {loAchievements.length} ÖÇ hedef eşiğini (≥60%) geçti
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Başarı oranı: {loSuccessRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* PÇ Özeti */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Program Çıktıları (PÇ)</h3>
              <Badge variant="outline" className="text-sm">
                {poAchievements.length} PÇ
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Ortalama Başarı</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(avgPO)}
                  <span className="text-lg font-bold">{avgPO.toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getStatusColor(avgPO)}`}
                  style={{ width: `${Math.min(avgPO, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Durum:</span>
                <Badge
                  className={
                    avgPO >= 80
                      ? "bg-green-500"
                      : avgPO >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }
                >
                  {getStatusText(avgPO)}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>{poAboveThreshold}</strong> / {poAchievements.length} PÇ hedef eşiğini (≥60%) geçti
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Başarı oranı: {poSuccessRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

