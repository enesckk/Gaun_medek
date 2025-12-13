"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { examApi, type ExamAnalysisResponse } from "@/lib/api/examApi";
import { Bar, BarChart, CartesianGrid, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Download, Loader2 } from "lucide-react";

type QuestionRow = ExamAnalysisResponse["questionAnalysis"][number];
type OutcomeRow = ExamAnalysisResponse["learningOutcomeAnalysis"][number];
type ProgramRow = ExamAnalysisResponse["programOutcomeAnalysis"][number];

export default function ExamResultsPage() {
  const params = useParams();
  const examId = params.id as string;

  const [analysis, setAnalysis] = useState<ExamAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (examId) load();
  }, [examId]);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await examApi.getAnalysis(examId);
      setAnalysis(data);
    } catch (error: any) {
      toast.error("Sonuçlar yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const questionData = useMemo<QuestionRow[]>(() => analysis?.questionAnalysis || [], [analysis]);
  const outcomeData = useMemo<OutcomeRow[]>(() => analysis?.learningOutcomeAnalysis || [], [analysis]);
  const programData = useMemo<ProgramRow[]>(() => analysis?.programOutcomeAnalysis || [], [analysis]);

  const handleExport = () => window.print();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Yükleniyor...
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sınav Sonuçları</h1>
          <p className="text-muted-foreground">Soru → ÖÇ → PÇ başarı analizleri</p>
        </div>
        <Button onClick={handleExport} className="h-11 px-5">
          <Download className="h-4 w-4 mr-2" />
          PDF oluştur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Soru → ÖÇ Tablosu</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 border">Soru</th>
                <th className="p-2 border">ÖÇ</th>
                <th className="p-2 border">Ortalama</th>
                <th className="p-2 border">Başarı %</th>
                <th className="p-2 border">Deneme</th>
              </tr>
            </thead>
            <tbody>
              {questionData.map((q) => (
                <tr key={q.questionNumber} className="text-center">
                  <td className="border p-2">{q.questionNumber}</td>
                  <td className="border p-2">{q.learningOutcomeCode || "-"}</td>
                  <td className="border p-2">{q.averageScore}</td>
                  <td className="border p-2">{q.successRate}%</td>
                  <td className="border p-2">{q.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ÖÇ Başarı Grafiği</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {outcomeData.length === 0 ? (
            <p className="text-muted-foreground">ÖÇ verisi yok.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="code" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" name="Başarı %" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PÇ Radar Grafiği</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {programData.length === 0 ? (
            <p className="text-muted-foreground">PÇ verisi yok.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={programData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="code" />
                <Radar
                  name="Başarı %"
                  dataKey="success"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.4}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

