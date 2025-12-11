"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { User, Hash, Building2, GraduationCap, Edit, BookOpen, ExternalLink, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentForm } from "@/components/students/StudentForm";
import { StudentExamScoreTable } from "@/components/students/StudentExamScoreTable";
import { StudentLOAchievementCard } from "@/components/students/StudentLOAchievementCard";
import { StudentPOAchievementCard } from "@/components/students/StudentPOAchievementCard";
import { studentApi, type Student } from "@/lib/api/studentApi";
import { scoreApi, type Score, type LOAchievement, type POAchievement } from "@/lib/api/scoreApi";
import { courseApi, type Course } from "@/lib/api/courseApi";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const isEditMode = searchParams.get("edit") === "true";

  const [student, setStudent] = useState<Student | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loAchievements, setLOAchievements] = useState<LOAchievement[]>([]);
  const [poAchievements, setPOAchievements] = useState<POAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId && selectedCourseId) {
      fetchAchievements();
    }
  }, [studentId, selectedCourseId]);

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      const [studentData, scoresData, coursesData] = await Promise.all([
        studentApi.getById(studentId),
        scoreApi.getByStudent(studentId),
        courseApi.getAll(),
      ]);

      setStudent(studentData);
      setScores(scoresData);
      setCourses(coursesData);

      // Set first course as default if available
      if (coursesData.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesData[0]._id);
      }
    } catch (error: any) {
      toast.error("Öğrenci verileri yüklenirken hata oluştu");
      router.push("/students");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAchievements = async () => {
    if (!selectedCourseId) return;

    try {
      const [loData, poData] = await Promise.all([
        scoreApi.calculateLOAchievement(studentId, selectedCourseId),
        scoreApi.calculatePOAchievement(studentId, selectedCourseId),
      ]);

      setLOAchievements(loData);
      setPOAchievements(poData);
    } catch (error: any) {
      console.error("Failed to load achievements", error);
      // Don't show error toast, just log it
    }
  };

  const handleEditSuccess = () => {
    fetchStudentData();
    router.push(`/students/${studentId}`);
  };

  // Find courses where this student is enrolled (must be before conditional returns)
  const enrolledCourses = useMemo(() => {
    if (!student) return [];
    return courses.filter((course) => {
      const courseStudents = course.students || [];
      return courseStudents.some(
        (s) => s.studentNumber === student.studentNumber
      );
    });
  }, [courses, student]);

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Öğrenci verileri yükleniyor...</p>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/students/${studentId}`)} className="px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Geri
          </Button>
          <p className="text-muted-foreground">
            Öğrenci bilgilerini güncelleyin
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Bilgileri</CardTitle>
            <CardDescription>
              Aşağıdaki öğrenci ayrıntılarını güncelleyin. * işaretli alanlar zorunludur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentForm
              mode="edit"
              studentId={studentId}
              initialData={student}
              onSuccess={handleEditSuccess}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/students")} className="px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Geri
          </Button>
          <p className="text-muted-foreground">
            Öğrenci bilgilerini ve akademik performansını görüntüleyin
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/students/${studentId}?edit=true`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Öğrenciyi Düzenle
        </Button>
      </div>

      {/* Student Info Card */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Öğrenci Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">İsim</p>
                <p className="font-semibold">{student.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Öğrenci Numarası</p>
                <p className="font-semibold">{student.studentNumber}</p>
              </div>
            </div>
            {student.department && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Bölüm</p>
                  <p className="font-semibold">{student.department}</p>
                </div>
              </div>
            )}
            {student.classLevel && (
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Sınıf Seviyesi</p>
                  <p className="font-semibold">{student.classLevel}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses Card */}
      <Card className="rounded-xl shadow-sm border-2 border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Kayıtlı Olduğu Dersler
          </CardTitle>
          <CardDescription className="text-sm">
            Bu öğrencinin kayıtlı olduğu dersler. Ders oluştururken öğrenci listesine eklendiğinde burada görünecektir.
            {enrolledCourses.length > 0 && (
              <span className="ml-2 font-medium text-slate-700">
                ({enrolledCourses.length} ders)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium">Bu öğrenci henüz hiçbir derse kayıtlı değil</p>
              <p className="text-sm mt-2">
                Ders oluştururken öğrenci listesine eklendiğinde burada görünecektir
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => {
                const department = typeof course.department === 'object' && course.department !== null
                  ? course.department.name
                  : course.department || "Bilinmiyor";
                
                return (
                  <Card
                    key={course._id}
                    className="border-2 border-slate-200 hover:border-[#0a294e] transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/courses/${course._id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {course.code}
                            </Badge>
                            {course.semester && (
                              <Badge variant="secondary" className="text-xs">
                                {course.semester}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                            {course.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {department}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-slate-200">
                        <span>
                          <span className="font-semibold text-slate-700">
                            {course.learningOutcomes?.length || 0}
                          </span>{" "}
                          ÖÇ
                        </span>
                        <span>
                          <span className="font-semibold text-slate-700">
                            {course.students?.length || 0}
                          </span>{" "}
                          Öğrenci
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exam Score Table */}
      <Card className="rounded-xl shadow-sm border-2 border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="text-xl text-slate-900">Sınav Puanları</CardTitle>
          <CardDescription className="text-sm">
            Bu öğrencinin tüm sınav puanları, sınavlara göre gruplandırılmış olarak gösterilmektedir.
            {scores.length > 0 && (
              <span className="ml-2 font-medium text-slate-700">
                ({scores.length} puan kaydı bulundu)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <StudentExamScoreTable scores={scores} />
        </CardContent>
      </Card>

      {/* Course Selection for Achievements */}
      {courses.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Ders Seçimi</CardTitle>
            <CardDescription>
              Öğrenme Çıktısı ve Program Çıktısı başarılarını görüntülemek için bir ders seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Bir ders seçin</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {/* LO Achievement */}
      {selectedCourseId && loAchievements.length > 0 && (
        <StudentLOAchievementCard
          achievements={loAchievements}
          courseName={selectedCourse?.name}
        />
      )}

      {/* PO Achievement */}
      {selectedCourseId && poAchievements.length > 0 && (
        <StudentPOAchievementCard
          achievements={poAchievements}
          courseName={selectedCourse?.name}
        />
      )}
    </div>
  );
}

