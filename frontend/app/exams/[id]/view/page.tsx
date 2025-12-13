"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { examApi, type Exam } from "@/lib/api/examApi";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { toast } from "sonner";
import { ArrowLeft, FileText, Upload, Edit, Target, ListOrdered } from "lucide-react";

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const [exam, setExam] = useState<Exam | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      loadData();
    }
  }, [examId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const examData = await examApi.getById(examId);
      setExam(examData);

      const courseId =
        typeof examData.courseId === "object" && examData.courseId !== null
          ? examData.courseId._id
          : examData.courseId;
      if (courseId) {
        const courseData = await courseApi.getById(courseId);
        setCourse(courseData);
      }
    } catch (error: any) {
      toast.error("Sınav detayları yüklenemedi");
      router.push("/exams");
    } finally {
      setIsLoading(false);
    }
  };

  const questionCount = useMemo(() => {
    if (!exam) return 0;
    return exam.questions?.length || exam.questionCount || 0;
  }, [exam]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Sınav bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  const examTypeLabel = exam.examType === "midterm" ? "Vize" : "Final";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/exams")}
              className="px-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Geri
            </Button>
            <Badge variant="outline">{examTypeLabel}</Badge>
            <Badge variant="secondary">{exam.examCode}</Badge>
          </div>
          {/* Başlık topbardan geldiği için burada tekrar etmiyoruz */}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push(`/exams/${examId}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/exams/${examId}/upload`)}
          >
            <Upload className="h-4 w-4 mr-2" />
            AI Puanlama
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/exams/${examId}/batch-upload`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Toplu Yükleme
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sınav Bilgileri</CardTitle>
            <CardDescription>Ders, tür ve temel sınav ayarları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Ders</p>
              <p className="text-sm font-semibold">
                {course ? `${course.code} - ${course.name}` : "Bilinmeyen Ders"}
              </p>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div>
                <p className="text-xs text-muted-foreground">Sınav Türü</p>
                <p className="font-medium">{examTypeLabel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sınav Kodu</p>
                <p className="font-medium">{exam.examCode}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Soru Sayısı</p>
                <p className="font-medium">{questionCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Soru Başına Max Puan</p>
                <p className="font-medium">{exam.maxScorePerQuestion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İstatistik</CardTitle>
            <CardDescription>Soru ve ÖÇ eşleşmeleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <ListOrdered className="h-4 w-4 text-muted-foreground" />
              <span>
                Toplam soru: <strong>{questionCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>
                ÖÇ eşlemesi:{" "}
                <strong>
                  {exam.questions?.filter((q) => q.learningOutcomeCode)?.length || 0}
                </strong>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sorular ve ÖÇ Eşleşmeleri</CardTitle>
          <CardDescription>Her soru için bağlı öğrenme çıktısı</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {exam.questions && exam.questions.length > 0 ? (
            <div className="space-y-2">
              {exam.questions
                .slice()
                .sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0))
                .map((q) => (
                  <div
                    key={q.questionNumber}
                    className="flex flex-wrap items-center justify-between rounded border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Soru {q.questionNumber}</Badge>
                      <span className="text-sm text-muted-foreground">
                        ÖÇ:{" "}
                        {q.learningOutcomeCode ? (
                          <Badge variant="outline" className="ml-1">
                            {q.learningOutcomeCode}
                          </Badge>
                        ) : (
                          <span className="text-amber-600">Eşlenmemiş</span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Max Puan: {exam.maxScorePerQuestion}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Soru bulunamadı.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

