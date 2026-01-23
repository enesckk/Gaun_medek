"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type LOAchievement } from "@/lib/api/scoreApi";

interface StudentLOAchievementCardProps {
  achievements: LOAchievement[];
  courseName?: string;
}

export function StudentLOAchievementCard({
  achievements,
  courseName,
}: StudentLOAchievementCardProps) {
  const getAchievementColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600"; // 50 puan eşiği
    return "text-red-600";
  };

  const getAchievementBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-50 border-green-200";
    if (percentage >= 50) return "bg-yellow-50 border-yellow-200"; // 50 puan eşiği
    return "bg-red-50 border-red-200";
  };

  if (achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Outcome Achievement</CardTitle>
          {courseName && (
            <CardDescription>{courseName}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No learning outcome data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Outcome Achievement</CardTitle>
        {courseName && (
          <CardDescription>{courseName}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const percentage = Math.round(achievement.achievedPercentage * 100) / 100;
            return (
              <Card
                key={achievement.learningOutcome._id}
                className={`rounded-xl shadow-sm border-2 ${getAchievementBgColor(percentage)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-sm font-semibold">
                      {achievement.learningOutcome.code}
                    </Badge>
                    <span
                      className={`text-2xl font-bold ${getAchievementColor(percentage)}`}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        percentage >= 80
                          ? "bg-green-500"
                          : percentage >= 50 // 50 puan eşiği
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {achievement.learningOutcome.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score: {achievement.totalScoreEarned.toFixed(1)} /{" "}
                    {achievement.totalMaxScore.toFixed(1)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

