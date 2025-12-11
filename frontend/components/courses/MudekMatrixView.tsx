"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save, Download, Target, GraduationCap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";
import { courseApi, type Course } from "@/lib/api/courseApi";

interface MudekMatrixViewProps {
  courseId: string;
  course: Course;
  departmentId: string;
  onUpdate: () => void;
}

export function MudekMatrixView({
  courseId,
  course,
  departmentId,
  onUpdate,
}: MudekMatrixViewProps) {
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingPOs, setLoadingPOs] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadProgramOutcomes();
    loadLearningOutcomes();
  }, [departmentId, course]);

  const loadProgramOutcomes = async () => {
    try {
      setLoadingPOs(true);
      const data = await programOutcomeApi.getByDepartment(departmentId);
      setProgramOutcomes(data || []);
    } catch (error: any) {
      toast.error("Program çıktıları yüklenemedi");
      console.error(error);
    } finally {
      setLoadingPOs(false);
    }
  };

  const loadLearningOutcomes = () => {
    if (course.learningOutcomes && Array.isArray(course.learningOutcomes)) {
      setLearningOutcomes(
        course.learningOutcomes.map((lo: any) => ({
          code: lo.code || "",
          description: lo.description || "",
          programOutcomes: lo.programOutcomes || lo.relatedProgramOutcomes || [],
        }))
      );
      setHasChanges(false);
    }
  };

  const toggleMapping = (loIndex: number, poCode: string) => {
    const updated = [...learningOutcomes];
    const currentPOs = updated[loIndex].programOutcomes || [];
    updated[loIndex].programOutcomes = currentPOs.includes(poCode)
      ? currentPOs.filter((code: string) => code !== poCode)
      : [...currentPOs, poCode];
    setLearningOutcomes(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        learningOutcomes: learningOutcomes.map((lo) => ({
          code: lo.code.trim(),
          description: lo.description.trim(),
          programOutcomes: lo.programOutcomes || [],
        })),
      };

      await courseApi.updateCourse(courseId, payload);
      toast.success("ÖÇ → PÇ eşlemesi başarıyla kaydedildi");
      setHasChanges(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Eşleme kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  // İstatistikler hesapla
  const totalMappings = learningOutcomes.reduce(
    (sum, lo) => sum + (lo.programOutcomes?.length || 0),
    0
  );
  const avgMappingsPerLO = learningOutcomes.length > 0 
    ? (totalMappings / learningOutcomes.length).toFixed(1)
    : "0";
  const coverageByPO = programOutcomes.map((po) => ({
    code: po.code,
    count: learningOutcomes.filter((lo) => 
      lo.programOutcomes?.includes(po.code)
    ).length,
    percentage: learningOutcomes.length > 0
      ? ((learningOutcomes.filter((lo) => lo.programOutcomes?.includes(po.code)).length / learningOutcomes.length) * 100).toFixed(0)
      : "0",
  }));

  if (loadingPOs) {
    return (
      <Card className="border-2 border-[#0a294e]/20">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0a294e] mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Program çıktıları yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (programOutcomes.length === 0) {
    return (
      <Card className="border-2 border-yellow-200">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Bu bölüm için henüz program çıktısı tanımlanmamış.
          </p>
          <Button
            onClick={() => window.open("/dashboard/program-outcomes", "_blank")}
            variant="outline"
            className="h-11"
          >
            Program Çıktıları Yönetimi
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (learningOutcomes.length === 0) {
    return (
      <Card className="border-2 border-yellow-200">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-muted-foreground">
            Bu ders için henüz öğrenme çıktısı tanımlanmamış. Lütfen dersi düzenleyip öğrenme çıktıları ekleyin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-[#0a294e]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-[#0a294e] flex items-center gap-2">
                <Target className="h-6 w-6" />
                MÜDEK ÖÇ → PÇ Eşleme Matrisi
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Öğrenme Çıktıları (ÖÇ) ve Program Çıktıları (PÇ) arasındaki ilişki matrisi. 
                Matris üzerinden tıklayarak eşleme yapabilirsiniz.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="h-11 px-6 bg-[#0a294e] hover:bg-[#0a294e]/90 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="h-11 px-5"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF İndir
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-[#0a294e]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-[#0a294e]" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam ÖÇ</p>
                <p className="text-2xl font-bold text-[#0a294e]">{learningOutcomes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#0a294e]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-[#0a294e]" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam PÇ</p>
                <p className="text-2xl font-bold text-[#0a294e]">{programOutcomes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#0a294e]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Info className="h-8 w-8 text-[#0a294e]" />
              <div>
                <p className="text-sm text-muted-foreground">Ortalama Eşleme/ÖÇ</p>
                <p className="text-2xl font-bold text-[#0a294e]">{avgMappingsPerLO}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matris Tablosu */}
      <Card className="border-2 border-[#0a294e]/20">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table className="border-2">
              <TableHeader>
                <TableRow className="bg-[#0a294e] hover:bg-[#0a294e]">
                  <TableHead className="text-white font-bold text-center min-w-[120px] border-r-2 border-white/20">
                    ÖÇ Kodu
                  </TableHead>
                  <TableHead className="text-white font-bold min-w-[300px] border-r-2 border-white/20">
                    ÖÇ Açıklaması
                  </TableHead>
                  {programOutcomes.map((po) => (
                    <TableHead
                      key={po.code}
                      className="text-white font-bold text-center min-w-[100px] border-r-2 border-white/20 last:border-r-0"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{po.code}</span>
                        <span className="text-xs font-normal opacity-90">
                          {coverageByPO.find((c) => c.code === po.code)?.count || 0} ÖÇ
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {learningOutcomes.map((lo, loIndex) => {
                  const selectedPOs = lo.programOutcomes || [];
                  return (
                    <TableRow
                      key={loIndex}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-bold text-center bg-gray-100 border-r-2">
                        <Badge variant="default" className="bg-[#0a294e] text-white">
                          {lo.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="border-r-2">
                        <p className="text-sm">{lo.description}</p>
                        {selectedPOs.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {selectedPOs.map((poCode: string) => (
                              <Badge
                                key={poCode}
                                variant="outline"
                                className="text-xs bg-slate-50 border-slate-300 text-slate-700"
                              >
                                {poCode}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      {programOutcomes.map((po) => {
                        const isMapped = selectedPOs.includes(po.code);
                        return (
                          <TableCell
                            key={po.code}
                            className="text-center border-r-2 last:border-r-0 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => toggleMapping(loIndex, po.code)}
                          >
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={isMapped}
                                className="h-6 w-6"
                                readOnly
                              />
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* PÇ Kapsam Analizi */}
      <Card className="border-2 border-[#0a294e]/20">
        <CardHeader>
          <CardTitle className="text-xl text-[#0a294e]">PÇ Kapsam Analizi</CardTitle>
          <CardDescription>
            Her Program Çıktısının kaç Öğrenme Çıktısı tarafından kapsandığını gösterir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {coverageByPO.map((coverage) => (
              <div
                key={coverage.code}
                className="p-3 border-2 border-slate-200 rounded-lg bg-slate-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-white">
                    {coverage.code}
                  </Badge>
                  <span className="text-sm font-semibold text-[#0a294e]">
                    {coverage.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-[#0a294e] h-2 rounded-full transition-all"
                    style={{ width: `${coverage.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {coverage.count} / {learningOutcomes.length} ÖÇ
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bilgi Notu */}
      <Card className="border-2 border-[#0a294e]/20 bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#0a294e] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold mb-1">Kullanım Kılavuzu:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Matris üzerindeki checkbox'lara tıklayarak ÖÇ → PÇ eşlemesi yapabilirsiniz</li>
                <li>Bir ÖÇ, birden fazla PÇ'ye eşlenebilir</li>
                <li>Değişiklikleri kaydetmek için "Değişiklikleri Kaydet" butonuna tıklayın</li>
                <li>Matrisi PDF olarak indirmek için "PDF İndir" butonunu kullanın</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

