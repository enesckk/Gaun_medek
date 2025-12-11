"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Loader2, GraduationCap, Edit, Building2, Target, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { departmentApi, type Department } from "@/lib/api/departmentApi";
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";
import { ProgramOutcomeTable } from "@/components/programOutcomes/ProgramOutcomeTable";
import { learningOutcomeApi } from "@/lib/api/learningOutcomeApi";

export default function ProgramOutcomesPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([]);
  const [filteredProgramOutcomes, setFilteredProgramOutcomes] = useState<ProgramOutcome[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [learningOutcomeCounts, setLearningOutcomeCounts] = useState<Record<string, number>>({});

  // New PO form
  const [newPOCode, setNewPOCode] = useState("");
  const [newPODescription, setNewPODescription] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadProgramOutcomes();
    } else {
      setProgramOutcomes([]);
      setFilteredProgramOutcomes([]);
    }
  }, [selectedDepartmentId]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setFilteredProgramOutcomes(programOutcomes);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = programOutcomes.filter((po) => {
      const code = (po.code || "").toLowerCase();
      const description = (po.description || "").toLowerCase();
      return code.includes(query) || description.includes(query);
    });
    setFilteredProgramOutcomes(filtered);
  }, [searchQuery, programOutcomes]);

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error: any) {
      toast.error("Bölümler yüklenemedi");
      console.error(error);
    }
  };

  const loadProgramOutcomes = async () => {
    if (!selectedDepartmentId) return;
    try {
      setLoadingPOs(true);
      const data = await programOutcomeApi.getByDepartment(selectedDepartmentId);
      setProgramOutcomes(data || []);
      setFilteredProgramOutcomes(data || []);
      await calculateLearningOutcomeCounts(data || []);
    } catch (error: any) {
      toast.error("Program çıktıları yüklenemedi");
      console.error(error);
      setProgramOutcomes([]);
      setFilteredProgramOutcomes([]);
    } finally {
      setLoadingPOs(false);
    }
  };

  const calculateLearningOutcomeCounts = async (pos: ProgramOutcome[]) => {
    try {
      const counts: Record<string, number> = {};
      
      // Initialize counts for all POs
      pos.forEach((po) => {
        counts[po.code] = 0;
      });
      
      // Get all courses for the selected department
      const { courseApi } = await import("@/lib/api/courseApi");
      const allCourses = await courseApi.getAll();
      const deptCourses = allCourses.filter((c: any) => 
        c.department?._id === selectedDepartmentId || c.department === selectedDepartmentId
      );

      for (const course of deptCourses) {
        try {
          const outcomes = await learningOutcomeApi.getByCourse(course._id);
          for (const outcome of outcomes) {
            // mappedProgramOutcomes (backend) veya programOutcomes (ders içi gömülü) olabilir
            const mappedPOsRaw =
              (outcome as any).mappedProgramOutcomes ||
              (outcome as any).programOutcomes ||
              [];
            const mappedPOCodes = (Array.isArray(mappedPOsRaw) ? mappedPOsRaw : [])
              .map((mpo: any) =>
                typeof mpo === "string"
                  ? mpo
                  : mpo?.code
                    ? mpo.code
                    : mpo?._id
                      ? mpo._id
                      : ""
              )
              .map((c: string) => c?.trim().toLowerCase())
              .filter(Boolean);

            // Eğer mappedPOs boş geldiyse, dersin gömülü learningOutcomes içinden de kontrol et
            let fallbackPOCodes: string[] = [];
            if (mappedPOCodes.length === 0 && Array.isArray((course as any).learningOutcomes)) {
              const embeddedLO = (course as any).learningOutcomes.find(
                (lo: any) => lo.code === outcome.code
              );
              if (embeddedLO?.programOutcomes) {
                fallbackPOCodes = embeddedLO.programOutcomes
                  .map((po: any) => (typeof po === "string" ? po : po?.code || po?._id || ""))
                  .map((c: string) => c?.trim().toLowerCase())
                  .filter(Boolean);
              }
            }

            const allPOCodes = [...mappedPOCodes, ...fallbackPOCodes];

            for (const po of pos) {
              const poCodeNormalized = (po.code || "").trim().toLowerCase();
              // Check if this PO is mapped to this outcome
              if (allPOCodes.includes(poCodeNormalized)) {
                counts[po.code] = (counts[po.code] || 0) + 1;
              }
            }
          }
        } catch (e) {
          console.error(`Failed to load outcomes for course ${course._id}`);
        }
      }
      
      setLearningOutcomeCounts(counts);
    } catch (error) {
      console.error("Failed to calculate learning outcome counts:", error);
    }
  };

  const handleAddPO = async () => {
    if (!selectedDepartmentId) {
      toast.error("Lütfen önce bir bölüm seçin");
      return;
    }
    if (!newPOCode.trim() || !newPODescription.trim()) {
      toast.error("PÇ kodu ve açıklama gereklidir");
      return;
    }

    try {
      setIsLoading(true);
      await programOutcomeApi.add(selectedDepartmentId, {
        code: newPOCode.trim(),
        description: newPODescription.trim(),
      });
      toast.success("Program çıktısı eklendi");
      setNewPOCode("");
      setNewPODescription("");
      await loadProgramOutcomes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Program çıktısı eklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSuccess = () => {
    loadProgramOutcomes();
  };

  const selectedDepartment = departments.find((d) => d._id === selectedDepartmentId);
  const totalPOs = programOutcomes.length;
  const totalMappedLOs = Object.values(learningOutcomeCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-base">
            Her bölüm için program çıktılarını tanımlayın, yönetin ve öğrenme çıktıları ile eşleştirin
          </p>
        </div>
      </div>

      {/* Stats Cards - Show when department is selected */}
      {selectedDepartmentId && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Program Çıktısı</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPOs}</div>
              <p className="text-xs text-muted-foreground">
                {selectedDepartment?.name} bölümü için tanımlı PÇ sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eşlenen Öğrenme Çıktıları</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMappedLOs}</div>
              <p className="text-xs text-muted-foreground">
                Bu PÇ'lere eşlenen toplam ÖÇ sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bölüm</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedDepartment?.name || "-"}</div>
              <p className="text-xs text-muted-foreground">
                Seçili bölüm
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Selection */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#0a294e]" />
            <CardTitle>Bölüm Seç</CardTitle>
          </div>
          <CardDescription>
            Program çıktılarını yönetmek istediğiniz bölümü seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="department-select" className="text-sm font-medium">
              Bölüm <span className="text-red-500">*</span>
            </Label>
            <Select
              id="department-select"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className="h-10 text-sm"
            >
              <option value="">Bölüm Seçin</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Empty State - When no department is selected */}
      {!selectedDepartmentId && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-[#0a294e]/10 flex items-center justify-center mb-4">
              <GraduationCap className="h-10 w-10 text-[#0a294e]" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Program Çıktıları Yönetimi
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Program çıktılarını görüntülemek ve yönetmek için lütfen yukarıdan bir bölüm seçin.
            </p>
            <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">MÜDEK Program Çıktıları</p>
                <p>
                  Program çıktıları (PÇ), mezunların sahip olması gereken yetkinlikleri tanımlar. 
                  Her bölüm için PÇ'leri tanımlayıp, öğrenme çıktıları (ÖÇ) ile eşleştirebilirsiniz.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDepartmentId && (
        <>
          {/* Add New PO */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#0a294e]" />
                <CardTitle>Yeni Program Çıktısı Ekle</CardTitle>
              </div>
              <CardDescription>
                {selectedDepartment?.name} bölümü için yeni bir program çıktısı ekleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po-code" className="text-sm font-medium">
                    PÇ Kodu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="po-code"
                    value={newPOCode}
                    onChange={(e) => setNewPOCode(e.target.value.toUpperCase())}
                    placeholder="Örn: PÇ1"
                    disabled={isLoading}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="po-description" className="text-sm font-medium">
                    Açıklama <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="po-description"
                    value={newPODescription}
                    onChange={(e) => setNewPODescription(e.target.value)}
                    placeholder="Örn: Matematiksel analiz yapabilme"
                    disabled={isLoading}
                    className="h-10 text-sm"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddPO}
                disabled={isLoading || !newPOCode.trim() || !newPODescription.trim()}
                className="h-10 px-6 bg-[#0a294e] hover:bg-[#0a294e]/90 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ekleniyor...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Program Çıktısı Ekle
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* PO List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-5 w-5 text-[#0a294e]" />
                    <CardTitle>Program Çıktıları Listesi</CardTitle>
                    {totalPOs > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {totalPOs} adet
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {selectedDepartment?.name} bölümü için tanımlı program çıktıları. Her PÇ kodunun yanında kaç öğrenme çıktısına eşlendiği gösterilmektedir.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="PÇ kodu veya açıklamaya göre ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loadingPOs ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-3" />
                  Program çıktıları yükleniyor...
                </div>
              ) : (
                <ProgramOutcomeTable
                  programOutcomes={filteredProgramOutcomes}
                  learningOutcomeCounts={learningOutcomeCounts}
                  departmentId={selectedDepartmentId}
                  onDelete={handleDeleteSuccess}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

