"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2, BookOpen, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseCard } from "@/components/courses/CourseCard";
import { CreateCourseModal } from "@/components/courses/CreateCourseModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { examApi } from "@/lib/api/examApi";
import { departmentApi, type Department } from "@/lib/api/departmentApi";

export default function DashboardCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCourses();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error: any) {
      console.error("Bölümler yüklenemedi:", error);
    }
  };

  // Refresh courses when page becomes visible (user returns from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCourses();
      }
    };

    // Listen for learning outcome deletion events
    const handleLearningOutcomeDeleted = () => {
      fetchCourses();
    };

    // Listen for exam creation/update events
    const handleExamCreated = () => {
      fetchCourses();
    };

    const handleExamUpdated = () => {
      fetchCourses();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('learningOutcomeDeleted', handleLearningOutcomeDeleted);
    window.addEventListener('examCreated', handleExamCreated);
    window.addEventListener('examUpdated', handleExamUpdated);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('learningOutcomeDeleted', handleLearningOutcomeDeleted);
      window.removeEventListener('examCreated', handleExamCreated);
      window.removeEventListener('examUpdated', handleExamUpdated);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedDepartmentId, courses]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseApi.getAll();
      
      // Fetch exam counts for each course
      const coursesWithCounts = await Promise.all(
        data.map(async (course) => {
          try {
            // Ensure course._id is a string
            let courseId: string;
            if (typeof course._id === 'string') {
              courseId = course._id;
            } else if (course._id && typeof course._id === 'object' && '_id' in course._id) {
              courseId = String((course._id as any)._id);
            } else {
              courseId = String(course._id || '');
            }
            
            if (!courseId || courseId === 'undefined' || courseId === 'null' || courseId === '[object Object]') {
              console.error('Invalid course ID:', course._id, course);
              return {
                ...course,
                learningOutcomesCount: course.learningOutcomes?.length || 0,
                studentsCount: course.students?.length || 0,
                examCount: 0,
                midtermExams: [],
                finalExams: [],
              };
            }
            
            const exams = await examApi.getByCourse(courseId);
            const midtermExams = exams.filter(e => e.examType === "midterm");
            const finalExams = exams.filter(e => e.examType === "final");
            
            return {
              ...course,
              learningOutcomesCount: course.learningOutcomes?.length || 0,
              studentsCount: course.students?.length || 0,
              examCount: exams.length,
              midtermExams: midtermExams,
              finalExams: finalExams,
            };
          } catch (error) {
            console.error(`Failed to fetch exams for course ${course._id}:`, error);
            return {
              ...course,
              learningOutcomesCount: course.learningOutcomes?.length || 0,
              studentsCount: course.students?.length || 0,
              examCount: 0,
              midtermExams: [],
              finalExams: [],
            };
          }
        })
      );
      
      setCourses(coursesWithCounts);
      setFilteredCourses(coursesWithCounts);
    } catch (error: any) {
      toast.error("Dersler yüklenemedi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Filter by department
    if (selectedDepartmentId) {
      filtered = filtered.filter((course) => {
        const deptId = typeof course.department === 'object' && course.department !== null 
          ? course.department._id 
          : course.department;
        return deptId === selectedDepartmentId;
      });
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(query) ||
          course.code.toLowerCase().includes(query) ||
          ((course as any).semester || "").toLowerCase().includes(query)
      );
    }

    setFilteredCourses(filtered);
  };

  const clearFilters = () => {
    setSelectedDepartmentId("");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedDepartmentId || searchQuery.trim() !== "";

  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;

    try {
      setIsDeleting(true);
      await courseApi.remove(selectedCourse._id);
      toast.success("Ders başarıyla silindi");
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Ders silinirken bir hata oluştu"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCourse(null);
  };

  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            
            <p className="text-muted-foreground text-base">
              Oluşturduğunuz derslerin listesi
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setCreateModalOpen(true)}
            className="h-12 text-base px-6 font-semibold bg-[#0a294e] hover:bg-[#0a294e]/90 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Ders Oluştur
          </Button>
        </div>

        {/* Filters Section */}
        <Card className="border-2 border-[#0a294e]/20">
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
              Dersleri bölüm veya arama ile filtreleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search-input" className="text-sm font-medium">
                  Arama
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-input"
                    placeholder="Ders ara… (ad, kod veya dönem)"
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

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {hasActiveFilters
                ? "Filtre kriterlerinize uygun ders bulunamadı"
                : "Henüz ders oluşturmadınız"}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {hasActiveFilters
                ? "Farklı bir filtre veya arama terimi deneyin"
                : "İlk dersinizi oluşturarak başlayın"}
            </p>
            {!hasActiveFilters && (
              <Button
                size="lg"
                onClick={() => setCreateModalOpen(true)}
                className="h-12 text-base px-6 font-semibold bg-[#0a294e] hover:bg-[#0a294e]/90 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Yeni Ders Oluştur
              </Button>
            )}
          </div>
        )}

        {/* Course Cards Grid - Responsive */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Create Course Modal */}
        <CreateCourseModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={() => {
            fetchCourses();
            setCreateModalOpen(false);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent onClose={handleDeleteCancel} className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">
                Dersi Sil
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Bu işlemi geri alamazsınız. Ders ve tüm ilişkili sınav verileri
                silinecek.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedCourse && (
              <div className="my-4 p-4 bg-muted rounded-lg">
                <p className="text-lg font-semibold">{selectedCourse.name}</p>
                <p className="text-sm text-muted-foreground">
                  Kod: {selectedCourse.code}
                </p>
              </div>
            )}
            <AlertDialogFooter>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="h-12 text-base px-6"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="h-12 text-base px-6"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  "Sil"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Skeleton Component for Loading State
function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 flex-1" />
      </div>
    </div>
  );
}
