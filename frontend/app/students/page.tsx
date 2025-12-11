"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, X, Users, Building2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentTable } from "@/components/students/StudentTable";
import { studentApi, type Student } from "@/lib/api/studentApi";
import { departmentApi, type Department } from "@/lib/api/departmentApi";

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedClassLevel, setSelectedClassLevel] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllStudents();
    loadDepartments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedDepartment, selectedClassLevel, students]);

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error: any) {
      console.error("Bölümler yüklenemedi:", error);
    }
  };

  const fetchAllStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentApi.getAll();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error: any) {
      const errorMessage = error?.isNetworkError
        ? error.message || "Backend sunucusuna bağlanılamıyor. Lütfen backend'in çalıştığından emin olun."
        : error?.response?.data?.message || "Öğrenciler yüklenirken hata oluştu";
      toast.error(errorMessage);
      console.error("Students fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter((student) => student.department === selectedDepartment);
    }

    // Filter by class level
    if (selectedClassLevel) {
      filtered = filtered.filter((student) => student.classLevel?.toString() === selectedClassLevel);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.studentNumber.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("");
    setSelectedClassLevel("");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || selectedDepartment !== "" || selectedClassLevel !== "";

  // Statistics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const uniqueDepartments = new Set(students.map(s => s.department).filter(Boolean)).size;
    const uniqueClassLevels = new Set(students.map(s => s.classLevel).filter(Boolean)).size;
    
    return {
      totalStudents,
      uniqueDepartments,
      uniqueClassLevels,
    };
  }, [students]);

  // Get unique class levels
  const classLevels = useMemo(() => {
    const levels = new Set(students.map(s => s.classLevel).filter(Boolean).sort((a, b) => (a || 0) - (b || 0)));
    return Array.from(levels);
  }, [students]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-muted-foreground text-base">
              Öğrencileri yönetin ve akademik performanslarını görüntüleyin
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => router.push("/students/new")}
            className="h-12 text-base px-6 font-semibold bg-[#0a294e] hover:bg-[#0a294e]/90 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Öğrenci Ekle
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Toplam Öğrenci</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
                </div>
                <div className="p-3 bg-[#0a294e]/10 rounded-lg">
                  <Users className="h-6 w-6 text-[#0a294e]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Farklı Bölüm</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.uniqueDepartments}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-slate-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Sınıf Seviyesi</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.uniqueClassLevels}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-slate-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtreler ve Arama</CardTitle>
            <CardDescription>
              Öğrencileri bölüm, sınıf seviyesi veya arama terimi ile filtreleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Department Filter */}
              <div className="space-y-2">
                <Label htmlFor="department-filter" className="text-sm font-medium">
                  Bölüm
                </Label>
                <Select
                  id="department-filter"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="h-10 text-sm"
                >
                  <option value="">Tüm Bölümler</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Class Level Filter */}
              <div className="space-y-2">
                <Label htmlFor="class-level-filter" className="text-sm font-medium">
                  Sınıf Seviyesi
                </Label>
                <Select
                  id="class-level-filter"
                  value={selectedClassLevel}
                  onChange={(e) => setSelectedClassLevel(e.target.value)}
                  className="h-10 text-sm"
                >
                  <option value="">Tüm Seviyeler</option>
                  {classLevels.map((level) => (
                    <option key={level} value={level?.toString()}>
                      {level}. Sınıf
                    </option>
                  ))}
                </Select>
              </div>

              {/* Search Bar */}
              <div className="relative space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">
                  Arama
                </Label>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  id="search"
                  placeholder="İsim veya öğrenci numarası..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-10 text-base rounded-lg border-2 bg-white dark:bg-slate-800 focus:border-[#0a294e] shadow-sm"
                />
              </div>
            </div>

            {/* Active Filters Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs text-muted-foreground">Aktif Filtreler:</span>
                {selectedDepartment && (
                  <Badge variant="secondary" className="text-xs">
                    Bölüm: {selectedDepartment}
                    <button
                      onClick={() => setSelectedDepartment("")}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedClassLevel && (
                  <Badge variant="secondary" className="text-xs">
                    Sınıf: {selectedClassLevel}. Sınıf
                    <button
                      onClick={() => setSelectedClassLevel("")}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Filtreleri Temizle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Öğrenci Listesi</CardTitle>
                <CardDescription>
                  Sistemdeki tüm öğrenciler. {filteredStudents.length !== students.length && (
                    <span className="ml-2">
                      ({filteredStudents.length} / {students.length} öğrenci gösteriliyor)
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium">
                  {hasActiveFilters ? "Filtrelerinize uygun öğrenci bulunamadı" : "Henüz öğrenci eklenmemiş"}
                </p>
                <p className="text-sm mt-2">
                  {hasActiveFilters ? "Farklı filtreler deneyin" : "İlk öğrencinizi ekleyerek başlayın"}
                </p>
              </div>
            ) : (
              <StudentTable students={filteredStudents} onDelete={fetchAllStudents} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

