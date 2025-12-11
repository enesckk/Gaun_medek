"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, X, FileText, Target, Calendar, Upload } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExamTable } from "@/components/exams/ExamTable";
import { examApi, type Exam } from "@/lib/api/examApi";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { departmentApi, type Department } from "@/lib/api/departmentApi";

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllExams();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadCoursesByDepartment(selectedDepartmentId);
    } else {
      loadAllCourses();
    }
  }, [selectedDepartmentId]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedDepartmentId, selectedCourseId, selectedExamType, exams, courses]);

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error: any) {
      console.error("Bölümler yüklenemedi:", error);
    }
  };

  const loadAllCourses = async () => {
    try {
      const data = await courseApi.getAll();
      const coursesMap: Record<string, Course> = {};
      data.forEach((course) => {
        coursesMap[course._id] = course;
      });
      setCourses(coursesMap);
    } catch (error: any) {
      console.error("Dersler yüklenemedi:", error);
    }
  };

  const loadCoursesByDepartment = async (departmentId: string) => {
    try {
      const allCourses = await courseApi.getAll();
      const deptCourses = allCourses.filter((course: any) => 
        course.department?._id === departmentId || course.department === departmentId
      );
      const coursesMap: Record<string, Course> = {};
      deptCourses.forEach((course) => {
        coursesMap[course._id] = course;
      });
      setCourses(coursesMap);
      // Reset course selection if selected course is not in new list
      if (selectedCourseId && !deptCourses.find((c: any) => c._id === selectedCourseId)) {
        setSelectedCourseId("");
      }
    } catch (error: any) {
      console.error("Dersler yüklenemedi:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...exams];

    // Filter by department
    if (selectedDepartmentId) {
      filtered = filtered.filter((exam) => {
        const courseId =
          typeof exam.courseId === "object" && exam.courseId !== null
            ? exam.courseId._id
            : exam.courseId;
        const course = courseId ? courses[courseId] : undefined;
        if (!course) return false;
        const deptId =
          typeof course.department === "object" && course.department !== null
            ? course.department._id
            : course.department;
        return deptId === selectedDepartmentId;
      });
    }

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((exam) => {
        const courseId =
          typeof exam.courseId === "object" && exam.courseId !== null
            ? exam.courseId._id
            : exam.courseId;
        return courseId === selectedCourseId;
      });
    }

    // Filter by exam type
    if (selectedExamType) {
      filtered = filtered.filter((exam) => exam.examType === selectedExamType);
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((exam) => {
        const courseId =
          typeof exam.courseId === "object" && exam.courseId !== null
            ? exam.courseId._id
            : exam.courseId;
        const course = courseId ? courses[courseId] : undefined;
        const courseName = course
          ? `${course.code} ${course.name}`.toLowerCase()
          : "";
        const examCode = exam.examCode?.toLowerCase() || "";
        const examType = exam.examType || "";
        return courseName.includes(query) || examCode.includes(query) || examType.includes(query);
      });
    }

    setFilteredExams(filtered);
  };

  const clearFilters = () => {
    setSelectedDepartmentId("");
    setSelectedCourseId("");
    setSelectedExamType("");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedDepartmentId || selectedCourseId || selectedExamType || searchQuery.trim() !== "";

  const fetchAllExams = async () => {
    try {
      setIsLoading(true);
      const examsData = await examApi.getAll();
      setExams(examsData);
      await loadAllCourses();
    } catch (error: any) {
      toast.error("Sınavlar yüklenemedi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const totalExams = exams.length;
  const midtermCount = exams.filter(e => e.examType === "midterm").length;
  const finalCount = exams.filter(e => e.examType === "final").length;
  const totalQuestions = exams.reduce((sum, exam) => sum + (exam.questions?.length || exam.questionCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
    
          <p className="text-muted-foreground text-base">
            Sınavları ve sorularını yönetin, puanları görüntüleyin
          </p>
        </div>
        <Button 
          onClick={() => router.push("/exams/new")} 
          className="h-12 px-6 bg-[#0a294e] hover:bg-[#0a294e]/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sınav Oluştur
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sınav</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExams}</div>
            <p className="text-xs text-muted-foreground">
              Sistemdeki toplam sınav sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vize Sınavları</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{midtermCount}</div>
            <p className="text-xs text-muted-foreground">
              Vize sınavı sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Sınavları</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalCount}</div>
            <p className="text-xs text-muted-foreground">
              Final sınavı sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Soru</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Tüm sınavlardaki toplam soru sayısı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Filtreler</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Filtreleri Temizle
              </Button>
            )}
          </div>
          <CardDescription>
            Sınavları bölüm, ders, sınav tipi veya arama ile filtreleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Department Filter */}
            <div className="space-y-2">
              <Label htmlFor="department-filter" className="text-sm font-medium">
                Bölüm
              </Label>
              <Select
                id="department-filter"
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                className="h-10 text-sm"
              >
                <option value="">Tüm Bölümler</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Course Filter */}
            <div className="space-y-2">
              <Label htmlFor="course-filter" className="text-sm font-medium">
                Ders
              </Label>
              <Select
                id="course-filter"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="h-10 text-sm"
                disabled={!selectedDepartmentId && departments.length > 0}
              >
                <option value="">Tüm Dersler</option>
                {Object.values(courses).map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Exam Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="exam-type-filter" className="text-sm font-medium">
                Sınav Tipi
              </Label>
              <Select
                id="exam-type-filter"
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="h-10 text-sm"
              >
                <option value="">Tüm Tipler</option>
                <option value="midterm">Vize</option>
                <option value="final">Final</option>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search-input" className="text-sm font-medium">
                Arama
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-input"
                  placeholder="Sınav kodu, ders ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground">Aktif Filtreler:</span>
              {selectedDepartmentId && (
                <Badge variant="secondary" className="text-xs">
                  Bölüm: {departments.find(d => d._id === selectedDepartmentId)?.name}
                  <button
                    onClick={() => setSelectedDepartmentId("")}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCourseId && (
                <Badge variant="secondary" className="text-xs">
                  Ders: {courses[selectedCourseId]?.code}
                  <button
                    onClick={() => setSelectedCourseId("")}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedExamType && (
                <Badge variant="secondary" className="text-xs">
                  Tip: {selectedExamType === "midterm" ? "Vize" : "Final"}
                  <button
                    onClick={() => setSelectedExamType("")}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchQuery.trim() !== "" && (
                <Badge variant="secondary" className="text-xs">
                  Arama: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Puanlama Bilgi Kartı */}
      <Card className="border-2 border-[#0a294e]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#0a294e] flex items-center gap-2">
            <FileText className="h-4 w-4" />
            AI Puanlama Sistemi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#0a294e]" />
              <span className="text-slate-700">
                <strong>AI Puanlama:</strong> Tek PDF yükleyin, AI otomatik okusun
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0a294e]" />
              <span className="text-slate-700">
                <strong>Toplu Yükleme:</strong> Çoklu PDF yükleyin, toplu işlem yapın
              </span>
            </div>
            <div className="text-xs text-slate-500">
              💡 4 siyah marker kare gerekli, AI otomatik puan okur
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sınav Listesi</CardTitle>
              <CardDescription>
                Sistemdeki tüm sınavlar. Puanlama için "AI Puanlama" veya "Toplu Yükleme" butonlarını kullanın.
                {filteredExams.length !== totalExams && (
                  <span className="ml-2">
                    ({filteredExams.length} / {totalExams} sınav gösteriliyor)
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Sınavlar yükleniyor...
            </div>
          ) : (
            <ExamTable exams={filteredExams} courses={courses} onDelete={fetchAllExams} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

