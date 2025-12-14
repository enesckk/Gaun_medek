"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { examApi, type ExamAnalysisResponse } from "@/lib/api/examApi";
import { Bar, BarChart, CartesianGrid, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Download, Loader2, ArrowLeft } from "lucide-react";

type QuestionRow = ExamAnalysisResponse["questionAnalysis"][number];
type OutcomeRow = ExamAnalysisResponse["learningOutcomeAnalysis"][number];
type ProgramRow = ExamAnalysisResponse["programOutcomeAnalysis"][number];

interface StudentResult {
  _id: string;
  studentNumber: string;
  questionScores: Array<{
    questionNumber: number;
    score: number;
    learningOutcomeCode: string | null;
  }>;
  outcomePerformance: Record<string, number>;
  programOutcomePerformance: Record<string, number>;
  createdAt: string;
}

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [analysis, setAnalysis] = useState<ExamAnalysisResponse | null>(null);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      load();
      loadResults();
    }
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

  const loadResults = async () => {
    try {
      const results = await examApi.getResults(examId);
      setStudentResults(results);
    } catch (error: any) {
      console.error("Öğrenci sonuçları yüklenemedi:", error);
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sınav Sonuçları</h1>
            <p className="text-muted-foreground">Soru → ÖÇ → PÇ başarı analizleri</p>
          </div>
        </div>
        <Button onClick={handleExport} className="h-11 px-5">
          <Download className="h-4 w-4 mr-2" />
          PDF oluştur
        </Button>
      </div>

      {/* Öğrenci Sonuçları Tablosu - En üstte */}
      <Card>
        <CardHeader>
          <CardTitle>Öğrenci Sonuçları</CardTitle>
          <p className="text-sm text-muted-foreground">
            {studentResults.length} öğrencinin soru bazlı puanları
          </p>
        </CardHeader>
        <CardContent>
          {studentResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Henüz sonuç kaydı yok.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 bg-background">Öğrenci No</TableHead>
                    {questionData.map((q) => (
                      <TableHead key={q.questionNumber} className="text-center min-w-[80px]">
                        <div className="flex flex-col">
                          <span className="font-semibold">Soru {q.questionNumber}</span>
                          {q.learningOutcomeCode && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {q.learningOutcomeCode}
                            </Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Toplam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentResults.map((result) => {
                    const totalScore = result.questionScores.reduce(
                      (sum, qs) => sum + (qs.score || 0),
                      0
                    );
                    const maxTotal = questionData.length * (questionData[0]?.maxScore || 0);
                    const percentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;

                    return (
                      <TableRow key={result._id}>
                        <TableCell className="font-medium sticky left-0 z-10 bg-background">
                          {result.studentNumber}
                        </TableCell>
                        {questionData.map((q) => {
                          const qs = result.questionScores.find(
                            (s) => s.questionNumber === q.questionNumber
                          );
                          const score = qs?.score || 0;
                          const maxScore = q.maxScore || 0;
                          const qPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

                          return (
                            <TableCell key={q.questionNumber} className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-semibold">{score}</span>
                                <span className="text-xs text-muted-foreground">/{maxScore}</span>
                                <Badge
                                  variant={
                                    qPercentage >= 60
                                      ? "default"
                                      : qPercentage >= 40
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  %{qPercentage}
                                </Badge>
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-semibold">
                          <div className="flex flex-col items-center gap-1">
                            <span>{totalScore}</span>
                            <span className="text-xs text-muted-foreground">/{maxTotal}</span>
                            <Badge
                              variant={
                                percentage >= 60
                                  ? "default"
                                  : percentage >= 40
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              %{percentage}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
                <th className="p-2 border">Cevap Veren</th>
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

