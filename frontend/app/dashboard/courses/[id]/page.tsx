"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Edit, FileText, Target, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";
import { examApi, type Exam } from "@/lib/api/examApi";
import { LearningOutcomeMapping } from "@/components/courses/LearningOutcomeMapping";
import { MudekMatrixView } from "@/components/courses/MudekMatrixView";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const [courseData, examsData] = await Promise.all([
        courseApi.getById(courseId),
        examApi.getByCourse(courseId).catch(() => []) // If fails, return empty array
      ]);
      setCourse(courseData);
      setExams(examsData);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Ders bilgileri yüklenemedi");
      router.push("/dashboard/courses");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a294e]" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const department = (course as any).department;
  const departmentId = typeof department === "object" ? department?._id : null;
  const departmentName = typeof department === "object" ? department?.name : department || "Bilinmiyor";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/courses")}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{course.name}</h1>
              <p className="text-muted-foreground text-lg mt-1">
                Kod: {course.code} | Bölüm: {departmentName}
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/dashboard/courses/edit/${courseId}`)}
            className="h-12 px-6 bg-[#0a294e] hover:bg-[#0a294e]/90 text-white"
          >
            <Edit className="h-5 w-5 mr-2" />
            Düzenle
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-14">
            <TabsTrigger value="overview" className="text-base font-semibold">
              <FileText className="h-5 w-5 mr-2" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="mapping" className="text-base font-semibold">
              <Target className="h-5 w-5 mr-2" />
              ÖÇ → PÇ Eşlemesi
            </TabsTrigger>
            <TabsTrigger value="matrix" className="text-base font-semibold">
              <GraduationCap className="h-5 w-5 mr-2" />
              MÜDEK Matrisi
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-[#0a294e]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#0a294e]">Ders Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ders Adı</p>
                    <p className="text-lg font-semibold">{course.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ders Kodu</p>
                    <p className="text-lg font-semibold">{course.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bölüm</p>
                    <p className="text-lg font-semibold">{departmentName}</p>
                  </div>
                  {(course as any).semester && (
                    <div>
                      <p className="text-sm text-muted-foreground">Dönem</p>
                      <p className="text-lg font-semibold">{(course as any).semester}</p>
                    </div>
                  )}
                  {course.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Açıklama</p>
                      <p className="text-lg">{course.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 border-[#0a294e]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#0a294e]">İstatistikler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Öğrenme Çıktısı Sayısı</p>
                    <p className="text-3xl font-bold text-[#0a294e]">
                      {course.learningOutcomes?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Öğrenci Sayısı</p>
                    <p className="text-3xl font-bold text-[#0a294e]">
                      {course.students?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Sınav Sayısı</p>
                    <p className="text-3xl font-bold text-[#0a294e]">
                      {exams.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exams List */}
            {exams.length > 0 && (
              <Card className="border-2 border-[#0a294e]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#0a294e]">Sınavlar</CardTitle>
                  <CardDescription>
                    Bu derse ait tüm sınavların listesi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exams.filter(e => e.examType === "midterm").length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Vize Sınavları</p>
                        <div className="flex flex-wrap gap-2">
                          {exams
                            .filter(e => e.examType === "midterm")
                            .map((exam) => (
                              <Badge 
                                key={exam._id} 
                                variant="outline" 
                                className="text-base px-3 py-1.5"
                              >
                                {exam.examCode}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                    {exams.filter(e => e.examType === "final").length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Final Sınavları</p>
                        <div className="flex flex-wrap gap-2">
                          {exams
                            .filter(e => e.examType === "final")
                            .map((exam) => (
                              <Badge 
                                key={exam._id} 
                                variant="outline" 
                                className="text-base px-3 py-1.5"
                              >
                                {exam.examCode}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Outcomes List */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <Card className="border-2 border-[#0a294e]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#0a294e]">Öğrenme Çıktıları (ÖÇ)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.learningOutcomes.map((lo, index) => (
                      <div
                        key={index}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#0a294e]/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Badge variant="default" className="bg-[#0a294e] text-white text-base px-3 py-1">
                            {lo.code}
                          </Badge>
                          <p className="text-lg flex-1">{lo.description}</p>
                        </div>
                        {(lo as any).programOutcomes && (lo as any).programOutcomes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-muted-foreground mb-2">İlişkili Program Çıktıları:</p>
                            <div className="flex flex-wrap gap-2">
                              {(lo as any).programOutcomes.map((poCode: string) => (
                                <Badge key={poCode} variant="outline" className="text-sm">
                                  {poCode}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ÖÇ → PÇ Mapping Tab */}
          <TabsContent value="mapping">
            {departmentId ? (
              <LearningOutcomeMapping
                courseId={courseId}
                course={course}
                departmentId={departmentId}
                onUpdate={loadCourse}
              />
            ) : (
              <Card className="border-2 border-yellow-200">
                <CardContent className="p-8 text-center">
                  <p className="text-lg text-muted-foreground">
                    Bu ders için bölüm bilgisi bulunamadı. ÖÇ → PÇ eşlemesi yapabilmek için lütfen dersi düzenleyip bölüm seçin.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* MÜDEK Matrix Tab */}
          <TabsContent value="matrix">
            {departmentId ? (
              <MudekMatrixView
                courseId={courseId}
                course={course}
                departmentId={departmentId}
                onUpdate={loadCourse}
              />
            ) : (
              <Card className="border-2 border-yellow-200">
                <CardContent className="p-8 text-center">
                  <p className="text-lg text-muted-foreground">
                    Bu ders için bölüm bilgisi bulunamadı. MÜDEK matrisi görüntülemek için lütfen dersi düzenleyip bölüm seçin.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


